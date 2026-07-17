/** The fast map: overview, per-area drill-down, keyword search, and the MCP
 *  instructions string — a session's route to the right tool in one call. */
import { describe, expect, it } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { individualNamesFor } from '../src/core/action-tools.js';
import {
  buildInstructions,
  mapAreasOf,
  registerToolMapTool,
  renderArea,
  renderOverview,
  renderSearch,
  type MapArea,
} from '../src/core/tool-map.js';
import { PRODUCTS } from '../src/products/index.js';

function allAreas(mode: 'individual' | 'grouped' = 'individual', enabled = true): MapArea[] {
  return PRODUCTS.flatMap((p) => mapAreasOf(p, mode, enabled));
}

describe('tool map data', () => {
  it('covers every individual tool exactly once', () => {
    const areas = allAreas();
    const fromMap = areas.flatMap((a) => a.tools.map((t) => t.name)).sort();
    const fromSpecs = PRODUCTS.flatMap((p) => p.tools.flatMap((s) => Object.values(individualNamesFor(s)))).sort();
    expect(fromMap).toEqual(fromSpecs);
  });

  it('uses area.action names in grouped mode', () => {
    const areas = allAreas('grouped');
    const contacts = areas.find((a) => a.area === 'crm_contacts')!;
    expect(contacts.tools.map((t) => t.name)).toContain('crm_contacts.list_contacts');
  });
});

describe('tool map rendering', () => {
  const areas = allAreas();

  it('overview: one line per area with counts, conventions, and drill-down help', () => {
    const text = renderOverview(areas);
    for (const a of areas) {
      expect(text).toContain(`${a.area} (${a.tools.length})`);
    }
    expect(text).toContain('confirm:true');
    expect(text).toContain('tool_map {"area"');
    // Fast: the overview stays around one screen per 15 areas, not one per tool.
    expect(text.split('\n').length).toBeLessThan(areas.length + 10);
  });

  it('area view: every tool with params, destruction marker, and pagination note', () => {
    const contacts = areas.find((a) => a.area === 'crm_contacts')!;
    const text = renderArea(contacts);
    expect(text).toContain('crm_contacts_list — List Contacts (paginated)');
    expect(text).toContain('crm_contacts_get(id) — Get Contact');
    expect(text).toContain('crm_contacts_delete_contact(id) ⚠');
  });

  it('marks unconfigured products instead of hiding them', () => {
    const disabled = mapAreasOf(PRODUCTS[0], 'individual', false);
    expect(renderOverview(disabled)).toContain('[not configured]');
    expect(renderArea(disabled[0])).toContain('not configured');
  });

  it('search finds tools by keyword across names and summaries', () => {
    const text = renderSearch(areas, 'coupon');
    expect(text).toContain('cart_coupons_list');
    expect(renderSearch(areas, 'zzznothingzzz')).toContain('No tools match');
  });

  it('instructions tell a session the naming rule, the map, and the safety gate', () => {
    const text = buildInstructions(areas, 'individual');
    expect(text).toContain('tool_map');
    expect(text).toContain('confirm:true');
    expect(text).toContain('<area>_<operation>');
  });
});

describe('tool_map tool', () => {
  function fakeServer() {
    const tools: Record<string, { handler: (args: Record<string, unknown>) => Promise<{ content: Array<{ text: string }> }> }> = {};
    const server = {
      registerTool: (name: string, _meta: unknown, handler: never) => {
        tools[name] = { handler };
      },
    } as unknown as McpServer;
    return { server, tools };
  }

  it('answers overview, area, search, and unknown-area calls', async () => {
    const { server, tools } = fakeServer();
    registerToolMapTool(server, allAreas());
    const call = (args: Record<string, unknown>) => tools.tool_map.handler(args);

    expect((await call({})).content[0].text).toContain('fluentMCP tool map');
    expect((await call({ area: 'cart_orders' })).content[0].text).toContain('cart_orders_refund');
    expect((await call({ search: 'refund' })).content[0].text).toContain('cart_orders_refund');
    const unknown = (await call({ area: 'cart_order' })).content[0].text;
    expect(unknown).toContain('Unknown area');
    expect(unknown).toContain('cart_orders');
  });
});
