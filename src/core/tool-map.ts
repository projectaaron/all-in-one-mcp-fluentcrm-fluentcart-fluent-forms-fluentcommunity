/** The fast map: a `tool_map` tool every session can call to learn the
 *  surface in seconds. No args → one line per area (the ~44 resource
 *  domains). {area} → every tool in that area with its required params.
 *  {search} → keyword lookup across names and summaries. The same data
 *  renders docs/TOOL_MAP.md (via scripts/gen-tool-catalog.mjs) and the
 *  MCP `instructions` string sessions receive on connect. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { individualNamesFor } from './action-tools.js';
import { wpMediaMapTools } from './media.js';
import { isListAction, placeholdersOf } from './tool-factory.js';
import type { ProductModule } from './types.js';

export interface MapTool {
  /** Callable tool name (individual mode) or `area.action` (grouped mode). */
  name: string;
  /** One-line human summary, e.g. "List Contacts". */
  summary: string;
  /** Required path parameters. */
  params: string[];
  destructive: boolean;
  /** True for GET list actions that take page/per_page. */
  paginated: boolean;
  /** Admin-locked: registered but refuses unconditionally. */
  locked?: boolean;
}

export interface MapArea {
  /** Area key — the resource domain, e.g. `crm_contacts`. */
  area: string;
  /** Product title, e.g. `FluentCRM`, or `server` for built-ins. */
  product: string;
  /** False when the product's credentials are absent (tools not registered). */
  enabled: boolean;
  description: string;
  /** Caveat carried by every tool in the area (e.g. customer-session auth). */
  note?: string;
  /** Grouped mode: entries are actions of one area tool, not tool names. */
  grouped?: boolean;
  tools: MapTool[];
}

export type ToolMode = 'individual' | 'grouped';

/** Memoized per module and (mode, enabled) — the Cloudflare worker rebuilds
 *  the server per request, but the map data is config-static. */
const AREA_CACHE = new WeakMap<ProductModule, Map<string, MapArea[]>>();

/** Build map areas for one product module. */
export function mapAreasOf(module: ProductModule, mode: ToolMode, enabled: boolean, locked?: Set<string>): MapArea[] {
  const key = `${mode}:${enabled}:${locked ? [...locked].sort().join('|') : ''}`;
  let perModule = AREA_CACHE.get(module);
  const hit = perModule?.get(key);
  if (hit) return hit;

  const areas = module.tools.map((spec) => {
    const names = mode === 'individual' ? individualNamesFor(spec) : undefined;
    return {
      area: spec.name,
      product: module.title,
      enabled,
      description: spec.description,
      ...(spec.note ? { note: spec.note } : {}),
      ...(mode === 'grouped' ? { grouped: true as const } : {}),
      tools: Object.entries(spec.actions).map(([action, def]) => {
        const canonical = individualNamesFor(spec)[action];
        return {
          name: names ? names[action] : `${spec.name}.${action}`,
          summary: def.summary,
          params: placeholdersOf(def.path),
          destructive: def.destructive,
          paginated: isListAction(action) && def.method === 'GET',
          ...(locked?.has(canonical) ? { locked: true as const } : {}),
        };
      }),
    };
  });
  if (!perModule) {
    perModule = new Map();
    AREA_CACHE.set(module, perModule);
  }
  perModule.set(key, areas);
  return areas;
}

/** The built-in server tools as a map area — single source consumed by
 *  server.ts, the tool_map data, and scripts/gen-tool-catalog.mjs. */
export function serverArea(mode: ToolMode, withMedia: boolean): MapArea {
  return {
    area: 'server',
    product: 'server',
    enabled: true,
    ...(mode === 'grouped' ? { grouped: true as const } : {}),
    description: 'Built-in tools: this map, setup verification, and the WordPress media library.',
    tools: [
      {
        name: 'tool_map',
        summary: 'This map — overview, per-area drill-down, keyword search',
        params: [],
        destructive: false,
        paginated: false,
      },
      {
        name: 'verify_setup',
        summary: 'Check credentials, connectivity, and plugin presence per product',
        params: [],
        destructive: false,
        paginated: false,
      },
      ...(withMedia ? wpMediaMapTools(mode) : []),
    ],
  };
}

export const MAP_CONVENTIONS =
  'Conventions: ⚠ tools are hard to undo and require confirm:true (without it they refuse and explain). ' +
  '🔒 tools are locked by the server admin and always refuse — confirm:true cannot override. ' +
  '(paginated) tools page by default (page/per_page, 20 per page); every GET tool also accepts page/per_page — many get_* tools return paginated collections. ' +
  'All tools take query filters. Responses are compact summaries — pass detail:"full" or fields:["…"] for complete records.';

const GROUPED_NOTE =
  'Grouped mode: entries are area.action — call the AREA tool with an "action" argument, e.g. crm_contacts {"action": "list_contacts"}.';

export function toolLine(t: MapTool): string {
  return `${t.name}${t.params.length ? `(${t.params.join(', ')})` : ''}${t.destructive ? ' ⚠' : ''}${t.locked ? ' 🔒' : ''} — ${t.summary}${t.paginated ? ' (paginated)' : ''}`;
}

function areaLine(a: MapArea): string {
  return `${a.area} (${a.tools.length})${a.enabled ? '' : ' [not configured]'} — ${a.description}`;
}

/** Registered-tool count: in grouped mode the map's entries are actions of
 *  one area tool (`crm_contacts.list_contacts`), so count distinct callables. */
