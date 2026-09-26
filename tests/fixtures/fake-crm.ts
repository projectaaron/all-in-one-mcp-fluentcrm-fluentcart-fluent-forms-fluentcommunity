/** An in-memory FluentCRM REST API shaped like the live responses captured
 *  from marriageaftergod.com (funnel 11, "Husband Wife 31 Day Prayer
 *  Challenge"): Laravel paginators wrapped in {funnel_subscribers: …} /
 *  {subscribers: …}, entries embedding the contact, sequences carrying
 *  per-email `stats`. Writes mutate the state so a real run can be checked. */

import type { CapturedRequest } from '../helpers.js';

type Rec = Record<string, unknown>;

export interface FakeContact {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  ip: string | null;
  status: string;
  created_at: string;
  tags: number[];
}

export interface FakeEntry {
  id: number;
  funnel_id: string;
  subscriber_id: string;
  status: 'active' | 'completed' | 'cancelled';
  last_sequence_id: string;
}

export interface FakeTracker {
  id: number;
  campaign_id: string;
  subscriber_id: string;
  status: string;
}

/** Funnel 11's real step layout. */
export const STEPS = [
  { id: 106, sequence: '1', action_name: 'funnel_condition', type: 'conditional', title: 'Check Condition', parent_id: '0', condition_type: null, settings: {} },
  { id: 108, sequence: '2', action_name: 'end_this_funnel', type: 'action', title: 'End This Funnel Here', parent_id: '106', condition_type: 'no', settings: {} },
  { id: 91, sequence: '3', action_name: 'funnel_condition', type: 'conditional', title: 'Praying for a wife? (husband route)', parent_id: '0', condition_type: null, settings: {} },
  { id: 93, sequence: '4', action_name: 'add_to_email_sequence', type: 'action', title: 'Send Husband Sequence', parent_id: '91', condition_type: 'yes', settings: { sequence_id: '1259' } },
  { id: 94, sequence: '5', action_name: 'add_to_email_sequence', type: 'action', title: 'Send Wife Sequence', parent_id: '91', condition_type: 'no', settings: { sequence_id: '1258' } },
  { id: 95, sequence: '6', action_name: 'fluentcrm_wait_times', type: 'action', title: 'Wait until the challenge is finished', parent_id: '0', condition_type: null, settings: {} },
  { id: 96, sequence: '7', action_name: 'detach_contact_from_tag', type: 'action', title: 'Remove Prayer Challenge Active', parent_id: '0', condition_type: null, settings: {} },
  { id: 97, sequence: '8', action_name: 'add_contact_to_tag', type: 'action', title: 'Add Prayer Challenge Completed', parent_id: '0', condition_type: null, settings: {} },
  { id: 98, sequence: '9', action_name: 'end_this_funnel', type: 'action', title: 'End', parent_id: '0', condition_type: null, settings: {} },
];

/** Per-email stats for the two challenge sequences (Welcome is the worst). */
export const SEQUENCE_EMAILS: Record<string, Array<{ id: number; title: string; delay: number; sent: number; views: number; clicks: number; unsubscribers: number }>> = {
  '1258': [
    { id: 1260, title: 'Welcome to the 31-Day Marriage Prayer Challenge', delay: 0, sent: 1162, views: 690, clicks: 26, unsubscribers: 18 },
    { id: 1261, title: 'Day 1: Leader of the Home', delay: 86400, sent: 1150, views: 640, clicks: 24, unsubscribers: 15 },
    { id: 1262, title: 'Day 2: His Job', delay: 172800, sent: 1100, views: 600, clicks: 14, unsubscribers: 12 },
  ],
  '1259': [
    { id: 1297, title: 'Welcome to the 31-Day Marriage Prayer Challenge', delay: 0, sent: 151, views: 101, clicks: 2, unsubscribers: 1 },
    { id: 1298, title: 'Day 1: Helper of the Home', delay: 86400, sent: 150, views: 102, clicks: 3, unsubscribers: 3 },
  ],
};

/** Build the dataset: 19 reached the end, 8 ended early at step 108,
 *  cancelled 137/25/5/1 by contact status, plus 12 bots among the actives. */
