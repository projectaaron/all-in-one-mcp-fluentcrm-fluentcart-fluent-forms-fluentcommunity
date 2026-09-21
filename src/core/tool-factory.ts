/** Turns a declarative ToolSpec into a registered MCP tool: Zod schema
 *  assembly, action routing, path substitution, pagination defaults,
 *  confirm-gating for destructive actions, response shaping. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FluentClient } from './http.js';
import { FluentApiError } from './errors.js';
import {
  buildMergedBody,
  diffRecords,
  pairedReadFor,
  recordUpdatedAt,
  verifyWrite,
  type MergedBody,
  type Verification,
} from './merge.js';
import { shapeResponse, textSummary } from './shape.js';
import type { EndpointDef, ToolSpec } from './types.js';

const PLACEHOLDER_RE = /\{([^}]+)\}/g;

export function placeholdersOf(path: string): string[] {
  return [...path.matchAll(PLACEHOLDER_RE)].map((m) => m[1]);
}

/** Compact per-action signature list for the `action` param description:
 *  `list_orders; get_order(order_id); delete_order(order_id)⚠` */
export function actionSignatures(actions: Record<string, EndpointDef>): string {
  return Object.entries(actions)
    .map(([name, def]) => {
      const params = placeholdersOf(def.path);
      return `${name}${params.length ? `(${params.join(',')})` : ''}${def.destructive ? '⚠' : ''}`;
    })
    .join('; ');
}

export function isListAction(name: string): boolean {
  return /^(list|search|get_all)/.test(name);
}

/** Tool-level annotations derived from the action set. */
export function annotationsFor(spec: ToolSpec) {
  const defs = Object.values(spec.actions);
  const readOnly = defs.every((d) => d.method === 'GET' || d.method === 'HEAD');
  const destructive = defs.some((d) => d.destructive);
  return {
    readOnlyHint: readOnly,
    destructiveHint: destructive,
    // Conservative default; a tool opts in via its map when every write
    // action is safely repeatable.
    idempotentHint: spec.idempotent === true,
    openWorldHint: true,
  };
}

export const OUTPUT_SHAPE = {
  ok: z.boolean().describe('True when the API call succeeded'),
  status: z.number().describe('HTTP status code from the WordPress REST API'),
  action: z.string().describe('The action that was executed'),
  data: z.unknown().optional().describe('Response payload (summary-projected unless detail:"full")'),
  pagination: z
    .object({
      page: z.number().optional(),
      per_page: z.number().optional(),
      total: z.number().optional(),
      total_pages: z.number().optional(),
    })
    .optional()
    .describe('Present on paginated list responses'),
  note: z.string().optional().describe('Server-side remark, e.g. that results were summarized'),
  mode: z
    .enum(['merge', 'replace'])
    .optional()
    .describe('How the write body was applied: "merge" (partial body deep-merged onto the current record) or "replace"'),
  dry_run: z.boolean().optional().describe('True when nothing was written — the response describes what would happen'),
  would_send: z.unknown().optional().describe('Dry run only: the exact request that would be sent'),
  changed: z
    .record(z.object({ from: z.unknown(), to: z.unknown() }))
    .optional()
    .describe('Post-write verification: fields that differ between the record before and after the write, by dotted path'),
  warnings: z
    .array(z.string())
    .optional()
    .describe('Unintended-looking effects: fields that changed without being in your request body, or supplied fields that did not take effect'),
  stored: z
    .unknown()
    .optional()
    .describe('Read-back of the record as the plugin itself lists it after the write — proof the write landed where the plugin reads it'),
};

export interface ToolRuntime {
  client: FluentClient;
  summaryFields?: string[];
  /** Tools that refuse unconditionally (canonical individual tool names). */
  lockedTools?: Set<string>;
  /** action → canonical individual tool name, for grouped-mode lock checks. */
  canonicalNames?: Record<string, string>;
}

