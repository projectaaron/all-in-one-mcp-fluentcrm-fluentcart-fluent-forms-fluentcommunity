/** Individual-tool registration: every action of a ToolSpec becomes its own
 *  MCP tool with a focused schema — named path params (required), body only
 *  on writes, pagination only on lists, confirm only on destructive actions.
 *  The area (the old grouped tool name, e.g. `crm_contacts`) survives as the
 *  tool-name prefix so related tools sort and search together. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  errResult,
  executeAction,
  isListAction,
  lockedRefusal,
  placeholdersOf,
  OUTPUT_SHAPE,
  type ToolArgs,
  type ToolRuntime,
} from './tool-factory.js';
import { pairedReadFor } from './merge.js';
import type { EndpointDef, ToolSpec } from './types.js';

/** Crude stem for redundancy checks — both sides get the same treatment, so
 *  companies/company→company, orders/order→order, templates/template→templat. */
const norm = (w: string) => w.replace(/ies$/, 'y').replace(/e?s$/, '').replace(/e$/, '');

/** Memoized per spec — specs are module-lifetime singletons, and the
 *  Cloudflare worker rebuilds the server on every request. */
const NAME_CACHE = new WeakMap<ToolSpec, Record<string, string>>();

/** Derive each action's individual tool name: `<area>_<action minus words the
 *  area name already carries>` (crm_contacts + create_contact →
 *  crm_contacts_create). When stripping would make two actions collide
 *  (delete_contact vs delete_contacts), every collider falls back to the full
 *  `<area>_<action>` form — deterministic and provably unique, since action
 *  names are unique within a spec and stripped names cannot equal a full name
 *  without also colliding as stripped names. Tool names are external API: an
 *  endpoint can pin its name for good via a `toolName` override (set in
 *  tool-map.json's operationOverrides), which wins over the stemmer. */
export function individualNamesFor(spec: ToolSpec): Record<string, string> {
  const cached = NAME_CACHE.get(spec);
  if (cached) return cached;

  const areaWords = new Set(spec.name.split('_').map(norm));
  const candidates: Record<string, string> = {};
  const claims = new Map<string, number>();
  for (const [action, def] of Object.entries(spec.actions)) {
    if (def.toolName) {
      candidates[action] = def.toolName;
      claims.set(def.toolName, (claims.get(def.toolName) ?? 0) + 1);
      continue;
    }
    // Drop words the area name already carries; if that empties the action
    // (list_lists in crm_lists), keep the leading verb: crm_lists_list.
    const words = action.split('_');
    const kept = words.filter((w) => !areaWords.has(norm(w)));
    candidates[action] = `${spec.name}_${(kept.length ? kept : [words[0]]).join('_')}`;
    claims.set(candidates[action], (claims.get(candidates[action]) ?? 0) + 1);
  }
  const names: Record<string, string> = {};
  for (const [action, candidate] of Object.entries(candidates)) {
    names[action] =
      claims.get(candidate)! > 1 && !spec.actions[action].toolName ? `${spec.name}_${action}` : candidate;
  }
  const unique = new Set(Object.values(names));
  if (unique.size !== Object.keys(names).length) {
    throw new Error(`individualNamesFor(${spec.name}): duplicate tool names generated`);
  }
  for (const n of unique) {
    if (n.length > 64) throw new Error(`individualNamesFor(${spec.name}): "${n}" exceeds 64 characters`);
    if (!/^[a-z][a-z0-9_]*$/.test(n)) throw new Error(`individualNamesFor(${spec.name}): "${n}" has invalid characters`);
  }
  NAME_CACHE.set(spec, names);
  return names;
}

// Zod schemas are immutable — the action-invariant fields are singletons
// shared by all ~700 tools instead of being rebuilt per registration (which
// the Cloudflare worker would otherwise pay on every request).
const QUERY_FIELD = z
  .record(z.unknown())
  .optional()
  .describe('Query-string parameters (search, filters, sorting, with[]…), e.g. {"search": "jane@example.com"}');
const BODY_FIELD = z
  .record(z.unknown())
  .optional()
  .describe('JSON request body, e.g. {"title": "Spring sale"} — schemas are in the product\'s official developer docs (linked from docs/api-reference/<product>.md)');
