/** Acceptance tests for the "prayer challenge investigation" scenario: each
 *  question must be answerable in ≤3 FluentMCP calls with responses under
 *  4 KB. Data comes from an in-memory FluentCRM API shaped like the live
 *  responses of marriageaftergod.com (tests/fixtures/fake-crm.ts). */
import { describe, expect, it } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeActionHandler, individualNamesFor } from '../../src/core/action-tools.js';
import { groupBy, walkPages } from '../../src/core/aggregate.js';
import { shapeResponse } from '../../src/core/shape.js';
import { canonicalGmail, detectSuspicious, ipPrefixesFrom, DEFAULT_ANONYMIZER_PREFIXES } from '../../src/products/fluentcrm/analytics-data.js';
import { registerAnalyticsTools } from '../../src/products/fluentcrm/analytics-tools.js';
import { registerBulkFilterTool } from '../../src/products/fluentcrm/bulk-filter-tool.js';
import { fluentcrm } from '../../src/products/fluentcrm/index.js';
import { mapAreasOf } from '../../src/core/tool-map.js';
import { makeClient, mockFetch } from '../helpers.js';
import { fakeCrm } from '../fixtures/fake-crm.js';

type Result = { isError?: boolean; content: Array<{ text: string }>; structuredContent: Record<string, any> };

function fakeServer() {
  const tools: Record<string, (args: Record<string, unknown>) => Promise<Result>> = {};
  const server = {
    registerTool: (name: string, _meta: unknown, handler: never) => {
      tools[name] = handler;
    },
  } as unknown as McpServer;
  return { server, tools };
}

function setup() {
  const api = fakeCrm();
  const { calls, fetchImpl } = mockFetch(api.handle);
  const client = makeClient(fetchImpl);
  const { server, tools } = fakeServer();
  registerAnalyticsTools(server, client);
  registerBulkFilterTool(server, client);
  return { api, calls, client, tools };
}

/** Response size as the model sees it (the text block). */
const size = (r: Result) => new TextEncoder().encode(r.content[0].text).length;

function genericTool(name: string, client: ReturnType<typeof makeClient>) {
  for (const spec of fluentcrm.tools) {
    const names = individualNamesFor(spec);
    const action = Object.keys(names).find((a) => names[a] === name);
    if (action) return makeActionHandler(spec, action, { client }, name) as (a: Record<string, unknown>) => Promise<Result>;
  }
  throw new Error(`no tool ${name}`);
}

describe('fields: nested paths', () => {
  const raw = {
    funnel_subscribers: {
      current_page: 1,
      per_page: 2,
      total: 2,
      data: [
        { id: 1, status: 'cancelled', subscriber: { id: 9, status: 'unsubscribed', ip: '1.2.3.4', email: 'a@x.com' }, metrics: [{ id: 5, status: 'completed' }, { id: 6, status: 'completed' }] },
        { id: 2, status: 'cancelled', subscriber: { id: 8, status: 'bounced', ip: null, email: 'b@x.com' }, metrics: [] },
      ],
    },
  };

  it('keeps only the requested nested values, with their nesting', () => {
    const shaped = shapeResponse(raw, { detail: 'summary', fields: ['id', 'status', 'subscriber.status', 'subscriber.ip'] });
    expect((shaped.data as any).funnel_subscribers.data).toEqual([
      { id: 1, status: 'cancelled', subscriber: { status: 'unsubscribed', ip: '1.2.3.4' } },
      { id: 2, status: 'cancelled', subscriber: { status: 'bounced', ip: null } },
    ]);
  });

  it('projects arrays element-wise and never drops the record id', () => {
    const shaped = shapeResponse(raw, { detail: 'summary', fields: ['metrics.status'] });
    expect((shaped.data as any).funnel_subscribers.data[0]).toEqual({ id: 1, metrics: [{ status: 'completed' }, { status: 'completed' }] });
  });

  it('prefers a literal dotted key over the nested reading', () => {
    const shaped = shapeResponse({ id: 3, 'a.b': 'literal', a: { b: 'nested' } }, { detail: 'summary', fields: ['a.b'] });
    expect(shaped.data).toEqual({ id: 3, 'a.b': 'literal' });
  });

  it('projects a wrapped single record by nested field', () => {
    const shaped = shapeResponse({ subscriber: { id: 7, status: 'x', custom: { plan: 'gold', other: 1 } } }, { detail: 'summary', fields: ['custom.plan'] });
    expect(shaped.data).toEqual({ subscriber: { id: 7, custom: { plan: 'gold' } } });
  });
});