export function buildInputShape(spec: ToolSpec) {
  const actionNames = Object.keys(spec.actions) as [string, ...string[]];
  const anyDestructive = Object.values(spec.actions).some((d) => d.destructive);
  const shape: Record<string, z.ZodTypeAny> = {
    action: z
      .enum(actionNames)
      .describe(
        `Operation to perform. Signatures (required path params in parentheses, ⚠ = destructive, needs confirm:true): ${actionSignatures(spec.actions)}`
      ),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Value for the action\'s primary path parameter, e.g. 123'),
    path_params: z
      .record(z.union([z.string(), z.number()]))
      .optional()
      .describe('Values for additional path parameters, keyed by name, e.g. {"transaction_id": 55}'),
    query: z
      .record(z.unknown())
      .optional()
      .describe('Query-string parameters (search, filters, sorting, with[]…), e.g. {"search": "jane@example.com"}'),
    body: z
      .record(z.unknown())
      .optional()
      .describe('JSON request body for create/update actions, e.g. {"title": "Spring sale"} — schemas are in the product\'s official developer docs (linked from docs/api-reference/<product>.md)'),
    page: z.number().int().min(1).optional().describe('Page number for list actions (default 1)'),
    per_page: z.number().int().min(1).max(100).optional().describe('Items per page for list actions (default 20)'),
    fields: z.array(z.string()).optional().describe('Return only these fields per record, e.g. ["id","status","total_amount"]'),
    detail: z
      .enum(['summary', 'full'])
      .optional()
      .describe('"summary" (default) returns key fields and truncates long values; "full" returns the raw API response'),
  };
  const anyWrite = Object.values(spec.actions).some((d) => d.method !== 'GET' && d.method !== 'HEAD');
  const anyPaired = Object.keys(spec.actions).some((a) => pairedReadFor(spec, a));
  if (anyWrite) {
    shape.dry_run = z
      .boolean()
      .optional()
      .describe('Preview without writing: returns the exact request (and, for merge-capable updates, the field diff) that would be applied.');
  }
  if (anyPaired) {
    shape.mode = z
      .enum(['merge', 'replace'])
      .optional()
      .describe(
        '"merge" (default on update actions with a paired GET) deep-merges your partial body onto the current record so omitted fields are preserved; "replace" sends your body as the complete record (requires confirm:true — omitted fields may be cleared).'
      );
    shape.if_unmodified_since = z
      .string()
      .optional()
      .describe('Optimistic concurrency: refuse the write if the record\'s updated_at no longer equals this value (as returned by a prior read).');
  }
  if (anyDestructive || anyPaired) {
    shape.confirm = z
      .boolean()
      .optional()
      .describe(
        'Must be true to execute destructive actions (marked ⚠) or mode:"replace" writes. Without it the tool only explains what would happen.'
      );
  }
  return shape;
}