export function callableCount(areas: MapArea[], enabledOnly = false): number {
  return areas
    .filter((a) => !enabledOnly || a.enabled)
    .reduce((n, a) => n + (a.grouped ? new Set(a.tools.map((t) => t.name.split('.')[0])).size : a.tools.length), 0);
}

/** "FluentCRM: enabled · FluentCart: not configured" — one derivation for
 *  the overview header and the instructions string. */
export function productStatuses(areas: MapArea[], separator: string, skipServer = false): string {
  return [...new Set(areas.map((a) => a.product))]
    .filter((p) => !skipServer || p !== 'server')
    .map((p) => `${p}: ${areas.find((a) => a.product === p)!.enabled ? 'enabled' : 'not configured'}`)
    .join(separator);
}

export function renderOverview(areas: MapArea[]): string {
  const grouped = areas.some((a) => a.grouped);
  const count = grouped
    ? `${callableCount(areas)} tools (${areas.reduce((n, a) => n + a.tools.length, 0)} operations)`
    : `${callableCount(areas)} tools`;
  const lines = [
    `fluentMCP tool map — ${count} in ${areas.length} areas. ${productStatuses(areas, ' · ')}`,
    MAP_CONVENTIONS,
    'Drill down: tool_map {"area": "crm_contacts"} lists every tool in an area with its parameters; tool_map {"search": "refund"} finds tools by keyword.',
    ...(areas.some((a) => a.grouped) ? [GROUPED_NOTE] : []),
    '',
    ...areas.map(areaLine),
  ];
  return lines.join('\n');
}

export function renderArea(a: MapArea): string {
  const head = `${a.area} — ${a.description} [${a.product}${a.enabled ? '' : ' — not configured, tools unavailable'}]`;
  return [
    head,
    ...(a.note ? [`Note: ${a.note}`] : []),
    ...(a.grouped ? [GROUPED_NOTE] : []),
    ...a.tools.map((t) => `  ${toolLine(t)}`),
  ].join('\n');
}

const SEARCH_CAP = 80;

export function renderSearch(areas: MapArea[], term: string): string {
  const q = term.trim().toLowerCase();
  const hits: Array<{ area: MapArea; tool: MapTool }> = [];
  for (const a of areas) {
    for (const t of a.tools) {
      if (
        t.name.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        a.area.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      ) {
        hits.push({ area: a, tool: t });
      }
    }
  }
  if (!hits.length) {
    return `No tools match "${term}". Try a broader keyword, or call tool_map with no arguments for the area overview.`;
  }
  const lines: string[] = [`${hits.length} tool${hits.length === 1 ? '' : 's'} match "${term}":`];
  if (hits.some((h) => h.area.grouped)) lines.push(GROUPED_NOTE);
  let area = '';
  for (const h of hits.slice(0, SEARCH_CAP)) {
    if (h.area.area !== area) {
      area = h.area.area;
      lines.push(`\n${area}${h.area.enabled ? '' : ' [not configured]'}:`);
    }
    lines.push(`  ${toolLine(h.tool)}`);
  }
  if (hits.length > SEARCH_CAP) lines.push(`\n…and ${hits.length - SEARCH_CAP} more — narrow the search.`);
  return lines.join('\n');
}

/** The MCP `instructions` string — the first thing a session reads. */
export function buildInstructions(areas: MapArea[], mode: ToolMode): string {
  const toolCount = callableCount(areas, true);
  const naming =
    mode === 'individual'
      ? 'Every tool does exactly one thing and is named <area>_<operation>: crm_contacts_list, crm_contacts_create, cart_orders_refund, …'
      : 'Tools are grouped per area; pass an `action` argument to pick the operation.';
  return [
    `fluentMCP: ${toolCount} tools for the WordPress site's Fluent products (${productStatuses(areas, ', ', true)}).`,
    naming,
    'Fast map: call tool_map (no args) for a one-line overview of every area; tool_map {"area": "..."} or {"search": "..."} to find the exact tool.',
    MAP_CONVENTIONS,
    'Run verify_setup first if anything seems misconfigured.',
  ].join(' ');
}

export function registerToolMapTool(server: McpServer, areas: MapArea[]): void {
  server.registerTool(
    'tool_map',
    {
      description:
        'The fast map of this server: call with no arguments for a one-line overview of every tool area, {"area": "crm_contacts"} for every tool in an area with its parameters, or {"search": "refund"} to find tools by keyword. Start here when unsure which tool to use.',
      inputSchema: {
        area: z.string().optional().describe('Area key from the overview, e.g. "crm_contacts" or "cart_orders"'),
        search: z.string().optional().describe('Keyword to look for in tool names and descriptions, e.g. "refund"'),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args: { area?: string; search?: string }) => {
      let text: string;
      if (args.area) {
        const key = args.area.trim().toLowerCase();
        const found = areas.find((a) => a.area === key);
        if (found) {
          text = renderArea(found);
        } else {
          const near = areas.filter((a) => a.area.includes(key) || key.includes(a.area)).map((a) => a.area);
          text = `Unknown area "${args.area}". ${near.length ? `Did you mean: ${near.join(', ')}?` : ''} Valid areas:\n${areas.map((a) => a.area).join(', ')}`;
        }
      } else if (args.search) {
        text = renderSearch(areas, args.search);
      } else {
        text = renderOverview(areas);
      }
      return { content: [{ type: 'text' as const, text }] };
    }
  );
}
