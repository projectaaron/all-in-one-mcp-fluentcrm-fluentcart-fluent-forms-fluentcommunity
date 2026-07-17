/** Turns a declarative ToolSpec into a registered MCP tool: Zod schema
 *  assembly, action routing, path substitution, pagination defaults,
 *  confirm-gating for destructive actions, response shaping. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FluentClient } from './http.js';
import { FluentApiError } from './errors.js';
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
};

export interface ToolRuntime {
  client: FluentClient;
  summaryFields?: string[];
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
      .describe('JSON request body for create/update actions, e.g. {"title": "Spring sale"} — schemas in docs/api-reference/'),
    page: z.number().int().min(1).optional().describe('Page number for list actions (default 1)'),
    per_page: z.number().int().min(1).max(100).optional().describe('Items per page for list actions (default 20)'),
    fields: z.array(z.string()).optional().describe('Return only these fields per record, e.g. ["id","status","total_amount"]'),
    detail: z
      .enum(['summary', 'full'])
      .optional()
      .describe('"summary" (default) returns key fields and truncates long values; "full" returns the raw API response'),
  };
  if (anyDestructive) {
    shape.confirm = z
      .boolean()
      .optional()
      .describe('Must be true to execute destructive actions (marked ⚠). Without it the tool only explains what would happen.');
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
};

function err(text: string) {
  return { content: [{ type: 'text' as const, text }], isError: true };
}

/** Core execution shared by the grouped and individual registrations.
 *  `label` is the caller-facing name used in messages — `crm_contacts.list_contacts`
 *  in grouped mode, `crm_contacts_list` in individual mode. */
export async function executeAction(
  def: EndpointDef,
  action: string,
  args: ToolArgs,
  runtime: ToolRuntime,
  label: string
) {
  // Destructive gate: refuse without confirm, describing the blast radius.
  if (def.destructive && args.confirm !== true) {
    return err(
      `Refused (nothing was changed): ${label} would ${def.summary ? def.summary.toLowerCase().replace(/\.$/, '') : `execute ${def.method} ${def.path}`}` +
        ` — a hard-to-undo operation. Re-run with confirm: true to proceed.`
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
  for (const p of placeholders) path = path.replace(`{${p}}`, encodeURIComponent(String(supplied[p])));

  // Query: user query + pagination defaults on list actions.
  const query: Record<string, unknown> = { ...(args.query ?? {}) };
  if (isListAction(action) && def.method === 'GET') {
    if (query.page === undefined) query.page = args.page ?? 1;
    if (query.per_page === undefined) query.per_page = args.per_page ?? 20;
  } else {
    if (args.page !== undefined && query.page === undefined) query.page = args.page;
    if (args.per_page !== undefined && query.per_page === undefined) query.per_page = args.per_page;
  }

  try {
    const response = await runtime.client.request({
      method: def.method,
      path,
      query,
      body: args.body,
      siteRoot: def.siteRoot,
      noRetry: def.destructive,
    });
    const shaped = shapeResponse(response.data, {
      detail: args.detail ?? 'summary',
      fields: args.fields,
      summaryFields: runtime.summaryFields,
    });
    const structured = {
      ok: true,
      status: response.status,
      action,
      data: shaped.data,
      ...(shaped.pagination && Object.values(shaped.pagination).some((v) => v !== undefined)
        ? { pagination: shaped.pagination }
        : {}),
      ...(shaped.summarized ? { note: 'summary view — pass detail:"full" or fields:[...] for complete records' } : {}),
    };
    // The data must live in the text block too: several MCP clients
    // (claude.ai among them) surface only `content` to the model, and the
    // spec says structured results SHOULD also be serialized as text.
    return {
      content: [
        {
          type: 'text' as const,
          text: `${textSummary(label, response.status, shaped)}\n${JSON.stringify(structured)}`,
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
    return executeAction(def, args.action, args, runtime, `${spec.name}.${args.action}`);
  };
}

export function registerToolSpec(server: McpServer, spec: ToolSpec, runtime: ToolRuntime): void {
  const description = spec.note ? `${spec.description} ${spec.note}` : spec.description;
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
