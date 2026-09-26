/** crm_contacts_bulk_action_by_filter — act on every contact a filter
 *  matches, with a dry run first and an undo record after.
 *
 *  Every write goes through FluentCRM's own endpoints so its hooks run
 *  (verified against FluentCRM 3.2 source):
 *  - set_status → POST /subscribers/do-bulk-action change_contact_status,
 *    which calls Subscriber::updateStatus() and fires
 *    fluentcrm_subscriber_status_to_<status>. For "unsubscribed" that hook
 *    (Cleanup::handleUnsubscribe) cancels the contact's pending emails,
 *    active automation entries and active sequence trackers.
 *  - add_tags / remove_tags → POST /subscribers/sync-segments.
 *  - remove_from_funnel → PUT /funnels/{id}/subscribers/{contact}/status
 *    "cancelled" (keeps history; undo sets it back to active), or
 *    DELETE /funnels/{id}/subscribers (mode "delete", irreversible).
 *  - cancel_sequences → DELETE /sequences/{id}/subscribers, verified by
 *    re-reading the sequence's trackers afterwards. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FluentApiError } from '../../core/errors.js';
import type { FluentClient } from '../../core/http.js';
import type { ExtrasSettings } from '../../core/types.js';
import { isRec, listAll, resolveContacts, SIGNALS, type ContactLite, type Signal } from './analytics-data.js';
import { findSuspicious } from './analytics-tools.js';

type Rec = Record<string, unknown>;

const CONTACT_STATUSES = ['subscribed', 'pending', 'unsubscribed', 'bounced', 'complained', 'transactional'] as const;
type ContactStatus = (typeof CONTACT_STATUSES)[number];
/** Contacts per write request. */
const CHUNK = 100;
/** Parallel per-contact requests (automation cancel mode). */
const CONCURRENCY = 5;
const DEFAULT_MAX_CONTACTS = 500;
const HARD_MAX_CONTACTS = 5000;

const ID = z.coerce.number().int().positive();

const FILTER = z
  .object({
    funnel_id: ID.optional().describe('Contacts who entered this automation'),
    funnel_status: z.enum(['active', 'completed', 'cancelled']).optional().describe('…whose automation entry has this status'),
    list_id: ID.optional().describe('Contacts in this list'),
    tag_id: ID.optional().describe('Contacts with this tag'),
    contact_ids: z.array(ID).min(1).max(200).optional().describe('Exactly these contacts'),
    contact_status: z.array(z.enum(CONTACT_STATUSES)).optional().describe('Keep only contacts with these statuses'),
    since: z.string().optional().describe('Only contacts created on/after "YYYY-MM-DD"'),
    suspicious: z
      .object({
        min_confidence: z.enum(['medium', 'high']).optional(),
        signals: z.array(z.enum(SIGNALS as [Signal, ...Signal[]])).optional(),
        ip_prefixes: z.array(z.string()).optional(),
        min_signups_per_ip: z.number().int().min(2).optional(),
      })
      .optional()
      .describe('Keep only contacts crm_analytics_suspicious_contacts flags, with the same options (e.g. {"min_confidence":"high"})'),
  })
  .describe('Which contacts. Needs a scope: funnel_id, list_id, tag_id or contact_ids.');

const ACTIONS = z
  .object({
    add_tags: z.array(ID).min(1).optional().describe('Tag ids to add'),
    remove_tags: z.array(ID).min(1).optional().describe('Tag ids to remove'),
    set_status: z
      .enum(CONTACT_STATUSES)
      .optional()
      .describe('New contact status. "unsubscribed" fires FluentCRM\'s unsubscribe hooks, which also cancel pending emails, active automations and sequences'),
    remove_from_funnel: z
      .union([
        z.literal(true),
        z.object({ funnel_id: ID.optional(), mode: z.enum(['cancel', 'delete']).optional() }),
      ])
      .optional()
      .describe('Stop the automation for these contacts (default: the filter\'s funnel_id). mode "cancel" (default) keeps the entry as cancelled and can be undone; "delete" removes the entry and its history'),
    cancel_sequences: z.array(ID).min(1).optional().describe('Email sequence ids to stop for these contacts'),
  })
  .describe('What to do to every matching contact — at least one');

type Filter = z.infer<typeof FILTER>;
type Actions = z.infer<typeof ACTIONS>;

interface ActionReport {
  requested: number;
  done: number;
  skipped?: number;
  failed?: number;
  errors?: string[];
  note?: string;
}

