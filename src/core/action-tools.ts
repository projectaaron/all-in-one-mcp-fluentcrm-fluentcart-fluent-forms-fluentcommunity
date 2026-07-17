/** Individual-tool registration: every action of a ToolSpec becomes its own
 *  MCP tool with a focused schema — named path params (required), body only
 *  on writes, pagination only on lists, confirm only on destructive actions.
 *  The area (the old grouped tool name, e.g. `crm_contacts`) survives as the
 *  tool-name prefix so related tools sort and search together. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  executeAction,
  isListAction,
  placeholdersOf,
  OUTPUT_SHAPE,
  type ToolArgs,
  type ToolRuntime,
} from './tool-factory.js';
import type { EndpointDef, ToolSpec } from './types.js';

/** Crude stem for redundancy checks — both sides get the same treatment, so
 *  companies/company→company, orders/order→order, templates/template→templat. */
const norm = (w: string) => w.replace(/ies$/, 'y').replace(/e?s$/, '').replace(/e$/, '');

/** Derive each action's individual tool name: `<area>_<action minus words the
 *  area name already carries>` (crm_contacts + create_contact →
 *  crm_contacts_create). When stripping would make two actions collide
 *  (delete_contact vs delete_contacts), every collider falls back to the full
 *  `<area>_<action>` form — deterministic and provably unique, since action
 *  names are unique within a spec and stripped names cannot equal a full name
 *  without also colliding as stripped names. */
export function individualNamesFor(spec: ToolSpec): Record<string, string> {
  const areaWords = new Set(spec.name.split('_').map(norm));
  const candidates: Record<string, string> = {};
  const claims = new Map<string, number>();
  for (const action of Object.keys(spec.actions)) {
    // The leading verb always survives (list_lists in crm_lists must become
    // crm_lists_list, not an empty stem); later words drop when the area
    // name already carries them.
    const kept = action.split('_').filter((w, i) => i === 0 || !areaWords.has(norm(w)));
    candidates[action] = `${spec.name}_${kept.join('_')}`;
    claims.set(candidates[action], (claims.get(candidates[action]) ?? 0) + 1);
  }
  const names: Record<string, string> = {};
  for (const [action, candidate] of Object.entries(candidates)) {
    names[action] = claims.get(candidate)! > 1 ? `${spec.name}_${action}` : candidate;
  }
  const unique = new Set(Object.values(names));
  if (unique.size !== Object.keys(names).length) {
    throw new Error(`individualNamesFor(${spec.name}): duplicate tool names generated`);
  }
  for (const n of unique) {
    if (n.length > 64) throw new Error(`individualNamesFor(${spec.name}): "${n}" exceeds 64 characters`);
    if (!/^[a-z][a-z0-9_]*$/.test(n)) throw new Error(`individualNamesFor(${spec.name}): "${n}" has invalid characters`);
  }
  return names;
}

/** Focused input schema for one action: only the parameters it actually uses. */
export function buildActionInputShape(actionName: string, def: EndpointDef) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const p of placeholdersOf(def.path)) {
    shape[p] = z
      .union([z.string(), z.number()])
      .describe(`Required path parameter "${p}" of ${def.method} ${def.path}`);
  }
  shape.query = z
    .record(z.unknown())
    .optional()
    .describe('Query-string parameters (search, filters, sorting, with[]…), e.g. {"search": "jane@example.com"}');
  if (def.method !== 'GET' && def.method !== 'HEAD') {
    shape.body = z
      .record(z.unknown())
      .optional()
      .describe('JSON request body, e.g. {"title": "Spring sale"} — schemas in docs/api-reference/');
  }
  if (isListAction(actionName) && def.method === 'GET') {
    shape.page = z.number().int().min(1).optional().describe('Page number (default 1)');
    shape.per_page = z.number().int().min(1).max(100).optional().describe('Items per page (default 20)');
  }
  shape.fields = z
    .array(z.string())
    .optional()
    .describe('Return only these fields per record, e.g. ["id","status","total_amount"]');
  shape.detail = z
    .enum(['summary', 'full'])
    .optional()
    .describe('"summary" (default) returns key fields and truncates long values; "full" returns the raw API response');
  if (def.destructive) {
    shape.confirm = z
      .boolean()
      .optional()
      .describe('Must be true to execute this hard-to-undo action. Without it the tool only explains what would happen.');
  }
  return shape;
}

/** One-sentence description: what it does, where it lives, how it's called. */
export function actionDescription(spec: ToolSpec, def: EndpointDef, ctx: { productTitle: string }): string {
  const summary = def.summary.replace(/\.?\s*$/, '');
  const parts = [`${summary}.`, `[${ctx.productTitle} · ${spec.name}] ${def.method} ${def.path}.`];
  if (def.destructive) parts.push('⚠ Hard to undo — requires confirm:true.');
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
};

/** Adapter: individual-tool args (named path params at the top level) →
 *  the shared executor's ToolArgs. Exported so tests can drive it directly. */
export function makeActionHandler(spec: ToolSpec, action: string, runtime: ToolRuntime, label: string) {
  const def = spec.actions[action];
  const placeholders = placeholdersOf(def.path);
  return async (args: ActionArgs) => {
    const path_params: Record<string, string | number> = {};
    for (const p of placeholders) {
      const v = args[p];
      if (typeof v === 'string' || typeof v === 'number') path_params[p] = v;
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
    };
    return executeAction(def, action, toolArgs, runtime, label);
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
    server.registerTool(
      name,
      {
        description: actionDescription(spec, def, ctx),
        inputSchema: buildActionInputShape(action, def),
        outputSchema: OUTPUT_SHAPE,
        annotations: actionAnnotations(spec, def),
      },
      makeActionHandler(spec, action, runtime, name) as Parameters<typeof server.registerTool>[2]
    );
  }
  return Object.values(names);
}