const PAGE_FIELD = z.number().int().min(1).optional().describe('Page number (default 1)');
const PER_PAGE_FIELD = z.number().int().min(1).max(100).optional().describe('Items per page (default 20)');
const FIELDS_FIELD = z
  .array(z.string())
  .optional()
  .describe('Return only these fields per record, e.g. ["id","status","total_amount"]');
const DETAIL_FIELD = z
  .enum(['summary', 'full'])
  .optional()
  .describe('"summary" (default) returns key fields and truncates long values; "full" returns the raw API response');
const CONFIRM_FIELD = z
  .boolean()
  .optional()
  .describe('Must be true to execute this hard-to-undo action. Without it the tool only explains what would happen.');
const CONFIRM_REPLACE_FIELD = z
  .boolean()
  .optional()
  .describe(
    'Required (true) for mode:"replace" — acknowledges that fields omitted from the body may be cleared. Not needed in merge mode.'
  );
const DRY_RUN_FIELD = z
  .boolean()
  .optional()
  .describe('Preview without writing: returns the exact request (and, on merge-capable updates, the field diff) that would be applied.');
const MODE_FIELD = z
  .enum(['merge', 'replace'])
  .optional()
  .describe(
    '"merge" (default): your partial body is deep-merged onto the current record, so omitted fields are preserved. "replace": your body is sent as the complete record — omitted fields may be cleared (requires confirm:true).'
  );
const IF_UNMODIFIED_FIELD = z
  .string()
  .optional()
  .describe(
    'Optimistic concurrency: refuse the write when the record\'s updated_at no longer equals this value (as returned by a prior read), e.g. "2026-08-15 19:25:54".'
  );

/** Parameter names owned by the envelope — a path placeholder may not
 *  shadow them, or the placeholder schema would be silently clobbered. */
const RESERVED_PARAMS = new Set([
  'action',
  'query',
  'body',
  'page',
  'per_page',
  'fields',
  'detail',
  'confirm',
  'mode',
  'dry_run',
  'if_unmodified_since',
]);

const SHAPE_CACHE = new WeakMap<EndpointDef, Map<string, Record<string, z.ZodTypeAny>>>();

/** Focused input schema for one action: only the parameters it actually
 *  uses. Memoized per (endpoint, action+pairing) — defs are module-lifetime
 *  singletons, and the shape depends on the action name too (pagination). */
export function buildActionInputShape(actionName: string, def: EndpointDef, paired = false) {
  const cacheKey = paired ? `${actionName}|paired` : actionName;
  let perDef = SHAPE_CACHE.get(def);
  const cached = perDef?.get(cacheKey);
  if (cached) return cached;

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const p of placeholdersOf(def.path)) {
    if (RESERVED_PARAMS.has(p)) {
      throw new Error(
        `buildActionInputShape(${actionName}): path placeholder {${p}} in ${def.path} collides with the reserved "${p}" parameter — rename it via the endpoint map`
      );
    }
    shape[p] = z
      .union([z.string(), z.number()])
      .describe(`Required path parameter "${p}" of ${def.method} ${def.path}`);
  }
  shape.query = QUERY_FIELD;
  const isWrite = def.method !== 'GET' && def.method !== 'HEAD';
  if (isWrite) shape.body = BODY_FIELD;
  // Every GET gets pagination params (plenty of paginated collections hide
  // behind get_* names — contact emails, funnel subscribers, …), as do
  // list/search actions on other methods. Defaults only apply to GET lists.
  if (def.method === 'GET' || isListAction(actionName)) {
    shape.page = PAGE_FIELD;
    shape.per_page = PER_PAGE_FIELD;
  }
  shape.fields = FIELDS_FIELD;
  shape.detail = DETAIL_FIELD;
  if (isWrite) shape.dry_run = DRY_RUN_FIELD;
  if (paired) {
    shape.mode = MODE_FIELD;
    shape.if_unmodified_since = IF_UNMODIFIED_FIELD;
  }
  if (def.destructive) shape.confirm = CONFIRM_FIELD;
  else if (paired) shape.confirm = CONFIRM_REPLACE_FIELD;

  if (!perDef) {
    perDef = new Map();
    SHAPE_CACHE.set(def, perDef);
  }
  perDef.set(cacheKey, shape);
  return shape;
}

/** One-sentence description: what it does, where it lives, how it's called.
 *  Every write states its body semantics — [merge] endpoints preserve omitted
 *  fields; [replace] endpoints may clear them (the plugins treat updates as
 *  full replaces and report 200 either way). */