const err = (text: string) => ({ content: [{ type: 'text' as const, text }], isError: true });
const chunks = <T>(list: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};
const groupIds = (contacts: ContactLite[], key: (c: ContactLite) => string) => {
  const out: Record<string, number[]> = {};
  for (const c of contacts) (out[key(c)] ??= []).push(c.id);
  return out;
};
const countBy = (contacts: ContactLite[], key: (c: ContactLite) => string) =>
  Object.fromEntries(Object.entries(groupIds(contacts, key)).map(([k, v]) => [k, v.length]));
const msg = (e: unknown) => (e instanceof FluentApiError ? e.message : e instanceof Error ? e.message : String(e));

async function pool<T>(items: T[], worker: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) await worker(items[next++]);
    })
  );
}

/** Matching contacts for a filter. */
async function resolveFilter(client: FluentClient, filter: Filter, settings: ExtrasSettings) {
  if (filter.suspicious) {
    if (filter.funnel_id === undefined && filter.list_id === undefined && filter.tag_id === undefined) {
      throw new Error('filter.suspicious needs a scope — funnel_id, list_id or tag_id');
    }
    const found = await findSuspicious(
      client,
      { funnel_id: filter.funnel_id, list_id: filter.list_id, tag_id: filter.tag_id, since: filter.since, ...filter.suspicious },
      settings
    );
    let contacts = found.flagged.map((f) => ({ ...f.contact, reasons: f.reasons }));
    if (filter.funnel_status) contacts = contacts.filter((c) => c.entry?.status === filter.funnel_status);
    if (filter.contact_status?.length) contacts = contacts.filter((c) => filter.contact_status!.includes(c.status as ContactStatus));
    return { contacts, described: `${found.described}, flagged suspicious${filter.suspicious.min_confidence === 'high' ? ' (high confidence)' : ''}`, truncated: found.truncated };
  }
  return resolveContacts(client, filter);
}

/** Ids of contacts that currently carry a tag (from the contacts list). */
async function contactsWithTag(client: FluentClient, tagId: number, among: ContactLite[]): Promise<Set<number>> {
  // Sources that carry tags answer directly; funnel entries do not.
  if (among.every((c) => c.tags)) return new Set(among.filter((c) => c.tags!.includes(tagId)).map((c) => c.id));
  const res = await listAll(client, '/subscribers', { tags: [tagId] });
  return new Set(res.items.map((r) => Number(r.id)));
}

/** Automation entries (contact id → entry status) for the matched contacts. */
async function funnelEntries(
  client: FluentClient,
  funnelId: number,
  among: ContactLite[],
  sourceFunnelId?: number
): Promise<Map<number, string>> {
  const ids = new Set(among.map((c) => c.id));
  const out = new Map<number, string>();
  if (sourceFunnelId === funnelId && among.every((c) => c.entry)) {
    // The filter read this same automation — its entries are already here.
    for (const c of among) if (c.entry) out.set(c.id, c.entry.status);
    return out;
  }
  const res = await listAll(client, `/funnels/${funnelId}/subscribers`);
  for (const e of res.items) {
    const cid = Number(e.subscriber_id);
    if (ids.has(cid)) out.set(cid, String(e.status ?? ''));
  }
  return out;
}

/** Active sequence trackers (contact id → tracker id) for matched contacts. */
async function activeTrackers(client: FluentClient, sequenceId: number, among: ContactLite[]): Promise<Map<number, number>> {
  const ids = new Set(among.map((c) => c.id));
  const res = await listAll(client, `/sequences/${sequenceId}/subscribers`);
  const out = new Map<number, number>();
  for (const t of res.items) {
    const cid = Number(t.subscriber_id);
    if (ids.has(cid) && t.status === 'active') out.set(cid, Number(t.id));
  }
  return out;
}

interface Plan {
  contacts: ContactLite[];
  addTags: Array<{ tag: number; add: number[]; already: number }>;
  removeTags: Array<{ tag: number; remove: number[]; absent: number }>;
  status?: { to: ContactStatus; change: ContactLite[]; already: number };
  funnel?: { id: number; mode: 'cancel' | 'delete'; entries: Map<number, string>; target: number[] };
  sequences: Array<{ id: number; trackers: Map<number, number> }>;
}