describe('walkPages', () => {
  const items = Array.from({ length: 537 }, (_, i) => ({ id: i + 1, k: i % 3 }));
  const paged = (perPageCap?: number, meta = true) => {
    const requested: number[] = [];
    const fetch = async (page: number, perPage: number) => {
      requested.push(page);
      const pp = perPageCap ? Math.min(perPage, perPageCap) : perPage;
      const data = items.slice((page - 1) * pp, page * pp);
      return meta ? { data, total: items.length, per_page: pp, current_page: page, last_page: Math.ceil(items.length / pp) } : { rows: data };
    };
    return { fetch, requested };
  };

  it('reads every page once', async () => {
    const { fetch, requested } = paged();
    let n = 0;
    const res = await walkPages(fetch, () => n++, { perPage: 100 });
    expect(n).toBe(537);
    expect(res).toMatchObject({ total: 537, recordsRead: 537, pagesRead: 6, truncated: false });
    expect([...requested].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('follows a plugin that caps per_page below the request', async () => {
    const { fetch } = paged(50);
    let n = 0;
    const res = await walkPages(fetch, () => n++, { perPage: 100 });
    expect(n).toBe(537);
    expect(res.pagesRead).toBe(11);
  });

  it('walks lists without pagination metadata until a short page', async () => {
    const { fetch } = paged(undefined, false);
    let n = 0;
    await walkPages(fetch, () => n++, { perPage: 100 });
    expect(n).toBe(537);
  });

  it('stops at the record cap and says so', async () => {
    const { fetch } = paged();
    const res = await walkPages(fetch, () => {}, { perPage: 100, maxRecords: 200 });
    expect(res).toMatchObject({ recordsRead: 200, truncated: true });
  });

  it('groups by a nested field across pages', async () => {
    const { fetch } = paged();
    const agg = await groupBy(fetch, ['k']);
    expect(agg.groups).toEqual({ '0': 179, '1': 179, '2': 179 });
    expect(agg.total).toBe(537);
  });
});

describe('Q1 — completions (crm_analytics_funnel_exits)', () => {
  it('separates reaching the final step from ending early at an End step', async () => {
    const { tools, calls } = setup();
    const res = await tools.crm_analytics_funnel_exits({ funnel_id: 11 });
    const s = res.structuredContent;
    expect(res.isError).toBeUndefined();
    expect(s.completed.reached_final_step).toBe(19);
    expect(s.completed.final_step).toEqual({ id: 98, title: 'End' });
    expect(s.completed.ended_early).toEqual([{ step_id: 108, path: 'Check Condition → no → End This Funnel Here', count: 8 }]);
    expect(s.entries).toMatchObject({ completed: 27, cancelled: 168, active: 48 });
    expect(res.content[0].text).toContain('19 reached the final step');
    expect(size(res)).toBeLessThan(4096);
    expect(calls.every((c) => c.method === 'GET')).toBe(true);
  });
});

describe('Q2 — cancel reasons', () => {
  it('crm_analytics_funnel_exits groups cancelled entries by contact status', async () => {
    const { tools } = setup();
    const res = await tools.crm_analytics_funnel_exits({ funnel_id: 11 });
    expect(res.structuredContent.cancelled.by_contact_status).toEqual({ unsubscribed: 137, bounced: 25, complained: 5, pending: 1 });
    expect(res.structuredContent.cancelled.by_step).toEqual([{ step_id: 95, title: 'Wait until the challenge is finished', count: 168 }]);
  });

  it('the generic list tool answers it with group_by across all pages, in one call', async () => {
    const { client, calls } = setup();
    const tool = genericTool('crm_automations_get_funnel_subscribers', client);
    const res = await tool({ id: 11, query: { status: 'cancelled' }, group_by: 'subscriber.status' });
    expect(res.isError).toBeUndefined();
    expect(res.structuredContent.aggregation).toMatchObject({
      total: 168,
      groups: { unsubscribed: 137, bounced: 25, complained: 5, pending: 1 },
      records_read: 168,
      pages_read: 2,
    });
    expect(size(res)).toBeLessThan(1024);
    // The status filter reached every page request; pagination was ours.
    const urls = calls.map((c) => new URL(c.url));
    expect(urls.every((u) => u.searchParams.get('status') === 'cancelled' && u.searchParams.get('per_page') === '100')).toBe(true);
  });

  it('count_only costs one request for one record', async () => {
    const { client, calls } = setup();
    const res = await genericTool('crm_automations_get_funnel_subscribers', client)({ id: 11, query: { status: 'cancelled' }, count_only: true });
    expect(res.structuredContent.aggregation).toEqual({ total: 168, pages_read: 1 });
    expect(calls).toHaveLength(1);
    expect(new URL(calls[0].url).searchParams.get('per_page')).toBe('1');
  });

  it('nested fields keep a full listing small', async () => {
    const { client } = setup();
    const res = await genericTool('crm_automations_get_funnel_subscribers', client)({
      id: 11,
      query: { status: 'cancelled' },
      per_page: 20,
      fields: ['id', 'subscriber.status'],
    });
    const rows = res.structuredContent.data.funnel_subscribers.data;
    expect(rows[0]).toEqual({ id: expect.any(Number), subscriber: { status: expect.any(String) } });
    expect(size(res)).toBeLessThan(2048);
  });

  it('refuses group_by on a write tool', async () => {
    const { client, calls } = setup();
    const res = await genericTool('crm_contacts_create', client)({ body: { email: 'a@b.co' }, group_by: 'status' });
    expect(res.isError).toBe(true);
    expect(calls).toHaveLength(0);
  });
});

describe('Q3 — unsubscribes per email (crm_analytics_funnel_email_stats)', () => {
  it('finds every sequence the automation uses and ranks emails by unsubscribes', async () => {
    const { tools, calls } = setup();
    const res = await tools.crm_analytics_funnel_email_stats({ funnel_id: 11, sort_by: 'unsubscribes' });
    const s = res.structuredContent;
    expect(res.isError).toBeUndefined();
    expect(s.sequences.map((q: any) => q.sequence_id).sort()).toEqual([1258, 1259]);
    expect(s.emails_total).toBe(5);
    const top = Object.fromEntries(s.columns.map((c: string, i: number) => [c, s.rows[0][i]]));
    expect(top).toMatchObject({ sequence_id: 1258, email_id: 1260, title: 'Welcome to the 31-Day Marriage Prayer Challenge', sent: 1162, unsubscribes: 18, unsubscribe_rate: 1.55 });
    expect(res.content[0].text).toContain('18 unsubscribes of 1162 sent');
    expect(size(res)).toBeLessThan(4096);
    // 1 funnel read + 1 per sequence — email bodies never reach the model.
    expect(calls).toHaveLength(3);
    expect(res.content[0].text).not.toContain('long body');
  });

  it('sorts by rate and limits rows while totals still cover every email', async () => {
    const { tools } = setup();
    const res = await tools.crm_analytics_funnel_email_stats({ sequence_id: [1259], sort_by: 'unsubscribe_rate', limit: 1 });
    expect(res.structuredContent.rows).toHaveLength(1);
    expect(res.structuredContent.rows[0][1]).toBe(1298); // 3/150 = 2%
    expect(res.structuredContent.sequences[0]).toMatchObject({ emails: 2, sent: 301, unsubscribes: 4 });
  });

  it('needs a funnel or a sequence', async () => {
    const { tools } = setup();
    expect((await tools.crm_analytics_funnel_email_stats({})).isError).toBe(true);
  });
});

describe('Q4 — bot signups (crm_analytics_suspicious_contacts)', () => {
  it('flags Tor IPs, Gmail dot variants and generated names, with reasons', async () => {
    const { tools } = setup();
    const res = await tools.crm_analytics_suspicious_contacts({ funnel_id: 11 });
    const s = res.structuredContent;
    expect(s.scanned).toBe(243);
    expect(s.by_confidence).toEqual({ high: 7, medium: 1 });
    expect(s.by_signal).toMatchObject({ anonymizer_ip: 6, gmail_variant: 2, dotted_gmail: 2 });
    const variant = s.contacts.find((c: any) => c.email === 'zu.nefo.neg.oqi83@gmail.com');
    expect(variant.reasons.join(' ')).toContain('same Gmail as 1 other contact');
    expect(variant.confidence).toBe('high');
    const human = s.contacts.find((c: any) => c.email === 'jonathon.jordan.jj@gmail.com');
    expect(human.confidence).toBe('medium');
    expect(size(res)).toBeLessThan(4096);
  });

  it('needs a scope', async () => {
    const { tools, calls } = setup();
    expect((await tools.crm_analytics_suspicious_contacts({})).isError).toBe(true);
    expect(calls).toHaveLength(0);
  });

  it('min_confidence:"high" drops single weak signals', async () => {
    const { tools } = setup();
    const res = await tools.crm_analytics_suspicious_contacts({ funnel_id: 11, min_confidence: 'high' });
    expect(res.structuredContent.flagged).toBe(7);
  });

  it('canonicalGmail ignores dots and +tags, only for Gmail', () => {
    expect(canonicalGmail('Z.u.Nef+x@GoogleMail.com')).toBe('zunef@gmail.com');
    expect(canonicalGmail('z.u.nef@example.com')).toBeUndefined();
  });

  it('shared_ip needs the configured number of signups from one IP', () => {
    const c = (id: number, ip: string) => ({ id, email: `p${id}@x.com`, name: 'Real Person', ip, status: 'subscribed' });
    const flagged = detectSuspicious([c(1, '9.9.9.9'), c(2, '9.9.9.9'), c(3, '9.9.9.9'), c(4, '8.8.8.8')], {
      ipPrefixes: [],
      minSignupsPerIp: 3,
    });
    expect(flagged.map((f) => f.contact.id)).toEqual([1, 2, 3]);
    expect(flagged[0].confidence).toBe('medium');
  });

  it('IP prefixes: per-call override, then the server setting, then the built-in list', () => {
    expect(ipPrefixesFrom(['10.'], ['20.'])).toEqual(['20.']);
    expect(ipPrefixesFrom(['10.'])).toEqual(['10.']);
    expect(ipPrefixesFrom(undefined)).toBe(DEFAULT_ANONYMIZER_PREFIXES);
  });
});

describe('Q5 — bulk action by filter', () => {
  const BOTS = { funnel_id: 11, suspicious: { min_confidence: 'high' } };
  const ACTIONS = { add_tags: [5060], set_status: 'unsubscribed', remove_from_funnel: true };

  it('dry run: counts, sample and per-action changes — and writes nothing', async () => {
    const { tools, api } = setup();
    const res = await tools.crm_contacts_bulk_action_by_filter({ filter: BOTS, actions: ACTIONS, dry_run: true });
    const s = res.structuredContent;
    expect(res.isError).toBeUndefined();
    expect(s.dry_run).toBe(true);
    expect(s.matched).toBe(7);
    expect(s.changes.add_tags).toEqual([{ tag_id: 5060, would_add: 6, already_tagged: 1 }]);
    expect(s.changes.set_status).toMatchObject({ to: 'unsubscribed', would_change: 7, from: { subscribed: 7 } });
    expect(s.changes.remove_from_funnel).toMatchObject({ funnel_id: 11, mode: 'cancel', would_change: 7 });
    expect(s.sample[0].why.length).toBeGreaterThan(0);
    expect(api.writes).toHaveLength(0);
    expect(size(res)).toBeLessThan(4096);
  });

  it('refuses without confirm, showing what it would do', async () => {
    const { tools, api } = setup();
    const res = await tools.crm_contacts_bulk_action_by_filter({ filter: BOTS, actions: ACTIONS });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('needs confirm:true');
    expect(res.structuredContent.matched).toBe(7);
    expect(api.writes).toHaveLength(0);
  });

  it('real run: tags, unsubscribes through FluentCRM\'s status action, cancels the automation, returns undo', async () => {
    const { tools, api } = setup();
    const res = await tools.crm_contacts_bulk_action_by_filter({ filter: BOTS, actions: ACTIONS, confirm: true });
    const s = res.structuredContent;
    expect(res.isError).toBeUndefined();
    // Status goes through change_contact_status so fluentcrm_subscriber_status_to_unsubscribed fires.
    const statusCall = api.writes.find((w) => w.path === '/subscribers/do-bulk-action')!;
    expect(statusCall.body).toMatchObject({ action_name: 'change_contact_status', new_status: 'unsubscribed' });
    expect(s.results.set_status).toMatchObject({ requested: 7, done: 7 });
    expect(s.results.add_tags[0]).toMatchObject({ requested: 6, done: 6, skipped: 1 });
    expect(s.undo.set_status.subscribed).toHaveLength(7);
    expect(s.undo.remove_tags['5060']).toHaveLength(6);
    // Every bot is now unsubscribed and tagged; real contacts untouched.
    const bots = [...api.state.contacts.values()].filter((c) => /^(185\.220|192\.42\.116|109\.70\.100|171\.25\.193|45\.84\.107|185\.40\.4)|^5\.5\.5\.5$/.test(c.ip ?? ''));
    expect(bots.every((c) => c.status === 'unsubscribed' && c.tags.includes(5060))).toBe(true);
    expect([...api.state.contacts.values()].filter((c) => c.tags.includes(5060))).toHaveLength(7);
    const botEntries = api.state.entries.filter((e) => bots.some((b) => String(b.id) === e.subscriber_id));
    expect(botEntries.every((e) => e.status === 'cancelled')).toBe(true);
  });

  it('refuses a real run above max_contacts', async () => {
    const { tools, api } = setup();
    const res = await tools.crm_contacts_bulk_action_by_filter({ filter: { funnel_id: 11 }, actions: { add_tags: [1] }, confirm: true, max_contacts: 10 });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('above max_contacts 10');
    expect(api.writes).toHaveLength(0);
  });

  it('needs a scope and at least one action', async () => {
    const { tools } = setup();
    expect((await tools.crm_contacts_bulk_action_by_filter({ filter: {}, actions: { add_tags: [1] }, confirm: true })).isError).toBe(true);
    expect((await tools.crm_contacts_bulk_action_by_filter({ filter: { funnel_id: 11 }, actions: {}, confirm: true })).isError).toBe(true);
  });

  it('delete mode removes the entries; a later filter by status only touches that status', async () => {
    const { tools, api } = setup();
    const res = await tools.crm_contacts_bulk_action_by_filter({
      filter: { funnel_id: 11, funnel_status: 'cancelled', contact_status: ['pending'] },
      actions: { remove_from_funnel: { mode: 'delete' } },
      confirm: true,
    });
    expect(res.structuredContent.matched).toBe(1);
    expect(res.structuredContent.results.remove_from_funnel).toMatchObject({ requested: 1, done: 1 });
    expect(api.writes).toEqual([{ method: 'DELETE', path: '/funnels/11/subscribers', body: { subscriber_ids: [expect.any(Number)] } }]);
  });
});

describe('tool map', () => {
  it('lists the analytics area and the bulk tool under crm_contacts', () => {
    const areas = mapAreasOf(fluentcrm, 'individual', true);
    const analytics = areas.find((a) => a.area === 'crm_analytics')!;
    expect(analytics.tools.map((t) => t.name)).toEqual([
      'crm_analytics_funnel_email_stats',
      'crm_analytics_funnel_exits',
      'crm_analytics_suspicious_contacts',
    ]);
    expect(areas.find((a) => a.area === 'crm_contacts')!.tools.some((t) => t.name === 'crm_contacts_bulk_action_by_filter' && t.destructive)).toBe(true);
    expect(analytics.tools.every((t) => !('area' in t))).toBe(true);
  });
});
