/** Data layer for the FluentCRM analytics and filter-based bulk tools. Pure
 *  REST: every number comes from FluentCRM's own endpoints, read across all
 *  pages here so the model receives only the answer.
 *
 *  Verified against FluentCRM 3.2 source and a live site:
 *  - GET /funnels/{id}/subscribers?with[]=sequences returns the automation's
 *    steps; entries embed the contact (`subscriber`, incl. ip/status) and
 *    filter by `status`. per_page is not capped (Model::getPerPage).
 *  - GET /sequences/{id}?with[]=sequence_emails returns each email with
 *    `stats` {sent, views, clicks, unsubscribers}.
 *  - GET /subscribers filters by tags[] / lists[] / statuses[]. */

import type { FluentClient } from '../../core/http.js';
import { endpointFetcher, walkPages } from '../../core/aggregate.js';

type Rec = Record<string, unknown>;
export const isRec = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Records per upstream page for full-list reads. FluentCRM does not cap
 *  per_page; 250 keeps each funnel-entry page (≈3 KB/entry) under ~1 MB. */
export const BULK_PAGE_SIZE = 250;
/** Largest contact set one analytics/bulk call will read. */
export const MAX_SCAN = 20_000;
/** Explicit contact ids are read one request each. */
export const MAX_EXPLICIT_IDS = 200;

export async function listAll(
  client: FluentClient,
  path: string,
  query: Record<string, unknown> = {},
  maxRecords = MAX_SCAN
): Promise<{ items: Rec[]; total?: number; truncated: boolean }> {
  const items: Rec[] = [];
  const walked = await walkPages(
    endpointFetcher(client, { path, query }),
    (item) => {
      if (isRec(item)) items.push(item);
    },
    { perPage: BULK_PAGE_SIZE, maxRecords }
  );
  return { items, total: walked.total, truncated: walked.truncated };
}

// ------------------------------------------------------------ automation steps

export interface FunnelStep {
  id: number;
  order: number;
  parentId: number;
  actionName: string;
  type: string;
  title: string;
  conditionType?: string;
  settings: Rec;
}

export interface FunnelInfo {
  id: number;
  title?: string;
  steps: FunnelStep[];
}

function toStep(s: Rec): FunnelStep {
  return {
    id: num(s.id),
    order: num(s.sequence),
    parentId: num(s.parent_id),
    actionName: String(s.action_name ?? ''),
    type: String(s.type ?? ''),
    title: String(s.title ?? ''),
    ...(s.condition_type ? { conditionType: String(s.condition_type) } : {}),
    settings: isRec(s.settings) ? s.settings : {},
  };
}

/** The automation's title and its steps (sorted by position). */
export async function fetchFunnel(client: FluentClient, funnelId: number): Promise<FunnelInfo> {
  const resp = await client.request({
    method: 'GET',
    path: `/funnels/${funnelId}/subscribers`,
    query: { with: ['sequences', 'funnel'], per_page: 1, page: 1 },
  });
  const data = isRec(resp.data) ? resp.data : {};
  const steps = (Array.isArray(data.sequences) ? data.sequences : []).filter(isRec).map(toStep);
  steps.sort((a, b) => a.order - b.order || a.id - b.id);
  const funnel = isRec(data.funnel) ? data.funnel : undefined;
  return { id: funnelId, ...(funnel && typeof funnel.title === 'string' ? { title: funnel.title } : {}), steps };
}