export function buildState() {
  const contacts = new Map<number, FakeContact>();
  const entries: FakeEntry[] = [];
  const trackers: FakeTracker[] = [];
  let cid = 1000;
  let eid = 5000;
  const add = (c: Partial<FakeContact>, entry: Pick<FakeEntry, 'status' | 'last_sequence_id'>) => {
    const id = ++cid;
    const contact: FakeContact = {
      id,
      email: `person${id}@example.com`,
      first_name: `Person${id}`,
      last_name: null,
      ip: `73.10.${id % 250}.${id % 200}`,
      status: 'subscribed',
      created_at: '2026-09-01 10:00:00',
      tags: [],
      ...c,
    };
    contacts.set(id, contact);
    entries.push({ id: ++eid, funnel_id: '11', subscriber_id: String(id), ...entry });
    return contact;
  };
  for (let i = 0; i < 19; i++) add({}, { status: 'completed', last_sequence_id: '98' });
  for (let i = 0; i < 8; i++) add({}, { status: 'completed', last_sequence_id: '108' });
  const cancelled: Array<[string, number]> = [['unsubscribed', 137], ['bounced', 25], ['complained', 5], ['pending', 1]];
  for (const [status, n] of cancelled) for (let i = 0; i < n; i++) add({ status }, { status: 'cancelled', last_sequence_id: '95' });
  // Real, active contacts.
  for (let i = 0; i < 40; i++) {
    const c = add({}, { status: 'active', last_sequence_id: '95' });
    trackers.push({ id: 9000 + c.id, campaign_id: '1258', subscriber_id: String(c.id), status: 'active' });
  }
  // A real person with a suffix (medium, single weak signal).
  add({ first_name: 'Jonathon Jerome Jordan', last_name: 'Jr', email: 'jonathon.jordan.jj@gmail.com' }, { status: 'active', last_sequence_id: '95' });
  // Bots: Tor exits, a dotted Gmail pair, generated names.
  const bots: FakeContact[] = [
    add({ first_name: 'Amani', last_name: 'Pagac IV', ip: '185.220.101.33' }, { status: 'active', last_sequence_id: '95' }),
    add({ first_name: 'Mrs. Desiree', last_name: 'Luettgen', ip: '192.42.116.18', email: 'waynetroon50@gmail.com' }, { status: 'active', last_sequence_id: '95' }),
    add({ first_name: '', ip: '109.70.100.4', email: 'z.u.nef.o.n.e.g.o.q.i83@gmail.com' }, { status: 'active', last_sequence_id: '95' }),
    add({ first_name: '', ip: '5.5.5.5', email: 'zu.nefo.neg.oqi83@gmail.com' }, { status: 'active', last_sequence_id: '95' }),
    add({ first_name: 'Pasquale', last_name: 'Predovic Jr.', ip: '171.25.193.77' }, { status: 'active', last_sequence_id: '95' }),
    add({ first_name: 'Bot', last_name: 'One', ip: '45.84.107.9' }, { status: 'active', last_sequence_id: '95' }),
    // Already tagged "Bot signup" (5060) by an earlier cleanup.
    add({ first_name: 'Bot', last_name: 'Two', ip: '185.40.4.100', tags: [5060] }, { status: 'active', last_sequence_id: '95' }),
  ];
  for (const b of bots) trackers.push({ id: 9000 + b.id, campaign_id: '1258', subscriber_id: String(b.id), status: 'active' });
  return { contacts, entries, trackers };
}

function paginate<T>(items: T[], url: URL, key?: string) {
  const perPage = Number(url.searchParams.get('per_page') ?? 15);
  const page = Number(url.searchParams.get('page') ?? 1);
  const data = items.slice((page - 1) * perPage, page * perPage);
  const paginator = { current_page: page, data, per_page: perPage, total: items.length, last_page: Math.max(1, Math.ceil(items.length / perPage)) };
  return key ? { [key]: paginator } : paginator;
}

const contactJson = (c: FakeContact) => ({
  ...c,
  full_name: [c.first_name, c.last_name].filter(Boolean).join(' '),
  tags: c.tags.map((id) => ({ id, title: `Tag ${id}` })),
});