async function plan(client: FluentClient, contacts: ContactLite[], filter: Filter, actions: Actions): Promise<Plan> {
  const p: Plan = { contacts, addTags: [], removeTags: [], sequences: [] };
  for (const tag of actions.add_tags ?? []) {
    const has = await contactsWithTag(client, tag, contacts);
    const add = contacts.filter((c) => !has.has(c.id)).map((c) => c.id);
    p.addTags.push({ tag, add, already: contacts.length - add.length });
  }
  for (const tag of actions.remove_tags ?? []) {
    const has = await contactsWithTag(client, tag, contacts);
    const remove = contacts.filter((c) => has.has(c.id)).map((c) => c.id);
    p.removeTags.push({ tag, remove, absent: contacts.length - remove.length });
  }
  if (actions.set_status) {
    const change = contacts.filter((c) => c.status !== actions.set_status);
    p.status = { to: actions.set_status, change, already: contacts.length - change.length };
  }
  if (actions.remove_from_funnel) {
    const opt = actions.remove_from_funnel === true ? {} : actions.remove_from_funnel;
    const id = opt.funnel_id ?? filter.funnel_id;
    if (id === undefined) throw new Error('remove_from_funnel needs a funnel_id (in the action or the filter)');
    const mode = opt.mode ?? 'cancel';
    const entries = await funnelEntries(client, id, contacts, filter.funnel_id);
    // cancel: only entries still running (completed ones cannot change, and
    // cancelled ones already are); delete: every entry.
    const target = [...entries.entries()].filter(([, s]) => (mode === 'delete' ? true : s === 'active')).map(([cid]) => cid);
    p.funnel = { id, mode, entries, target };
  }
  for (const seq of actions.cancel_sequences ?? []) {
    p.sequences.push({ id: seq, trackers: await activeTrackers(client, seq, contacts) });
  }
  return p;
}

function describePlan(p: Plan) {
  return {
    ...(p.addTags.length ? { add_tags: p.addTags.map((t) => ({ tag_id: t.tag, would_add: t.add.length, already_tagged: t.already })) } : {}),
    ...(p.removeTags.length ? { remove_tags: p.removeTags.map((t) => ({ tag_id: t.tag, would_remove: t.remove.length, not_tagged: t.absent })) } : {}),
    ...(p.status
      ? {
          set_status: {
            to: p.status.to,
            would_change: p.status.change.length,
            from: countBy(p.status.change, (c) => c.status || '(none)'),
            already: p.status.already,
            ...(p.status.to === 'unsubscribed' ? { side_effects: "FluentCRM's unsubscribe hook cancels their pending emails, active automations and sequences" } : {}),
          },
        }
      : {}),
    ...(p.funnel
      ? {
          remove_from_funnel: {
            funnel_id: p.funnel.id,
            mode: p.funnel.mode,
            would_change: p.funnel.target.length,
            entries_by_status: Object.fromEntries(
              Object.entries(groupIdsFromMap(p.funnel.entries)).map(([s, ids]) => [s, ids.length])
            ),
            not_in_automation: p.contacts.length - p.funnel.entries.size,
          },
        }
      : {}),
    ...(p.sequences.length ? { cancel_sequences: p.sequences.map((s) => ({ sequence_id: s.id, active_trackers: s.trackers.size })) } : {}),
  };
}

function groupIdsFromMap(m: Map<number, string>): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const [id, s] of m) (out[s] ??= []).push(id);
  return out;
}