/** Human path to a step: "Check Condition → no → End This Funnel Here". */
export function stepPath(steps: FunnelStep[], stepId: number): string {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const parts: string[] = [];
  let cur = byId.get(stepId);
  let guard = 0;
  while (cur && guard++ < 20) {
    parts.unshift(cur.conditionType ? `${cur.conditionType} → ${cur.title}` : cur.title);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return parts.join(' → ') || `step ${stepId}`;
}

/** The automation's final step: the last top-level step. An entry "reached
 *  the end" when its last step is that step or sits inside it (a closing
 *  conditional's branches). */
export function finalStep(steps: FunnelStep[]): FunnelStep | undefined {
  const top = steps.filter((s) => !s.parentId);
  return top.length ? top[top.length - 1] : undefined;
}

export function isWithin(steps: FunnelStep[], stepId: number, ancestorId: number): boolean {
  const byId = new Map(steps.map((s) => [s.id, s]));
  let cur = byId.get(stepId);
  let guard = 0;
  while (cur && guard++ < 20) {
    if (cur.id === ancestorId) return true;
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return false;
}

// ---------------------------------------------------------------- contacts

export interface ContactLite {
  id: number;
  email: string;
  name: string;
  ip?: string;
  status: string;
  created_at?: string;
  /** Tag ids, when the source carries them (the contacts list does; funnel
   *  entries do not). */
  tags?: number[];
  /** The automation entry this contact came from, when read from a funnel. */
  entry?: { id: number; status: string; last_step?: number };
}

export function toContact(raw: Rec, entry?: Rec): ContactLite | undefined {
  const id = num(raw.id);
  if (!id) return undefined;
  const name =
    typeof raw.full_name === 'string' && raw.full_name.trim()
      ? raw.full_name.trim()
      : [raw.first_name, raw.last_name].filter((v) => typeof v === 'string' && v.trim()).join(' ');
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((t) => (isRec(t) ? num(t.id) : num(t))).filter((t) => t > 0)
    : undefined;
  return {
    id,
    email: String(raw.email ?? ''),
    name,
    ...(typeof raw.ip === 'string' && raw.ip ? { ip: raw.ip } : {}),
    status: String(raw.status ?? ''),
    ...(typeof raw.created_at === 'string' ? { created_at: raw.created_at } : {}),
    ...(tags ? { tags } : {}),
    ...(entry
      ? { entry: { id: num(entry.id), status: String(entry.status ?? ''), ...(entry.last_sequence_id ? { last_step: num(entry.last_sequence_id) } : {}) } }
      : {}),
  };
}

export interface ContactSource {
  funnel_id?: number;
  /** Automation entry status: active / completed / cancelled. */
  funnel_status?: string;
  list_id?: number;
  tag_id?: number;
  /** Contact statuses to keep (subscribed, unsubscribed, …). */
  contact_status?: string[];
  /** Only contacts created on/after this date ("YYYY-MM-DD[ HH:MM:SS]"). */
  since?: string;
  contact_ids?: number[];
}

/** Resolve a contact set from one source. Funnel sources keep the entry. */
export async function resolveContacts(
  client: FluentClient,
  src: ContactSource
): Promise<{ contacts: ContactLite[]; described: string; truncated: boolean }> {
  let contacts: ContactLite[] = [];
  let truncated = false;
  const parts: string[] = [];
  if (src.funnel_id !== undefined) {
    const query: Record<string, unknown> = {};
    if (src.funnel_status) query.status = src.funnel_status;
    const res = await listAll(client, `/funnels/${src.funnel_id}/subscribers`, query);
    truncated = res.truncated;
    for (const entry of res.items) {
      if (!isRec(entry.subscriber)) continue;
      const c = toContact(entry.subscriber, entry);
      if (c) contacts.push(c);
    }
    parts.push(`automation ${src.funnel_id}${src.funnel_status ? ` (${src.funnel_status} entries)` : ''}`);
  } else if (src.contact_ids?.length) {
    // Explicit ids: the contacts list has no id filter, so read each one
    // (capped — every read is a request).
    for (const id of src.contact_ids.slice(0, MAX_EXPLICIT_IDS)) {
      try {
        const resp = await client.request({ method: 'GET', path: `/subscribers/${id}` });
        const raw = isRec(resp.data) && isRec(resp.data.subscriber) ? resp.data.subscriber : resp.data;
        const c = isRec(raw) ? toContact(raw) : undefined;
        if (c) contacts.push(c);
      } catch {
        /* a missing id simply does not match */
      }
    }
    truncated = src.contact_ids.length > MAX_EXPLICIT_IDS;
    parts.push(`${src.contact_ids.length} listed contact id(s)`);
  } else {
    const query: Record<string, unknown> = {};
    if (src.list_id !== undefined) query.lists = [src.list_id];
    if (src.tag_id !== undefined) query.tags = [src.tag_id];
    if (src.contact_status?.length) query.statuses = src.contact_status;
    const res = await listAll(client, '/subscribers', query);
    truncated = res.truncated;
    contacts = res.items.map((r) => toContact(r)).filter((c): c is ContactLite => !!c);
    parts.push(
      src.list_id !== undefined || src.tag_id !== undefined
        ? [src.list_id !== undefined ? `list ${src.list_id}` : '', src.tag_id !== undefined ? `tag ${src.tag_id}` : ''].filter(Boolean).join(' + ')
        : 'all contacts'
    );
  }
  // Filters the source endpoint could not apply.
  if (src.contact_status?.length && src.funnel_id !== undefined) {
    const keep = new Set(src.contact_status);
    contacts = contacts.filter((c) => keep.has(c.status));
  }
  if (src.contact_status?.length) parts.push(`contact status ${src.contact_status.join('/')}`);
  if (src.since) {
    const since = src.since.trim();
    contacts = contacts.filter((c) => (c.created_at ?? '') >= since);
    parts.push(`created since ${since}`);
  }
  // One contact per id (an automation can hold several entries per contact
  // when it restarts).
  const seen = new Set<number>();
  contacts = contacts.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
  return { contacts, described: parts.join(', '), truncated };
}

// ------------------------------------------------------ suspicious signups

/** Default anonymizer ranges: the Tor exit ranges that hit marriageaftergod.com
 *  plus long-standing Tor exit operators (Zwiebelfreunde 185.220.100-103,
 *  Emerald Onion 23.129.64, DFRI 185.129.62, 185.100.86-87, FranTech
 *  104.244.72-79). Overridable per call (ip_prefixes) and per server
 *  (FLUENT_SUSPICIOUS_IP_PREFIXES). */
export const DEFAULT_ANONYMIZER_PREFIXES = [
  '192.42.116.',
  '185.220.',
  '109.70.100.',
  '171.25.193.',
  '45.84.107.',
  '185.40.4.',
  '23.129.64.',
  '185.129.62.',
  '185.100.86.',
  '185.100.87.',
  '104.244.72.',
  '104.244.73.',
  '104.244.74.',
  '104.244.75.',
  '104.244.76.',
  '104.244.77.',
  '104.244.78.',
  '104.244.79.',
];

export type Signal = 'anonymizer_ip' | 'gmail_variant' | 'dotted_gmail' | 'fake_name' | 'shared_ip';
export const SIGNALS: Signal[] = ['anonymizer_ip', 'gmail_variant', 'dotted_gmail', 'fake_name', 'shared_ip'];
/** Signals strong enough to flag "high" on their own. */
const STRONG: ReadonlySet<Signal> = new Set(['anonymizer_ip', 'gmail_variant']);

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const HONORIFIC = /^(mr|mrs|ms|miss|dr|prof)\.?\s+\S/i;
const GENERATED_SUFFIX = /\s(jr|sr|ii|iii|iv|v|md|phd|dds|dvm)\.?$/i;

/** Gmail ignores dots and +tags: j.o.hn+x@gmail.com is john@gmail.com. */
export function canonicalGmail(email: string): string | undefined {
  const at = email.lastIndexOf('@');
  if (at < 1) return undefined;
  const domain = email.slice(at + 1).toLowerCase();
  if (!GMAIL_DOMAINS.has(domain)) return undefined;
  return `${email.slice(0, at).toLowerCase().split('+')[0].replace(/\./g, '')}@gmail.com`;
}

export interface SuspicionOptions {
  ipPrefixes: string[];
  /** Contacts sharing one IP at or above this count get `shared_ip`. */
  minSignupsPerIp: number;
  signals?: Signal[];
}

export interface Flagged {
  contact: ContactLite;
  reasons: string[];
  signals: Signal[];
  confidence: 'high' | 'medium';
}

/** Score a contact set. Pure — every signal is explained in `reasons`. */
export function detectSuspicious(contacts: ContactLite[], opts: SuspicionOptions): Flagged[] {
  const enabled = new Set(opts.signals?.length ? opts.signals : SIGNALS);
  const byIp = new Map<string, number>();
  const byGmail = new Map<string, number>();
  for (const c of contacts) {
    if (c.ip) byIp.set(c.ip, (byIp.get(c.ip) ?? 0) + 1);
    const g = canonicalGmail(c.email);
    if (g) byGmail.set(g, (byGmail.get(g) ?? 0) + 1);
  }
  const out: Flagged[] = [];
  for (const c of contacts) {
    const signals: Signal[] = [];
    const reasons: string[] = [];
    if (enabled.has('anonymizer_ip') && c.ip) {
      const hit = opts.ipPrefixes.find((p) => c.ip!.startsWith(p));
      if (hit) {
        signals.push('anonymizer_ip');
        reasons.push(`IP ${c.ip} is in anonymizer range ${hit}*`);
      }
    }
    const g = canonicalGmail(c.email);
    if (g && enabled.has('gmail_variant') && (byGmail.get(g) ?? 0) > 1) {
      signals.push('gmail_variant');
      reasons.push(`same Gmail as ${byGmail.get(g)! - 1} other contact(s) with dots/+tag moved (${g})`);
    }
    if (g && enabled.has('dotted_gmail')) {
      const dots = (c.email.split('@')[0].match(/\./g) ?? []).length;
      if (dots >= 3) {
        signals.push('dotted_gmail');
        reasons.push(`Gmail address with ${dots} dots`);
      }
    }
    if (enabled.has('fake_name') && c.name && (HONORIFIC.test(c.name) || GENERATED_SUFFIX.test(c.name))) {
      signals.push('fake_name');
      reasons.push(`generated-looking name "${c.name}"`);
    }
    if (enabled.has('shared_ip') && c.ip && (byIp.get(c.ip) ?? 0) >= opts.minSignupsPerIp) {
      signals.push('shared_ip');
      reasons.push(`${byIp.get(c.ip)} signups from IP ${c.ip}`);
    }
    if (!signals.length) continue;
    const confidence = signals.some((s) => STRONG.has(s)) || signals.length >= 2 ? 'high' : 'medium';
    out.push({ contact: c, reasons, signals, confidence });
  }
  return out;
}

/** Per-call override, else the server setting, else the built-in list. */
export function ipPrefixesFrom(configured: string[] | undefined, override?: string[]): string[] {
  const clean = (list?: string[]) => (list ?? []).map((p) => p.trim()).filter(Boolean);
  if (clean(override).length) return clean(override);
  if (clean(configured).length) return clean(configured);
  return DEFAULT_ANONYMIZER_PREFIXES;
}

// ------------------------------------------------------ sequence email stats

export interface EmailStat {
  sequence_id: number;
  email_id: number;
  position: number;
  title: string;
  delay: number;
  sent: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
}

/** Every email of one sequence with FluentCRM's own stats. */
export async function sequenceEmailStats(
  client: FluentClient,
  sequenceId: number
): Promise<{ title?: string; emails: EmailStat[] }> {
  const resp = await client.request({
    method: 'GET',
    path: `/sequences/${sequenceId}`,
    query: { with: ['sequence_emails'] },
  });
  const data = isRec(resp.data) ? resp.data : {};
  const sequence = isRec(data.sequence) ? data.sequence : undefined;
  const raw = (Array.isArray(data.sequence_emails) ? data.sequence_emails : []).filter(isRec);
  const emails = raw
    .map((e) => {
      const stats = isRec(e.stats) ? e.stats : {};
      return {
        sequence_id: sequenceId,
        email_id: num(e.id),
        position: 0,
        title: String(e.title ?? e.email_subject ?? ''),
        delay: num(e.delay),
        sent: num(stats.sent ?? stats.total),
        opens: num(stats.views),
        clicks: num(stats.clicks),
        unsubscribes: num(stats.unsubscribers),
      };
    })
    .sort((a, b) => a.delay - b.delay || a.email_id - b.email_id)
    .map((e, i) => ({ ...e, position: i + 1 }));
  return { ...(sequence && typeof sequence.title === 'string' ? { title: sequence.title } : {}), emails };
}

/** Sequences an automation enrolls contacts into (add_to_email_sequence steps). */
export function sequencesOf(steps: FunnelStep[]): number[] {
  const ids = new Set<number>();
  for (const s of steps) {
    if (s.actionName !== 'add_to_email_sequence') continue;
    const id = num(s.settings.sequence_id ?? s.settings.sequence);
    if (id) ids.add(id);
  }
  return [...ids];
}

export const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 10000) / 100 : 0);