export function actionDescription(
  spec: ToolSpec,
  def: EndpointDef,
  ctx: { productTitle: string },
  paired = false
): string {
  const summary = def.summary.replace(/\.?\s*$/, '');
  const parts = [`${summary}.`, `[${ctx.productTitle} · ${spec.name}] ${def.method} ${def.path}.`];
  if (def.destructive) parts.push('⚠ Hard to undo — requires confirm:true.');
  if (paired) {
    parts.push('[merge] Partial bodies are safe: omitted fields are read from the current record and preserved, and the response reports what actually changed.');
  } else if (def.method === 'PUT' || def.method === 'PATCH') {
    parts.push('[replace — omitted fields may be cleared] Send the complete object; dry_run:true previews the request.');
  }
  if (def.bodyNote) parts.push(def.bodyNote);
  if (spec.note) parts.push(spec.note);
  return parts.join(' ');
}

/** Per-action annotations — accurate per tool, unlike the grouped surface
 *  where one write action forced readOnlyHint:false on 30 reads. */
export function actionAnnotations(spec: ToolSpec, def: EndpointDef) {
  const read = (def.method === 'GET' || def.method === 'HEAD') && !def.destructive;
  return {
    title: def.summary,
    readOnlyHint: read,
    destructiveHint: def.destructive,
    idempotentHint: spec.idempotent === true,
    openWorldHint: true,
  };
}

type ActionArgs = Record<string, unknown> & {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  page?: number;
  per_page?: number;
  fields?: string[];
  detail?: 'summary' | 'full';
  confirm?: boolean;
  mode?: 'merge' | 'replace';
  dry_run?: boolean;
  if_unmodified_since?: string;
};

/** Adapter: individual-tool args (named path params at the top level) →
 *  the shared executor's ToolArgs. Exported so tests can drive it directly. */
export function makeActionHandler(spec: ToolSpec, action: string, runtime: ToolRuntime, label: string) {
  const def = spec.actions[action];
  const placeholders = placeholdersOf(def.path);
  return async (args: ActionArgs) => {
    if (runtime.lockedTools?.has(label)) return lockedRefusal(label);
    const path_params: Record<string, string | number> = {};
    for (const p of placeholders) {
      const v = args[p];
      if ((typeof v === 'string' && v !== '') || typeof v === 'number') path_params[p] = v;
    }
    // Individual-mode advice must name the tool's own parameters — the shared
    // executor's fallback message suggests id/path_params, which don't exist
    // on this schema and would send a session into a retry loop.
    const missing = placeholders.filter((p) => path_params[p] === undefined);
    if (missing.length) {
      return errResult(
        `Missing required parameter${missing.length > 1 ? 's' : ''} for ${label}: ${missing.join(', ')} — pass ${
          missing.length > 1 ? 'them' : 'it'
        } as top-level argument${missing.length > 1 ? 's' : ''} (not inside query/body). Endpoint: ${def.method} ${def.path}`
      );
    }
    const toolArgs: ToolArgs = {
      action,
      path_params,
      query: args.query,
      body: args.body,
      page: args.page,
      per_page: args.per_page,
      fields: args.fields,
      detail: args.detail,
      confirm: args.confirm,
      mode: args.mode,
      dry_run: args.dry_run,
      if_unmodified_since: args.if_unmodified_since,
    };
    return executeAction(def, action, toolArgs, runtime, label, spec);
  };
}

/** Register every action of a spec as its own tool. Returns the tool names. */
export function registerActionTools(
  server: McpServer,
  spec: ToolSpec,
  runtime: ToolRuntime,
  ctx: { productTitle: string }
): string[] {
  const names = individualNamesFor(spec);
  for (const [action, def] of Object.entries(spec.actions)) {
    const name = names[action];
    const locked = runtime.lockedTools?.has(name) === true;
    const paired = pairedReadFor(spec, action) !== undefined;
    server.registerTool(
      name,
      {
        description:
          actionDescription(spec, def, ctx, paired) +
          (locked ? ' 🔒 LOCKED on this server — calls always refuse; admin-controlled via FLUENT_LOCKED_TOOLS.' : ''),
        inputSchema: buildActionInputShape(action, def, paired),
        outputSchema: OUTPUT_SHAPE,
        annotations: actionAnnotations(spec, def),
      },
      makeActionHandler(spec, action, runtime, name) as Parameters<typeof server.registerTool>[2]
    );
  }
  return Object.values(names);
}