async function execute(client: FluentClient, p: Plan) {
  const report: Record<string, ActionReport | ActionReport[]> = {};
  const undo: Rec = {};
  const run = async (r: ActionReport, fn: () => Promise<void>, count: number) => {
    try {
      await fn();
      r.done += count;
    } catch (e) {
      r.failed = (r.failed ?? 0) + count;
      (r.errors ??= []).push(msg(e));
    }
  };

  if (p.addTags.length) {
    const reports: ActionReport[] = [];
    const added: Record<string, number[]> = {};
    for (const t of p.addTags) {
      const r: ActionReport = { requested: t.add.length, done: 0, skipped: t.already };
      const ok: number[] = [];
      for (const chunk of chunks(t.add, CHUNK)) {
        await run(r, async () => {
          await client.request({ method: 'POST', path: '/subscribers/sync-segments', body: { type: 'tags', subscribers: chunk, attach: [t.tag], find_by: 'id' } });
          ok.push(...chunk);
        }, chunk.length);
      }
      added[String(t.tag)] = ok;
      reports.push(r);
    }
    report.add_tags = reports;
    undo.remove_tags = added;
  }
  if (p.removeTags.length) {
    const reports: ActionReport[] = [];
    const removed: Record<string, number[]> = {};
    for (const t of p.removeTags) {
      const r: ActionReport = { requested: t.remove.length, done: 0, skipped: t.absent };
      const ok: number[] = [];
      for (const chunk of chunks(t.remove, CHUNK)) {
        await run(r, async () => {
          await client.request({ method: 'POST', path: '/subscribers/sync-segments', body: { type: 'tags', subscribers: chunk, detach: [t.tag], find_by: 'id' } });
          ok.push(...chunk);
        }, chunk.length);
      }
      removed[String(t.tag)] = ok;
      reports.push(r);
    }
    report.remove_tags = reports;
    undo.add_tags = removed;
  }
  if (p.status) {
    const r: ActionReport = { requested: p.status.change.length, done: 0, skipped: p.status.already };
    const previous: Record<string, number[]> = {};
    for (const chunk of chunks(p.status.change, CHUNK)) {
      await run(r, async () => {
        await client.request({
          method: 'POST',
          path: '/subscribers/do-bulk-action',
          body: { action_name: 'change_contact_status', subscriber_ids: chunk.map((c) => c.id), new_status: p.status!.to },
        });
        for (const c of chunk) (previous[c.status || 'subscribed'] ??= []).push(c.id);
      }, chunk.length);
    }
    report.set_status = r;
    undo.set_status = previous; // previous status → contact ids
  }
  if (p.funnel) {
    const f = p.funnel;
    const r: ActionReport = { requested: f.target.length, done: 0, skipped: f.entries.size - f.target.length };
    const changed: number[] = [];
    if (f.mode === 'delete') {
      for (const chunk of chunks(f.target, CHUNK)) {
        await run(r, async () => {
          await client.request({ method: 'DELETE', path: `/funnels/${f.id}/subscribers`, body: { subscriber_ids: chunk } });
          changed.push(...chunk);
        }, chunk.length);
      }
      r.note = 'entries deleted with their history — this part cannot be undone';
    } else {
      await pool(f.target, async (cid) => {
        await run(r, async () => {
          await client.request({ method: 'PUT', path: `/funnels/${f.id}/subscribers/${cid}/status`, body: { status: 'cancelled' } });
          changed.push(cid);
        }, 1);
      });
      undo.restore_funnel_entries = { funnel_id: f.id, set_status: 'active', contact_ids: changed };
    }
    report.remove_from_funnel = r;
  }
  if (p.sequences.length) {
    const reports: ActionReport[] = [];
    for (const s of p.sequences) {
      const contacts = [...s.trackers.keys()];
      const r: ActionReport = { requested: contacts.length, done: 0 };
      for (const chunk of chunks(contacts, CHUNK)) {
        try {
          await client.request({
            method: 'DELETE',
            path: `/sequences/${s.id}/subscribers`,
            body: { tracker_ids: chunk.map((c) => s.trackers.get(c)), subscriber_ids: chunk },
          });
        } catch (e) {
          (r.errors ??= []).push(msg(e));
        }
      }
      // Verify: the endpoint is FluentCRM Pro's — count what actually stopped.
      const still = await activeTrackers(client, s.id, p.contacts.filter((c) => s.trackers.has(c.id)));
      r.done = contacts.length - still.size;
      if (still.size) {
        r.failed = still.size;
        r.note = `${still.size} contact(s) are still active in sequence ${s.id} after the request`;
      }
      reports.push(r);
    }
    report.cancel_sequences = reports;
  }
  return { report, undo };
}

function preview(p: Plan, described: string, sampleSize: number) {
  return {
    filter: described,
    matched: p.contacts.length,
    by_status: countBy(p.contacts, (c) => c.status || '(none)'),
    sample: p.contacts.slice(0, sampleSize).map((c) => ({
      id: c.id,
      email: c.email,
      status: c.status,
      ...((c as ContactLite & { reasons?: string[] }).reasons ? { why: (c as ContactLite & { reasons?: string[] }).reasons!.slice(0, 2) } : {}),
    })),
    changes: describePlan(p),
  };
}