export function fakeCrm() {
  const state = buildState();
  const writes: Array<{ method: string; path: string; body: Rec }> = [];

  const handle = (req: CapturedRequest): { status: number; body?: unknown } => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/wp-json\/fluent-crm\/v2/, '');
    const body = req.body ? (JSON.parse(req.body) as Rec) : {};
    const list = (k: string) => url.searchParams.getAll(`${k}[]`);

    let m: RegExpMatchArray | null;
    if (req.method === 'GET' && (m = path.match(/^\/funnels\/(\d+)\/subscribers$/))) {
      const status = url.searchParams.get('status');
      const items = state.entries
        .filter((e) => e.funnel_id === m![1] && (!status || e.status === status))
        .sort((a, b) => b.id - a.id)
        .map((e) => ({ ...e, subscriber: contactJson(state.contacts.get(Number(e.subscriber_id))!), metrics: [{ id: 1, sequence_id: '106' }] }));
      const out: Rec = paginate(items, url, 'funnel_subscribers');
      if (list('with').includes('sequences')) out.sequences = STEPS;
      if (list('with').includes('funnel')) out.funnel = { id: 11, title: 'Husband Wife 31 Day Prayer Challenge' };
      return { status: 200, body: out };
    }
    if (req.method === 'GET' && (m = path.match(/^\/sequences\/(\d+)$/))) {
      const emails = SEQUENCE_EMAILS[m[1]];
      if (!emails) return { status: 404, body: { message: 'not found' } };
      return {
        status: 200,
        body: {
          sequence: { id: Number(m[1]), title: m[1] === '1258' ? '31-Day Challenge — Wife' : '31-Day Challenge — Husband' },
          sequence_emails: emails.map((e) => ({
            id: e.id,
            title: e.title,
            delay: String(e.delay),
            email_body: '<p>long body</p>'.repeat(200),
            stats: { total: e.sent, sent: e.sent, clicks: e.clicks, views: e.views, unsubscribers: e.unsubscribers, revenue: false },
          })),
        },
      };
    }
    if (req.method === 'GET' && path === '/subscribers') {
      const tags = list('tags').map(Number);
      const statuses = list('statuses');
      const items = [...state.contacts.values()]
        .filter((c) => (!tags.length || tags.some((t) => c.tags.includes(t))) && (!statuses.length || statuses.includes(c.status)))
        .map(contactJson);
      return { status: 200, body: paginate(items, url, 'subscribers') };
    }
    if (req.method === 'GET' && (m = path.match(/^\/sequences\/(\d+)\/subscribers$/))) {
      const items = state.trackers.filter((t) => t.campaign_id === m![1]);
      return { status: 200, body: paginate(items, url) };
    }

    // ---- writes
    writes.push({ method: req.method, path, body });
    if (req.method === 'POST' && path === '/subscribers/do-bulk-action' && body.action_name === 'change_contact_status') {
      for (const id of body.subscriber_ids as number[]) {
        const c = state.contacts.get(id);
        if (!c || c.status === body.new_status) continue;
        c.status = String(body.new_status);
        // FluentCRM's unsubscribe hook cancels active entries and trackers.
        if (c.status === 'unsubscribed') {
          for (const e of state.entries) if (e.subscriber_id === String(id) && e.status === 'active') e.status = 'cancelled';
          for (const t of state.trackers) if (t.subscriber_id === String(id) && t.status === 'active') t.status = 'cancelled';
        }
      }
      return { status: 200, body: { message: 'Status has been changed for the selected subscribers' } };
    }
    if (req.method === 'POST' && path === '/subscribers/sync-segments') {
      for (const id of body.subscribers as number[]) {
        const c = state.contacts.get(id);
        if (!c) continue;
        for (const t of (body.attach as number[] | undefined) ?? []) if (!c.tags.includes(t)) c.tags.push(t);
        for (const t of (body.detach as number[] | undefined) ?? []) c.tags = c.tags.filter((x) => x !== t);
      }
      return { status: 200, body: { message: 'ok' } };
    }
    if (req.method === 'PUT' && (m = path.match(/^\/funnels\/(\d+)\/subscribers\/(\d+)\/status$/))) {
      const e = state.entries.find((x) => x.funnel_id === m![1] && x.subscriber_id === m![2]);
      if (!e) return { status: 422, body: { message: 'No Corresponding report found' } };
      if (e.status === 'completed') return { status: 422, body: { message: 'The status already completed state' } };
      e.status = body.status as FakeEntry['status'];
      return { status: 200, body: { message: `Status has been updated to ${e.status}` } };
    }
    if (req.method === 'DELETE' && (m = path.match(/^\/funnels\/(\d+)\/subscribers$/))) {
      const ids = new Set((body.subscriber_ids as number[]).map(String));
      state.entries = state.entries.filter((e) => !(e.funnel_id === m![1] && ids.has(e.subscriber_id)));
      return { status: 200, body: { message: 'removed' } };
    }
    if (req.method === 'DELETE' && (m = path.match(/^\/sequences\/(\d+)\/subscribers$/))) {
      const ids = new Set(((body.tracker_ids as number[] | undefined) ?? []).map(Number));
      state.trackers = state.trackers.filter((t) => !(t.campaign_id === m![1] && ids.has(t.id)));
      return { status: 200, body: { message: 'removed' } };
    }
    return { status: 404, body: { code: 'rest_no_route', message: `no route ${req.method} ${path}` } };
  };

  return { state, writes, handle };
}
