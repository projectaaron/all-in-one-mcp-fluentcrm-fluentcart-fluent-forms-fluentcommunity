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
  serverArea,
  type MapArea,
} from '../src/core/tool-map.js';
import { PRODUCTS } from '../src/products/index.js';
import { PRODUCT_EXTRA_TOOLS } from './helpers.js';

function allAreas(mode: 'individual' | 'grouped' = 'individual', enabled = true): MapArea[] {
  return PRODUCTS.flatMap((p) => mapAreasOf(p, mode, enabled));
}

describe('tool map data', () => {
  it('covers every individual tool exactly once', () => {
    const areas = allAreas();
    const fromMap = areas.flatMap((a) => a.tools.map((t) => t.name)).sort();
    const fromSpecs = PRODUCTS.flatMap((p) => [
      ...p.tools.flatMap((s) => Object.values(individualNamesFor(s))),
      ...(p.extras?.mapTools.map((t) => t.name) ?? []),
    ]).sort();
    expect(fromMap).toEqual(fromSpecs);
  });

  it('uses area.action names in grouped mode and teaches the calling convention', () => {
    const areas = allAreas('grouped');
    const contacts = areas.find((a) => a.area === 'crm_contacts')!;
    expect(contacts.tools.map((t) => t.name)).toContain('crm_contacts.list_contacts');
    // The dot-form is not a callable tool name — every grouped view must say so.
    for (const text of [renderOverview(areas), renderArea(contacts), renderSearch(areas, 'refund')]) {
      expect(text).toContain('"action"');
    }
    // Individual mode carries no such noise.
    expect(renderOverview(allAreas())).not.toContain('Grouped mode');
  });

  it('server area single-sources the built-ins for both modes', () => {
    const withMedia = serverArea('individual', true);
    expect(withMedia.tools.map((t) => t.name)).toEqual([
      'tool_map',
      'verify_setup',
      'support_report',
      'wp_media_upload_from_url',
      'wp_media_get',
      'wp_media_list',
    ]);
    expect(serverArea('grouped', true).tools.some((t) => t.name === 'wp_media.upload_from_url')).toBe(true);
    expect(serverArea('individual', false).tools.map((t) => t.name)).toEqual(['tool_map', 'verify_setup', 'support_report']);
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

    expect((await call({})).content[0].text).toContain('All-In-One MCP for Fluent Suite tool map');
    expect((await call({ area: 'cart_orders' })).content[0].text).toContain('cart_orders_refund');
    expect((await call({ search: 'refund' })).content[0].text).toContain('cart_orders_refund');
    const unknown = (await call({ area: 'cart_order' })).content[0].text;
    expect(unknown).toContain('Unknown area');
    expect(unknown).toContain('cart_orders');
  });
});

describe('grouped-mode honesty', () => {
  it('instructions and overview count callable tools, not actions', () => {
    const areas = [...allAreas('grouped'), serverArea('grouped', true)];
    // One tool per area + product extras (standalone in both modes) +
    // tool_map + verify_setup + support_report + wp_media.
    const areaCount = PRODUCTS.reduce((n, p) => n + p.tools.length, 0);
    const expected = `${areaCount + PRODUCT_EXTRA_TOOLS + 4} tools`;
    const instructions = buildInstructions(areas, 'grouped');
    expect(instructions).toContain(expected);
    const overview = renderOverview(areas);
    expect(overview).toContain(expected);
    expect(overview).toContain('operations)');
  });
});