export function registerBulkFilterTool(server: McpServer, client: FluentClient, settings: ExtrasSettings = {}): string[] {
  server.registerTool(
    'crm_contacts_bulk_action_by_filter',
    {
      description:
        'Apply actions to every contact a filter matches — add/remove tags, set status, stop an automation, stop email sequences — through FluentCRM\'s own endpoints, so its hooks run (unsubscribing cancels pending emails, automations and sequences). [FluentCRM · crm_contacts] ⚠ Hard to undo — requires confirm:true. Run with dry_run:true first: it returns the match count, a sample and what each action would change, and writes nothing. A real run returns per-action results plus an `undo` record (each contact\'s previous status, the tags it added, the automation entries it cancelled).',
      inputSchema: {
        filter: FILTER,
        actions: ACTIONS,
        dry_run: z.boolean().optional().describe('Preview only: counts, a sample and per-action changes; nothing is written'),
        confirm: z.boolean().optional().describe('Must be true for a real run'),
        max_contacts: z
          .number()
          .int()
          .min(1)
          .max(HARD_MAX_CONTACTS)
          .optional()
          .describe(`Refuse a real run that matches more contacts than this (default ${DEFAULT_MAX_CONTACTS})`),
        sample_size: z.number().int().min(0).max(25).optional().describe('Contacts shown in the preview (default 5)'),
      },
      annotations: { title: 'Bulk Action by Filter', readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (args: { filter: Filter; actions: Actions; dry_run?: boolean; confirm?: boolean; max_contacts?: number; sample_size?: number }) => {
      const tool = 'crm_contacts_bulk_action_by_filter';
      const f = args.filter ?? {};
      if (f.funnel_id === undefined && f.list_id === undefined && f.tag_id === undefined && !f.contact_ids?.length) {
        return err(`${tool}: the filter needs a scope — funnel_id, list_id, tag_id or contact_ids. Nothing was read or changed.`);
      }
      const a = args.actions ?? {};
      if (!a.add_tags && !a.remove_tags && !a.set_status && !a.remove_from_funnel && !a.cancel_sequences) {
        return err(`${tool}: actions is empty — pass at least one of add_tags, remove_tags, set_status, remove_from_funnel, cancel_sequences.`);
      }
      try {
        const resolved = await resolveFilter(client, f, settings);
        const p = await plan(client, resolved.contacts, f, a);
        const view = preview(p, resolved.described, args.sample_size ?? 5);
        const cap = args.max_contacts ?? DEFAULT_MAX_CONTACTS;
        if (resolved.truncated) {
          return err(`${tool}: the contact source was truncated at the read cap, so the match set is incomplete — narrow the filter. Nothing was changed.\n${JSON.stringify(view)}`);
        }
        const isDry = args.dry_run === true || args.confirm !== true;
        if (isDry) {
          const structured = { ok: true, dry_run: true, ...view, next: 'nothing was written — re-run with confirm:true (and without dry_run) to apply' };
          const head =
            args.dry_run === true
              ? `${tool} dry run: ${p.contacts.length} contact(s) match ${resolved.described} — nothing was written`
              : `Refused (nothing was changed): ${tool} is hard to undo and needs confirm:true. This is what it would do to ${p.contacts.length} contact(s):`;
          return { ...(args.dry_run === true ? {} : { isError: true as const }), content: [{ type: 'text' as const, text: `${head}\n${JSON.stringify(structured)}` }], structuredContent: structured };
        }
        if (p.contacts.length > cap) {
          return err(`Refused (nothing was changed): ${p.contacts.length} contacts match, above max_contacts ${cap}. Check the dry run, then raise max_contacts (up to ${HARD_MAX_CONTACTS}) if that is intended.`);
        }
        if (!p.contacts.length) {
          const structured = { ok: true, ...view, note: 'no contacts matched — nothing to do' };
          return { content: [{ type: 'text' as const, text: `${tool}: no contacts match — nothing was changed.\n${JSON.stringify(structured)}` }], structuredContent: structured };
        }
        const { report, undo } = await execute(client, p);
        const failed = Object.values(report).flat().some((r) => (r.failed ?? 0) > 0);
        const structured = {
          ok: !failed,
          matched: p.contacts.length,
          filter: resolved.described,
          results: report,
          undo,
          undo_hint:
            'To revert: set_status — for each previous status, run this tool with filter.contact_ids and that set_status; tags — remove_tags/add_tags with the listed ids; restore_funnel_entries — PUT /funnels/{id}/subscribers/{contact}/status {status:"active"} (crm_automations_update_funnel_subscription_status).',
        };
        const head = `${tool}: applied to ${p.contacts.length} contact(s) matching ${resolved.described}${failed ? ' — SOME WRITES FAILED, see results' : ''}`;
        return { ...(failed ? { isError: true as const } : {}), content: [{ type: 'text' as const, text: `${head}\n${JSON.stringify(structured)}` }], structuredContent: structured };
      } catch (e) {
        return err(`${tool}: ${msg(e)} — nothing further was changed.`);
      }
    }
  );
  return ['crm_contacts_bulk_action_by_filter'];
}

export const BULK_FILTER_MAP_TOOLS = [
  {
    name: 'crm_contacts_bulk_action_by_filter',
    summary: 'Tag / set status / stop automation or sequences for every contact a filter matches (dry run + undo)',
    params: ['filter', 'actions'],
    destructive: true,
    paginated: false,
    area: 'crm_contacts',
  },
];