export type ToolArgs = {
  action: string;
  id?: string | number;
  path_params?: Record<string, string | number>;
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

function err(text: string) {
  return { content: [{ type: 'text' as const, text }], isError: true };
}

/** Error-result constructor shared with the individual-tool registration. */
export const errResult = err;

/** The refusal for admin-locked tools — confirm:true cannot open this gate. */
export function lockedRefusal(label: string) {
  return err(
    `🔒 Refused: ${label} is locked on this server (admin-only) — nothing was changed, and confirm:true cannot override the lock. ` +
      `Enabling it requires the server admin to change FLUENT_LOCKED_TOOLS in the server environment.`
  );
}

const isPlainRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const isEmptyValue = (v: unknown) =>
  v === undefined || v === null || v === '' || (isPlainRecord(v) && Object.keys(v).length === 0) || (Array.isArray(v) && v.length === 0);
/** The registry a readback `allow` validates against: an object's keys, or an array of strings/{key|slug|name}. */
function allowedKeys(registry: unknown): string[] {
  if (Array.isArray(registry)) {
    return registry
      .map((r) => (typeof r === 'string' ? r : isPlainRecord(r) ? String(r.key ?? r.slug ?? r.name ?? '') : ''))
      .filter(Boolean);
  }
  return isPlainRecord(registry) ? Object.keys(registry) : [];
}

/** Core execution shared by the grouped and individual registrations.
 *  `label` is the caller-facing name used in messages — `crm_contacts.list_contacts`
 *  in grouped mode, `crm_contacts_list` in individual mode. `spec` (when
 *  provided) enables merge-mode writes: PUT/PATCH actions with a GET action on
 *  the identical path deep-merge partial bodies and verify the write. */
export async function executeAction(
  def: EndpointDef,
  action: string,
  args: ToolArgs,
  runtime: ToolRuntime,
  label: string,
  spec?: ToolSpec
) {
  const dryRun = args.dry_run === true;
  // Destructive gate: refuse without confirm, describing the blast radius.
  // A dry run never touches the endpoint, so it may pass the gate.
  if (def.destructive && args.confirm !== true && !dryRun) {
    return err(
      `Refused (nothing was changed): ${label} would ${def.summary ? def.summary.toLowerCase().replace(/\.$/, '') : `execute ${def.method} ${def.path}`}` +
        ` — a hard-to-undo operation. Re-run with confirm: true to proceed.`
    );
  }

  const isWrite = def.method !== 'GET' && def.method !== 'HEAD';
  const readDef = isWrite && spec ? pairedReadFor(spec, action) : undefined;
  const wantReplace = args.mode === 'replace';
  if (args.mode === 'merge' && !readDef) {
    return err(
      `${label} cannot merge: no GET endpoint is registered on ${def.path} to read the current record from. ` +
        `This write sends your body as-is (omitted fields may be cleared by the plugin) — drop the mode parameter to proceed.`
    );
  }
  if (readDef && wantReplace && args.confirm !== true && !dryRun) {
    return err(
      `Refused (nothing was changed): mode:"replace" sends your body as the complete record — every field you omit may be cleared by the plugin. ` +
        `Re-run with confirm: true to replace, or drop the mode parameter to deep-merge your partial body onto the current record instead.`
    );
  }

  // Path substitution: primary placeholder takes `id`, the rest come from
  // path_params (which may also carry the primary one, by name).
  const placeholders = placeholdersOf(def.path);
  const supplied: Record<string, string | number> = { ...(args.path_params ?? {}) };
  if (args.id !== undefined && placeholders.length && !(placeholders[0] in supplied)) {
    supplied[placeholders[0]] = args.id;
  }
  const missing = placeholders.filter((p) => supplied[p] === undefined || supplied[p] === '');
  if (missing.length) {
    return err(
      `Missing path parameter${missing.length > 1 ? 's' : ''} for ${label}: ${missing.join(', ')}. ` +
        `Pass the primary one as id (or all of them in path_params). Endpoint: ${def.method} ${def.path}`
    );
  }
  let path = def.path;
  for (const p of placeholders) path = path.replaceAll(`{${p}}`, encodeURIComponent(String(supplied[p])));

  // Wrapper-key endpoints: verify the required top-level body keys before
  // calling — the plugin silently ignores flat fields and then fails with an
  // opaque SQL error (e.g. "Column 'title' cannot be null"), so a flat or
  // missing body must be refused here with the expected shape instead.
  if (def.requiredBody?.length) {
    const body = args.body ?? {};
    const missingKeys = def.requiredBody.filter((k) => body[k] === undefined);
    if (missingKeys.length) {
      return err(
        `Missing required body key${missingKeys.length > 1 ? 's' : ''} for ${label}: ${missingKeys.join(', ')} — nothing was sent. ` +
          `${def.bodyNote ?? ''} Endpoint: ${def.method} ${def.path}`.trimStart()
      );
    }
  }

  // Read-back guard (def.readback): some plugin endpoints accept and store
  // any body — e.g. a form-integration feed under an unregistered
  // integration name — and return 200 for a record nothing will ever read.
  // Validate the body against what the plugin advertises BEFORE writing, and
  // read the stored record back AFTER, so the caller never trusts a bare 200.
  let readbackPath: string | undefined;
  if (def.readback && isWrite && !dryRun) {
    readbackPath = def.readback.path;
    for (const p of placeholders) readbackPath = readbackPath.replaceAll(`{${p}}`, encodeURIComponent(String(supplied[p])));
    const allow = def.readback.allow;
    const body = isPlainRecord(args.body) ? args.body : {};
    const gated = allow && (!allow.requiredWhen || !isEmptyValue(body[allow.requiredWhen]));
    if (gated && allow) {
      let advertised: unknown;
      try {
        advertised = (await runtime.client.request({ method: 'GET', path: readbackPath, siteRoot: def.siteRoot })).data;
      } catch (e) {
        return err(
          `${label}: could not read the plugin's registry to validate ${allow.bodyField} — nothing was written. ` +
            `Underlying read: ${e instanceof FluentApiError ? e.message : String(e)}`
        );
      }
      const allowed = allowedKeys(isPlainRecord(advertised) ? advertised[allow.fromKey] : undefined);
      const value = body[allow.bodyField];
      if (typeof value !== 'string' || !allowed.includes(value)) {
        return err(
          `Refused (nothing was written): ${label} needs ${allow.bodyField} to be one of the integrations this site has registered — ` +
            `${allowed.length ? allowed.map((a) => `"${a}"`).join(', ') : '(none found)'} — but got ${JSON.stringify(value)}. ` +
            `The plugin would store the feed under "${String(value ?? '')}_feeds" and never run it. ${def.bodyNote ?? ''}`.trimEnd()
        );
      }
    }
  }

  // Query: carry the caller's pagination over, then apply the list defaults.
  const query: Record<string, unknown> = { ...(args.query ?? {}) };
  if (args.page !== undefined && query.page === undefined) query.page = args.page;
  if (args.per_page !== undefined && query.per_page === undefined) query.per_page = args.per_page;
  if (isListAction(action) && def.method === 'GET') {
    if (query.page === undefined) query.page = 1;
    if (query.per_page === undefined) query.per_page = 20;
  }

  try {
    // Merge-capable write: read the record first, so partial bodies can be
    // hydrated (merge mode) and the write can be verified (both modes).
    const notes: string[] = [];
    let bodyToSend = args.body;
    let beforeRaw: unknown;
    let merged: MergedBody | undefined;
    const bodyIsMergeable = isPlainRecord(args.body) && Object.keys(args.body).length > 0;
    if (readDef && bodyIsMergeable) {
      try {
        beforeRaw = (await runtime.client.request({ method: 'GET', path, siteRoot: def.siteRoot })).data;
      } catch (e) {
        const msg = e instanceof FluentApiError ? e.message : String(e);
        if (!wantReplace) {
          return err(
            `${label}: could not read the current record to merge your partial body onto — nothing was written. ` +
              `Underlying read: ${msg} If the record exists and the read keeps failing, mode:"replace" with confirm:true writes without merging.`
          );
        }
        notes.push('pre-write read failed — post-write verification unavailable');
      }
      if (beforeRaw !== undefined) {
        if (args.if_unmodified_since) {
          const current = recordUpdatedAt(beforeRaw);
          if (current && current !== args.if_unmodified_since) {
            return err(
              `Refused (nothing was changed): ${label} precondition failed — the record's updated_at is now "${current}", not "${args.if_unmodified_since}". ` +
                `Someone else modified it since you read it. Re-read the record and retry with the fresh timestamp.`
            );
          }
        }
        merged = buildMergedBody(beforeRaw, args.body as Record<string, unknown>);
        if (!wantReplace) {
          bodyToSend = merged.body;
          if (merged.strategy === 'none') {
            notes.push('merge unavailable — the body shape did not line up with the record; body sent as supplied');
          }
        }
      }
    } else if (args.if_unmodified_since) {
      return err(
        `${label} cannot check if_unmodified_since: the precondition needs a merge-capable write (a GET on ${def.path} plus a JSON body) to read the record's updated_at from. Drop the parameter to proceed.`
      );
    }

    // Dry run: report exactly what would be sent (plus the field-level diff
    // when the current record was readable) and stop before any write.
    if (dryRun) {
      const wouldChange =
        merged && !wantReplace && merged.base !== undefined ? diffRecords(merged.base, bodyToSend) : undefined;
      const structured = {
        ok: true,
        status: 0,
        action,
        dry_run: true,
        ...(readDef && isWrite ? { mode: wantReplace ? ('replace' as const) : ('merge' as const) } : {}),
        would_send: {
          method: def.method,
          path,
          ...(Object.keys(query).length ? { query } : {}),
          ...(bodyToSend !== undefined ? { body: bodyToSend } : {}),
        },
        ...(wouldChange ? { changed: wouldChange } : {}),
        note: 'dry run — nothing was written',
      };
      return {
        content: [
          {
            type: 'text' as const,
            text: `${label} dry run — nothing was written. Would send ${def.method} ${path}${
              wouldChange ? ` changing ${Object.keys(wouldChange).length} field(s)` : ''
            }.\n${JSON.stringify(structured)}`,
          },
        ],
        structuredContent: structured,
      };
    }

    const response = await runtime.client.request({
      method: def.method,
      path,
      query,
      body: bodyToSend,
      siteRoot: def.siteRoot,
      noRetry: def.destructive,
    });

    // Post-write verification: re-read the record and compare against both
    // the pre-write state and the caller's original body. The write and the
    // re-read both succeeded at the HTTP level from here on, so verification
    // failures degrade to a note rather than masking the write's outcome.
    let verification: Verification | undefined;
    if (readDef && bodyIsMergeable && beforeRaw !== undefined) {
      try {
        const afterRaw = (await runtime.client.request({ method: 'GET', path, siteRoot: def.siteRoot })).data;
        verification = verifyWrite(
          beforeRaw,
          afterRaw,
          args.body as Record<string, unknown>,
          merged?.toRecordPath ?? ((p) => p)
        );
      } catch {
        notes.push('post-write verification read failed — the write itself succeeded');
      }
    }
    let stored: unknown;
    if (readbackPath && def.readback?.stored) {
      const { itemsKey, idFrom } = def.readback.stored;
      const wroteId = isPlainRecord(response.data) ? response.data[idFrom] : undefined;
      if (wroteId === undefined) {
        notes.push(`response carried no ${idFrom} — read-back skipped; confirm with the list tool`);
      } else try {
        const listing = (await runtime.client.request({ method: 'GET', path: readbackPath, siteRoot: def.siteRoot })).data;
        const items = isPlainRecord(listing) && Array.isArray(listing[itemsKey]) ? (listing[itemsKey] as unknown[]) : [];
        stored = items.find((it) => isPlainRecord(it) && String(it.id) === String(wroteId));
        if (stored === undefined) {
          return err(
            `${label} returned HTTP ${response.status} (${idFrom}=${String(wroteId)}), but the plugin does not list that record among its ${itemsKey} — ` +
              `it was stored where nothing reads it and will never run. Re-read with the list tool and check the request body. ${def.bodyNote ?? ''}`.trimEnd()
          );
        }
      } catch (e) {
        if (e instanceof FluentApiError) notes.push(`post-write read-back failed (${e.message}) — the write itself returned ${response.status}`);
        else throw e;
      }
    }
    if (verification?.rejected) {
      return err(
        `${label} returned HTTP ${response.status} but the record did not change — none of your supplied fields landed. ` +
          `The endpoint most likely ignored the request body. ${def.bodyNote ?? 'Check the expected body shape in the product\'s official developer docs (linked from docs/api-reference/<product>.md).'}`
      );
    }

    const shaped = shapeResponse(response.data, {
      detail: args.detail ?? 'summary',
      fields: args.fields,
      summaryFields: runtime.summaryFields,
    });
    if (shaped.summarized) notes.push('summary view — pass detail:"full" or fields:[...] for complete records');
    const structured = {
      ok: true,
      status: response.status,
      action,
      data: shaped.data,
      ...(readDef && bodyIsMergeable ? { mode: wantReplace ? ('replace' as const) : ('merge' as const) } : {}),
      ...(verification ? { changed: verification.changed } : {}),
      ...(verification?.warnings.length ? { warnings: verification.warnings } : {}),
      ...(stored !== undefined ? { stored } : {}),
      ...(shaped.pagination && Object.values(shaped.pagination).some((v) => v !== undefined)
        ? { pagination: shaped.pagination }
        : {}),
      ...(notes.length ? { note: notes.join('; ') } : {}),
    };
    let summaryLine = textSummary(label, response.status, shaped);
    if (verification) {
      const changedCount = Object.keys(verification.changed).length;
      summaryLine += ` — verified: ${changedCount} field${changedCount === 1 ? '' : 's'} changed`;
      if (verification.warnings.length) {
        summaryLine += `, ⚠ ${verification.warnings.length} warning${verification.warnings.length === 1 ? '' : 's'}`;
      }
    }
    // The data must live in the text block too: several MCP clients
    // (claude.ai among them) surface only `content` to the model, and the
    // spec says structured results SHOULD also be serialized as text.
    return {
      content: [
        {
          type: 'text' as const,
          text: `${summaryLine}\n${JSON.stringify(structured)}`,
        },
      ],
      structuredContent: structured,
    };
  } catch (e) {
    if (e instanceof FluentApiError) return err(e.message);
    return err(`${label} failed unexpectedly: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** The grouped-mode tool handler, exported separately so tests can drive it directly. */
export function makeHandler(spec: ToolSpec, runtime: ToolRuntime) {
  return async (args: ToolArgs) => {
    const def = spec.actions[args.action];
    if (!def) {
      return err(`Unknown action "${args.action}" for ${spec.name}. Valid: ${Object.keys(spec.actions).join(', ')}`);
    }
    const canonical = runtime.canonicalNames?.[args.action];
    if (canonical && runtime.lockedTools?.has(canonical)) {
      return lockedRefusal(`${spec.name}.${args.action}`);
    }
    return executeAction(def, args.action, args, runtime, `${spec.name}.${args.action}`, spec);
  };
}

export function registerToolSpec(server: McpServer, spec: ToolSpec, runtime: ToolRuntime): void {
  let description = spec.note ? `${spec.description} ${spec.note}` : spec.description;
  const lockedActions = runtime.canonicalNames
    ? Object.entries(runtime.canonicalNames)
        .filter(([, name]) => runtime.lockedTools?.has(name))
        .map(([action]) => action)
    : [];
  if (lockedActions.length) {
    description += ` 🔒 Locked actions (always refuse, admin-controlled): ${lockedActions.join(', ')}.`;
  }
  server.registerTool(
    spec.name,
    {
      description,
      inputSchema: buildInputShape(spec),
      outputSchema: OUTPUT_SHAPE,
      annotations: annotationsFor(spec),
    },
    makeHandler(spec, runtime) as Parameters<typeof server.registerTool>[2]
  );
}
