/** FluentCRM analytics — read-only answers the REST API only offers as raw,
 *  per-record pages. Each tool reads every page it needs server-side and
 *  returns a compact table, so a question like "which challenge email loses
 *  the most subscribers?" is one call and a few KB instead of 70 calls. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FluentApiError } from '../../core/errors.js';
import type { FluentClient } from '../../core/http.js';
import type { ExtrasSettings } from '../../core/types.js';
import {
  detectSuspicious,
  fetchFunnel,
  finalStep,
  ipPrefixesFrom,
  isRec,
  isWithin,
  listAll,
  pct,
  resolveContacts,
  sequenceEmailStats,
  sequencesOf,
  SIGNALS,
  stepPath,
  type EmailStat,
  type Signal,
} from './analytics-data.js';

type Rec = Record<string, unknown>;

const err = (text: string) => ({ content: [{ type: 'text' as const, text }], isError: true });
const fail = (tool: string, e: unknown) =>
  err(e instanceof FluentApiError ? e.message : `${tool} failed: ${e instanceof Error ? e.message : String(e)}`);
const reply = (head: string, structured: Rec) => ({
  content: [{ type: 'text' as const, text: `${head}\n${JSON.stringify(structured)}` }],
  structuredContent: structured,
});
const clip = (s: string, n = 60) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const ID = z.coerce.number().int().positive();
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;

// ------------------------------------------------------------ email stats

const SORT_KEYS = ['position', 'sent', 'opens', 'clicks', 'unsubscribes', 'unsubscribe_rate', 'click_rate', 'open_rate'] as const;
type SortKey = (typeof SORT_KEYS)[number];

export interface EmailRow extends EmailStat {
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
}

export function withRates(e: EmailStat): EmailRow {
  return { ...e, open_rate: pct(e.opens, e.sent), click_rate: pct(e.clicks, e.sent), unsubscribe_rate: pct(e.unsubscribes, e.sent) };
}

export function sortRows(rows: EmailRow[], key: SortKey, order: 'asc' | 'desc'): EmailRow[] {
  const dir = order === 'asc' ? 1 : -1;
  return [...rows].sort(
    (a, b) => (a[key] === b[key] ? a.sequence_id - b.sequence_id || a.position - b.position : (a[key] > b[key] ? 1 : -1) * dir)
  );
}

// ------------------------------------------------------------ registration

export function registerAnalyticsTools(server: McpServer, client: FluentClient, settings: ExtrasSettings = {}): string[] {
  server.registerTool(
    'crm_analytics_funnel_email_stats',
    {
      description:
        'Per-email performance for an automation (every email sequence it enrolls contacts into) or for given sequences: sent, opens, clicks, unsubscribes and each as a rate of sent. [FluentCRM · crm_analytics] Read-only; uses FluentCRM\'s own per-email stats. Sort by any column — e.g. sort_by:"unsubscribes" answers "which email loses the most subscribers?" in one call.',
      inputSchema: {
        funnel_id: ID.optional().describe('Automation (funnel) id — includes every sequence its "add to email sequence" steps use'),
        sequence_id: z.array(ID).min(1).max(20).optional().describe('Email sequence id(s), instead of or in addition to funnel_id'),
        sort_by: z.enum(SORT_KEYS).optional().describe('Column to sort by (default "position"; rates are % of sent)'),
        order: z.enum(['asc', 'desc']).optional().describe('Default: desc for metrics, asc for position'),
        limit: z.number().int().min(1).max(200).optional().describe('Rows to return (default 20); totals always cover every email'),
      },
      annotations: { title: 'Automation Email Stats', ...READ_ONLY },
    },
    async (args: { funnel_id?: number; sequence_id?: number[]; sort_by?: SortKey; order?: 'asc' | 'desc'; limit?: number }) => {
      const tool = 'crm_analytics_funnel_email_stats';
      if (args.funnel_id === undefined && !args.sequence_id?.length) return err(`${tool}: pass funnel_id or sequence_id.`);
      try {
        const sequenceIds = new Set<number>(args.sequence_id ?? []);
        let funnelTitle: string | undefined;
        if (args.funnel_id !== undefined) {
          const funnel = await fetchFunnel(client, args.funnel_id);
          funnelTitle = funnel.title;
          for (const id of sequencesOf(funnel.steps)) sequenceIds.add(id);
          if (!sequenceIds.size) {
            return err(`${tool}: automation ${args.funnel_id} has no "add to email sequence" steps — pass sequence_id for the sequences you want.`);
          }
        }
        const perSequence = await Promise.all([...sequenceIds].map(async (id) => ({ id, ...(await sequenceEmailStats(client, id)) })));
        const rows = perSequence.flatMap((s) => s.emails.map(withRates));
        const sortBy = args.sort_by ?? 'position';
        const order = args.order ?? (sortBy === 'position' ? 'asc' : 'desc');
        const limit = args.limit ?? 20;
        const sorted = sortRows(rows, sortBy, order).slice(0, limit);
        const sequences = perSequence.map((s) => {
          const sent = s.emails.reduce((n, e) => n + e.sent, 0);
          const unsubscribes = s.emails.reduce((n, e) => n + e.unsubscribes, 0);
          const clicks = s.emails.reduce((n, e) => n + e.clicks, 0);
          return { sequence_id: s.id, ...(s.title ? { title: clip(s.title) } : {}), emails: s.emails.length, sent, clicks, unsubscribes, unsubscribe_rate: pct(unsubscribes, sent) };
        });
        const columns = ['sequence_id', 'email_id', 'position', 'title', 'sent', 'opens', 'clicks', 'unsubscribes', 'unsubscribe_rate', 'click_rate'] as const;
        const structured = {
          ok: true,
          ...(args.funnel_id !== undefined ? { funnel: { id: args.funnel_id, ...(funnelTitle ? { title: funnelTitle } : {}) } } : {}),
          sequences,
          sort: { by: sortBy, order },
          emails_total: rows.length,
          columns,
          rows: sorted.map((r) => columns.map((c) => (c === 'title' ? clip(r.title, 48) : r[c]))),
          note: 'rates are % of sent; opens depend on the site\'s open tracking' + (rows.length > sorted.length ? `; showing ${sorted.length} of ${rows.length} emails — raise limit for more` : ''),
        };
        const top = sorted[0];
        const head = top
          ? `${tool}: ${rows.length} emails in ${sequenceIds.size} sequence(s); top by ${sortBy}: "${clip(top.title, 60)}" (sequence ${top.sequence_id}) — ${top.unsubscribes} unsubscribes of ${top.sent} sent (${top.unsubscribe_rate}%)`
          : `${tool}: no emails found`;
        return reply(head, structured);
      } catch (e) {
        return fail(tool, e);
      }
    }
  );

  server.registerTool(
    'crm_analytics_funnel_exits',
    {
      description:
        'Where and why contacts left an automation: completed entries split into "reached the final step" vs "stopped early at an End step" (with the branch that sent them there), and cancelled entries grouped by the contact\'s status (unsubscribed / bounced / complained / pending) and by the step where they stopped. [FluentCRM · crm_analytics] Read-only. Use this for "how many completed?" — a raw completed count also includes contacts ended early by a condition.',
      inputSchema: { funnel_id: ID.describe('Automation (funnel) id') },
      annotations: { title: 'Automation Exits', ...READ_ONLY },
    },
    async (args: { funnel_id: number }) => {
      const tool = 'crm_analytics_funnel_exits';
      try {
        const funnel = await fetchFunnel(client, args.funnel_id);
        const final = finalStep(funnel.steps);
        const titleOf = (id: number) => funnel.steps.find((s) => s.id === id)?.title ?? `step ${id}`;
        const count = async (status?: string) => {
          const resp = await client.request({
            method: 'GET',
            path: `/funnels/${args.funnel_id}/subscribers`,
            query: { per_page: 1, page: 1, ...(status ? { status } : {}) },
          });
          const fs = isRec(resp.data) && isRec(resp.data.funnel_subscribers) ? resp.data.funnel_subscribers : {};
          return Number(fs.total ?? 0);
        };
        const [total, active, completedRes, cancelledRes] = await Promise.all([
          count(),
          count('active'),
          listAll(client, `/funnels/${args.funnel_id}/subscribers`, { status: 'completed' }),
          listAll(client, `/funnels/${args.funnel_id}/subscribers`, { status: 'cancelled' }),
        ]);

        let reached = 0;
        const early = new Map<number, number>();
        for (const e of completedRes.items) {
          const last = Number(e.last_sequence_id ?? 0);
          if (final && last && isWithin(funnel.steps, last, final.id)) reached++;
          else early.set(last, (early.get(last) ?? 0) + 1);
        }
        const byContactStatus = new Map<string, number>();
        const byStep = new Map<number, number>();
        for (const e of cancelledRes.items) {
          const status = isRec(e.subscriber) ? String(e.subscriber.status ?? 'unknown') : 'contact deleted';
          byContactStatus.set(status, (byContactStatus.get(status) ?? 0) + 1);
          const last = Number(e.last_sequence_id ?? 0);
          byStep.set(last, (byStep.get(last) ?? 0) + 1);
        }
        const sortDesc = <K>(m: Map<K, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
        const structured = {
          ok: true,
          funnel: { id: args.funnel_id, ...(funnel.title ? { title: funnel.title } : {}), steps: funnel.steps.length },
          entries: {
            total,
            active,
            completed: completedRes.items.length,
            cancelled: cancelledRes.items.length,
            other: Math.max(0, total - active - completedRes.items.length - cancelledRes.items.length),
          },
          completed: {
            reached_final_step: reached,
            ...(final ? { final_step: { id: final.id, title: final.title } } : {}),
            ended_early: sortDesc(early).map(([step, n]) => ({ step_id: step, path: step ? stepPath(funnel.steps, step) : '(no step recorded)', count: n })),
          },
          cancelled: {
            by_contact_status: Object.fromEntries(sortDesc(byContactStatus)),
            by_step: sortDesc(byStep).map(([step, n]) => ({ step_id: step, title: step ? titleOf(step) : '(before the first step)', count: n })),
          },
          ...(completedRes.truncated || cancelledRes.truncated ? { note: 'entry lists were truncated at the read cap — counts are partial' } : {}),
        };
        const early1 = structured.completed.ended_early.reduce((n, r) => n + r.count, 0);
        const head =
          `${tool}: automation ${args.funnel_id}${funnel.title ? ` "${funnel.title}"` : ''} — ${reached} reached the final step` +
          `${early1 ? `, ${early1} completed early at an End step` : ''}, ${cancelledRes.items.length} cancelled, ${active} still active (of ${total}).`;
        return reply(head, structured);
      } catch (e) {
        return fail(tool, e);
      }
    }
  );

  server.registerTool(
    'crm_analytics_suspicious_contacts',
    {
      description:
        'Flag likely bot signups, with the reason for each flag: IP in an anonymizer/Tor range (list set by the server admin, overridable per call), the same Gmail repeated with dots or +tags moved, Gmail addresses with 3+ dots, generated-looking names ("Mrs. Desiree Luettgen", "Pasquale Predovic Jr."), and several signups from one IP. [FluentCRM · crm_analytics] Read-only. Scope with funnel_id, list_id or tag_id (one is required). "high" = an anonymizer IP, a Gmail variant, or 2+ signals; "medium" = one weak signal (review before acting). Feed the same criteria to crm_contacts_bulk_action_by_filter to act on them.',
      inputSchema: {
        funnel_id: ID.optional().describe('Scan contacts who entered this automation (one of funnel_id / list_id / tag_id is required)'),
        list_id: ID.optional().describe('Scan contacts in this list'),
        tag_id: ID.optional().describe('Scan contacts with this tag'),
        since: z.string().optional().describe('Only contacts created on/after this date, "YYYY-MM-DD"'),
        min_confidence: z.enum(['medium', 'high']).optional().describe('Lowest confidence to return (default "medium")'),
        signals: z.array(z.enum(SIGNALS as [Signal, ...Signal[]])).optional().describe('Limit to these signals (default all)'),
        ip_prefixes: z.array(z.string()).optional().describe('Anonymizer IP prefixes for this call, e.g. ["185.220.","23.129.64."] (default: the server\'s list)'),
        min_signups_per_ip: z.number().int().min(2).optional().describe('Signups from one IP that count as shared_ip (default 3)'),
        page: z.number().int().min(1).optional().describe('Page of flagged contacts (default 1)'),
        per_page: z.number().int().min(1).max(100).optional().describe('Flagged contacts per page (default 15)'),
      },
      annotations: { title: 'Suspicious Signups', ...READ_ONLY },
    },
    async (args: SuspiciousArgs) => {
      const tool = 'crm_analytics_suspicious_contacts';
      if (args.funnel_id === undefined && args.list_id === undefined && args.tag_id === undefined) {
        return err(`${tool}: pass funnel_id, list_id or tag_id — scanning every contact on the site is too slow for one call.`);
      }
      try {
        const result = await findSuspicious(client, args, settings);
        const perPage = args.per_page ?? 15;
        const page = args.page ?? 1;
        const slice = result.flagged.slice((page - 1) * perPage, page * perPage);
        const bySignal: Record<string, number> = {};
        for (const f of result.flagged) for (const s of f.signals) bySignal[s] = (bySignal[s] ?? 0) + 1;
        const structured = {
          ok: true,
          source: result.described,
          scanned: result.scanned,
          flagged: result.flagged.length,
          by_confidence: {
            high: result.flagged.filter((f) => f.confidence === 'high').length,
            medium: result.flagged.filter((f) => f.confidence === 'medium').length,
          },
          by_signal: bySignal,
          contacts: slice.map((f) => ({
            id: f.contact.id,
            email: f.contact.email,
            ...(f.contact.name ? { name: clip(f.contact.name, 40) } : {}),
            ...(f.contact.ip ? { ip: f.contact.ip } : {}),
            status: f.contact.status,
            ...(f.contact.created_at ? { created: f.contact.created_at.slice(0, 10) } : {}),
            confidence: f.confidence,
            reasons: f.reasons,
          })),
          pagination: { page, per_page: perPage, total: result.flagged.length, total_pages: Math.max(1, Math.ceil(result.flagged.length / perPage)) },
          ...(result.truncated ? { note: 'the contact source was truncated at the read cap — narrow with since or a smaller scope' } : {}),
        };
        const head = `${tool}: ${result.flagged.length} of ${result.scanned} contacts flagged (${structured.by_confidence.high} high, ${structured.by_confidence.medium} medium) in ${result.described}`;
        return reply(head, structured);
      } catch (e) {
        return fail(tool, e);
      }
    }
  );

  return ['crm_analytics_funnel_email_stats', 'crm_analytics_funnel_exits', 'crm_analytics_suspicious_contacts'];
}

export interface SuspiciousArgs {
  funnel_id?: number;
  list_id?: number;
  tag_id?: number;
  since?: string;
  min_confidence?: 'medium' | 'high';
  signals?: Signal[];
  ip_prefixes?: string[];
  min_signups_per_ip?: number;
  page?: number;
  per_page?: number;
}

/** Shared by the analytics tool and the bulk-by-filter tool. */
export async function findSuspicious(client: FluentClient, args: SuspiciousArgs, settings: ExtrasSettings = {}) {
  const { contacts, described, truncated } = await resolveContacts(client, {
    funnel_id: args.funnel_id,
    list_id: args.list_id,
    tag_id: args.tag_id,
    since: args.since,
  });
  const flagged = detectSuspicious(contacts, {
    ipPrefixes: ipPrefixesFrom(settings.suspiciousIpPrefixes, args.ip_prefixes),
    minSignupsPerIp: args.min_signups_per_ip ?? 3,
    signals: args.signals,
  })
    .filter((f) => args.min_confidence !== 'high' || f.confidence === 'high')
    .sort((a, b) => (a.confidence === b.confidence ? b.contact.id - a.contact.id : a.confidence === 'high' ? -1 : 1));
  return { flagged, scanned: contacts.length, described, truncated };
}

export const ANALYTICS_MAP_TOOLS = [
  {
    name: 'crm_analytics_funnel_email_stats',
    summary: 'Per-email sent/opens/clicks/unsubscribes (+ rates) for an automation\'s sequences, sortable',
    params: ['funnel_id | sequence_id'],
    destructive: false,
    paginated: false,
    area: 'crm_analytics',
  },
  {
    name: 'crm_analytics_funnel_exits',
    summary: 'Completed (reached end vs ended early) and cancelled entries by contact status and step',
    params: ['funnel_id'],
    destructive: false,
    paginated: false,
    area: 'crm_analytics',
  },
  {
    name: 'crm_analytics_suspicious_contacts',
    summary: 'Likely bot signups with reasons (anonymizer IPs, Gmail dot variants, fake names, shared IPs)',
    params: [],
    destructive: false,
    paginated: true,
    area: 'crm_analytics',
  },
];
