/** FluentCRM sequence intelligence tools — the three operations the REST API
 *  doesn't offer but sequence work constantly needs:
 *
 *  - crm_sequences_preview_schedule: the computed send timetable for a
 *    hypothetical enrollment, before any real contact is enrolled.
 *  - crm_sequences_validate: timing sanity checks (duplicate delays, broken
 *    sending_time configs, ignored settings, timings/delay drift).
 *  - crm_sequences_bulk_update_emails: many merge-mode email updates in one
 *    call, with per-row verification.
 *
 *  Scheduling semantics mirror FluentCampaign Pro's scheduler as verified
 *  against its source (Sequence::subscribe / EmailScheduleHandler /
 *  guessScheduledTime): the `delay` column is an ABSOLUTE offset in seconds
 *  from the contact's enrollment — not relative to the previous email — and
 *  emails sharing a delay are handled as one group. The preview is computed
 *  by the connector, so treat it as a faithful model, not the plugin's own
 *  output. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FluentApiError } from '../../core/errors.js';
import type { FluentClient } from '../../core/http.js';
import { buildMergedBody, diffRecords, verifyWrite, type Diff } from '../../core/merge.js';

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v);

const UNIT_SECONDS: Record<string, number> = {
  second: 1,
  seconds: 1,
  minute: 60,
  minutes: 60,
  hour: 3600,
  hours: 3600,
  day: 86400,
  days: 86400,
  week: 604800,
  weeks: 604800,
};

const DAY_INDEX: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

// ---------------------------------------------------------------- timezones

type Tz = { kind: 'iana'; name: string } | { kind: 'fixed'; minutes: number; label: string };

const tzLabel = (tz: Tz) => (tz.kind === 'iana' ? tz.name : tz.label);

export function parseTimezone(input: string): Tz | undefined {
  const trimmed = input.trim();
  const m = trimmed.match(/^(?:UTC)?([+-])(\d{1,2})(?::(\d{2}))?$/i);
  if (m) {
    const minutes = (Number(m[2]) * 60 + Number(m[3] ?? 0)) * (m[1] === '-' ? -1 : 1);
    return { kind: 'fixed', minutes, label: `UTC${m[1]}${m[2]}${m[3] ? `:${m[3]}` : ''}` };
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: trimmed });
    return { kind: 'iana', name: trimmed };
  } catch {
    return undefined;
  }
}

const DTF_CACHE = new Map<string, Intl.DateTimeFormat>();
function dtfFor(name: string): Intl.DateTimeFormat {
  let dtf = DTF_CACHE.get(name);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: name,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    DTF_CACHE.set(name, dtf);
  }
  return dtf;
}

function offsetMinutes(tz: Tz, epochMs: number): number {
  if (tz.kind === 'fixed') return tz.minutes;
  const parts: Record<string, string> = {};
  for (const p of dtfFor(tz.name).formatToParts(new Date(epochMs))) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUtc - epochMs) / 60000);
}

interface LocalParts { y: number; m: number; d: number; H: number; M: number; weekday: number }

function localParts(tz: Tz, epochMs: number): LocalParts {
  const shifted = new Date(epochMs + offsetMinutes(tz, epochMs) * 60000);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
    H: shifted.getUTCHours(),
    M: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(),
  };
}

/** Epoch of a wall-clock time in tz (two-pass, DST-stable for real inputs). */
function epochAt(tz: Tz, y: number, m: number, d: number, H: number, M: number): number {
  const utcGuess = Date.UTC(y, m - 1, d, H, M);
  let guess = utcGuess - offsetMinutes(tz, utcGuess) * 60000;
  guess = utcGuess - offsetMinutes(tz, guess) * 60000;
  return guess;
}

const pad = (n: number) => String(n).padStart(2, '0');

function fmtLocal(tz: Tz, epochMs: number): string {
  const p = localParts(tz, epochMs);
  return `${p.y}-${pad(p.m)}-${pad(p.d)} ${pad(p.H)}:${pad(p.M)}`;
}

/** Site timezone from WP settings (needs admin creds; falls back to UTC). */
async function siteTimezone(client: FluentClient): Promise<{ tz: Tz; note?: string }> {
  try {
    const resp = await client.wpRequest({ method: 'GET', path: '/wp/v2/settings', tolerant: true });
    if (resp.status === 200 && isRec(resp.data)) {
      const name = resp.data.timezone_string;
      if (typeof name === 'string' && name) {
        const tz = parseTimezone(name);
        if (tz) return { tz };
      }
      const off = Number(resp.data.gmt_offset);
      if (Number.isFinite(off)) {
        return { tz: { kind: 'fixed', minutes: Math.round(off * 60), label: `UTC${off >= 0 ? '+' : ''}${off}` } };
      }
    }
  } catch {
    /* fall through to UTC */
  }
  return {
    tz: { kind: 'fixed', minutes: 0, label: 'UTC' },
    note: 'site timezone unavailable (reading wp/v2/settings requires an admin application password) — times shown in UTC; pass timezone to override',
  };
}

/** "YYYY-MM-DD HH:MM(:SS)" is read in tz; ISO strings with Z/offset as-is. */
export function parseEnrolledAt(input: string, tz: Tz): number | undefined {
  const local = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (local) return epochAt(tz, Number(local[1]), Number(local[2]), Number(local[3]), Number(local[4]), Number(local[5]));
  const parsed = Date.parse(input);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// ------------------------------------------------------------- sequence data

interface SequenceEmailRow {
  id: number;
  title: string;
  status?: string;
  delay: number;
  timings: Rec;
}

function extractEmails(data: unknown): { sequence?: Rec; emails: SequenceEmailRow[] } {
  if (!isRec(data)) return { emails: [] };
  const sequence = isRec(data.sequence) ? data.sequence : undefined;
  const rawList = Array.isArray(data.sequence_emails)
    ? data.sequence_emails
    : sequence && Array.isArray(sequence.emails)
      ? sequence.emails
      : [];
  const emails = rawList.filter(isRec).map((e) => {
    const settings = isRec(e.settings) ? e.settings : {};
    return {
      id: Number(e.id),
      title: String(e.title ?? e.email_subject ?? ''),
      status: typeof e.status === 'string' ? e.status : undefined,
      delay: Number(e.delay ?? 0),
      timings: isRec(settings.timings) ? settings.timings : {},
    };
  });
  return { sequence, emails };
}

async function fetchSequence(client: FluentClient, id: string | number) {
  const resp = await client.request({
    method: 'GET',
    path: `/sequences/${encodeURIComponent(String(id))}`,
    query: { with: ['sequence_emails'] },
  });
  return extractEmails(resp.data);
}

function humanDelay(seconds: number): string {
  if (seconds <= 0) return 'immediate';
  const parts: string[] = [];
  const units: Array<[number, string]> = [
    [604800, 'w'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
    [1, 's'],
  ];
  let rest = seconds;
  for (const [size, label] of units) {
    if (rest >= size) {
      parts.push(`${Math.floor(rest / size)}${label}`);
      rest %= size;
    }
  }
  return parts.join(' ');
}

/** The sending_time array as the plugin sees it after array_filter(). */
function sendingWindow(timings: Rec): { window: string[]; malformed: boolean; present: boolean } {
  const raw = timings.sending_time;
  const list = Array.isArray(raw) ? raw : raw === undefined || raw === null || raw === '' ? [] : [raw];
  const present = Array.isArray(raw) ? raw.length > 0 : !(raw === undefined || raw === null || raw === '');
  const window = list.filter((v): v is string => typeof v === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(v.trim()));
  return { window, malformed: present && window.length === 0, present };
}

function allowedDays(timings: Rec): number[] | undefined {
  for (const key of ['sending_days', 'selected_days', 'days']) {
    const v = timings[key];
    if (Array.isArray(v) && v.length) {
      const idx = v
        .map((d) => (typeof d === 'number' ? d : DAY_INDEX[String(d).trim().toLowerCase()]))
        .filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6);
      if (idx.length) return [...new Set(idx)];
    }
  }
  return undefined;
}

interface ScheduleRow {
  email_id: number;
  title: string;
  status?: string;
  delay: number;
  delay_human: string;
  sends_at: string;
  notes: string[];
}

export function computeSchedule(emails: SequenceEmailRow[], enrolledMs: number, tz: Tz): ScheduleRow[] {
  const sorted = [...emails].sort((a, b) => a.delay - b.delay || a.id - b.id);
  const byDelay = new Map<number, number[]>();
  for (const e of sorted) byDelay.set(e.delay, [...(byDelay.get(e.delay) ?? []), e.id]);

  return sorted.map((e) => {
    const notes: string[] = [];
    const target = enrolledMs + e.delay * 1000;
    const isAnytime = String(e.timings.is_anytime ?? 'yes') !== 'no';
    let sendsAt: string;

    if (isAnytime) {
      sendsAt = `${fmtLocal(tz, target)} ${tzLabel(tz)}`;
      if (e.delay === 0) notes.push('immediate');
      const { present } = sendingWindow(e.timings);
      if (present) notes.push('sending_time is set but ignored — is_anytime is "yes"');
    } else {
      const { window, malformed } = sendingWindow(e.timings);
      if (malformed || window.length === 0) {
        sendsAt = `${fmtLocal(tz, target)} ${tzLabel(tz)} (approx)`;
        notes.push(
          'BROKEN CONFIG: is_anytime "no" with an empty/malformed sending_time — the plugin reads sending_time[0] regardless and will compute a corrupt send datetime. Fix the window or set is_anytime "yes".'
        );
      } else {
        let day = localParts(tz, target);
        const days = allowedDays(e.timings);
        if (days && !days.includes(day.weekday)) {
          let probe = target;
          for (let i = 0; i < 8 && !days.includes(localParts(tz, probe).weekday); i++) probe += 86400000;
          day = localParts(tz, probe);
          notes.push('pushed to the next allowed sending day');
        }
        const [sh, sm] = window[0].split(':').map(Number);
        const startMs = epochAt(tz, day.y, day.m, day.d, sh, sm);
        if (window.length > 1) {
          const [eh, em] = window[1].split(':').map(Number);
          const endMs = epochAt(tz, day.y, day.m, day.d, eh, em);
          sendsAt = `${fmtLocal(tz, startMs)}–${pad(localParts(tz, endMs).H)}:${pad(localParts(tz, endMs).M)} ${tzLabel(tz)}`;
          if (endMs < target) notes.push('the sending window on this date ends before enrollment+delay — the plugin schedules into the past, so the email goes out on the next scheduler run');
        } else {
          sendsAt = `${fmtLocal(tz, startMs)} ${tzLabel(tz)}`;
          if (startMs < target) notes.push('the sending time on this date is before enrollment+delay — the plugin schedules into the past, so the email goes out on the next scheduler run');
        }
      }
    }

    const group = byDelay.get(e.delay)!;
    if (group.length > 1) {
      notes.push(`shares delay ${e.delay} with email${group.length > 2 ? 's' : ''} ${group.filter((id) => id !== e.id).join(', ')} — the scheduler handles same-delay emails as one group`);
    }
    return {
      email_id: e.id,
      title: e.title,
      ...(e.status ? { status: e.status } : {}),
      delay: e.delay,
      delay_human: humanDelay(e.delay),
      sends_at: sendsAt,
      notes,
    };
  });
}

// ---------------------------------------------------------------- validation

interface Finding { level: 'error' | 'warning'; email_id?: number; message: string }

export function validateTimings(emails: SequenceEmailRow[]): Finding[] {
  const findings: Finding[] = [];
  const byDelay = new Map<number, number[]>();
  for (const e of emails) byDelay.set(e.delay, [...(byDelay.get(e.delay) ?? []), e.id]);
  for (const [delay, ids] of byDelay) {
    if (ids.length > 1) {
      findings.push({
        level: 'warning',
        message: `emails ${ids.join(', ')} share delay ${delay}s (${humanDelay(delay)}) — the scheduler walks the sequence with where('delay','>',last), so same-delay emails send together as one group. Stagger them if that is not intended.`,
      });
    }
  }

  for (const e of emails) {
    const timings = e.timings;
    const isAnytime = String(timings.is_anytime ?? 'yes') !== 'no';
    const { malformed, present } = sendingWindow(timings);
    if (!isAnytime && malformed) {
      findings.push({
        level: 'error',
        email_id: e.id,
        message: `is_anytime is "no" but sending_time is empty/malformed (${JSON.stringify(timings.sending_time)}) — the plugin still reads sending_time[0] and computes a corrupt send datetime. Set a valid ["HH:MM","HH:MM"] window or is_anytime "yes".`,
      });
    }
    if (isAnytime && present) {
      findings.push({
        level: 'warning',
        email_id: e.id,
        message: 'sending_time is set but is_anytime is "yes" — the window is silently ignored. Set is_anytime "no" if you want the window applied.',
      });
    }
    const unit = String(timings.delay_unit ?? '');
    const timingDelay = Number(timings.delay);
    if (unit && !(unit in UNIT_SECONDS)) {
      findings.push({ level: 'warning', email_id: e.id, message: `unknown delay_unit "${unit}" — expected minutes/hours/days/weeks.` });
    } else if (unit && Number.isFinite(timingDelay)) {
      const computed = timingDelay * UNIT_SECONDS[unit];
      if (computed !== e.delay) {
        findings.push({
          level: 'error',
          email_id: e.id,
          message: `settings.timings says ${timingDelay} ${unit} (${computed}s) but the delay column is ${e.delay}s — the row was saved without recomputing delay, and the SCHEDULER USES THE COLUMN. Re-save the email (any update via crm_sequences_update_email recomputes it).`,
        });
      }
    }
  }

  const sortedByDelay = [...emails].sort((a, b) => a.delay - b.delay || a.id - b.id);
  emails.forEach((e, i) => {
    if (sortedByDelay[i] && sortedByDelay[i].id !== e.id && sortedByDelay[i].delay !== e.delay) {
      findings.push({
        level: 'warning',
        message: 'display order does not match delay order — emails send strictly by delay, not by their position in the list.',
      });
    }
  });
  return dedupe(findings);
}

function dedupe(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.level}|${f.email_id ?? ''}|${f.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// -------------------------------------------------------------- registration

const err = (text: string) => ({ content: [{ type: 'text' as const, text }], isError: true });

const ID_FIELD = z.union([z.string(), z.number()]).describe('The sequence ID');

export function registerSequenceTools(server: McpServer, client: FluentClient): string[] {
  server.registerTool(
    'crm_sequences_preview_schedule',
    {
      description:
        'Compute the full send timetable of an email sequence for a hypothetical enrollment — every email\'s send datetime from its delay (an ABSOLUTE offset from enrollment), is_anytime, sending_time window, allowed sending days, and the site timezone. [FluentCRM · crm_sequences] Read-only; computed by the connector to mirror FluentCampaign Pro\'s scheduler. Run it after any timing change — misconfigured timing is invisible until a real contact enrolls.',
      inputSchema: {
        id: ID_FIELD,
        enrolled_at: z
          .string()
          .optional()
          .describe('Hypothetical enrollment moment: "YYYY-MM-DD HH:MM" (site/timezone-local) or ISO 8601 with offset. Default: now.'),
        timezone: z
          .string()
          .optional()
          .describe('IANA name ("America/New_York") or UTC offset ("-04:00"). Default: the site\'s WordPress timezone.'),
      },
      outputSchema: {
        ok: z.boolean(),
        sequence: z.object({ id: z.union([z.string(), z.number()]), title: z.string().optional(), status: z.string().optional() }).optional(),
        enrolled_at: z.string(),
        timezone: z.string(),
        schedule: z.array(
          z.object({
            email_id: z.number(),
            title: z.string(),
            status: z.string().optional(),
            delay: z.number(),
            delay_human: z.string(),
            sends_at: z.string(),
            notes: z.array(z.string()),
          })
        ),
        note: z.string().optional(),
      },
      annotations: { title: 'Preview Sequence Schedule', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: { id: string | number; enrolled_at?: string; timezone?: string }) => {
      try {
        const notes: string[] = [];
        let tz: Tz;
        if (args.timezone) {
          const parsed = parseTimezone(args.timezone);
          if (!parsed) return err(`crm_sequences_preview_schedule: unrecognized timezone "${args.timezone}" — pass an IANA name like "America/New_York" or an offset like "-04:00".`);
          tz = parsed;
        } else {
          const site = await siteTimezone(client);
          tz = site.tz;
          if (site.note) notes.push(site.note);
        }
        let enrolledMs = Date.now();
        if (args.enrolled_at) {
          const parsed = parseEnrolledAt(args.enrolled_at, tz);
          if (parsed === undefined) return err(`crm_sequences_preview_schedule: could not parse enrolled_at "${args.enrolled_at}" — use "YYYY-MM-DD HH:MM" or ISO 8601.`);
          enrolledMs = parsed;
        }
        const { sequence, emails } = await fetchSequence(client, args.id);
        if (!emails.length) {
          return err(`crm_sequences_preview_schedule: sequence ${args.id} has no emails (or the response carried none) — nothing to schedule.`);
        }
        const schedule = computeSchedule(emails, enrolledMs, tz);
        const structured = {
          ok: true,
          ...(sequence
            ? { sequence: { id: (sequence.id as string | number) ?? args.id, ...(typeof sequence.title === 'string' ? { title: sequence.title } : {}), ...(typeof sequence.status === 'string' ? { status: sequence.status } : {}) } }
            : {}),
          enrolled_at: `${fmtLocal(tz, enrolledMs)} ${tzLabel(tz)}`,
          timezone: tzLabel(tz),
          schedule,
          ...(notes.length ? { note: notes.join('; ') } : {}),
        };
        const lines = schedule.map(
          (r) => `#${r.email_id} ${r.delay_human.padEnd(10)} ${r.sends_at}  ${r.title}${r.notes.length ? `  [${r.notes.join('; ')}]` : ''}`
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: `Sequence ${args.id} schedule for enrollment at ${structured.enrolled_at} (${schedule.length} emails, computed by the connector):\n${lines.join('\n')}\n${JSON.stringify(structured)}`,
            },
          ],
          structuredContent: structured,
        };
      } catch (e) {
        return err(e instanceof FluentApiError ? e.message : `crm_sequences_preview_schedule failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  server.registerTool(
    'crm_sequences_validate',
    {
      description:
        'Sanity-check an email sequence\'s timing configuration: duplicate delays (same-delay emails send as one group), is_anytime/sending_time mismatches (including the empty-sending_time config that makes the plugin compute a corrupt send datetime), timings-vs-delay-column drift, and display-vs-delay order. [FluentCRM · crm_sequences] Read-only.',
      inputSchema: { id: ID_FIELD },
      outputSchema: {
        ok: z.boolean(),
        valid: z.boolean(),
        emails: z.number(),
        errors: z.number(),
        warnings: z.number(),
        findings: z.array(z.object({ level: z.enum(['error', 'warning']), email_id: z.number().optional(), message: z.string() })),
      },
      annotations: { title: 'Validate Sequence Timing', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: { id: string | number }) => {
      try {
        const { emails } = await fetchSequence(client, args.id);
        if (!emails.length) return err(`crm_sequences_validate: sequence ${args.id} has no emails (or the response carried none).`);
        const findings = validateTimings(emails);
        const errors = findings.filter((f) => f.level === 'error').length;
        const structured = {
          ok: true,
          valid: errors === 0,
          emails: emails.length,
          errors,
          warnings: findings.length - errors,
          findings,
        };
        const head = errors
          ? `❌ sequence ${args.id}: ${errors} error(s), ${findings.length - errors} warning(s) across ${emails.length} emails`
          : `✅ sequence ${args.id}: no errors${findings.length ? `, ${findings.length} warning(s)` : ''} across ${emails.length} emails`;
        const lines = findings.map((f) => `${f.level === 'error' ? '❌' : '⚠️'} ${f.email_id ? `email ${f.email_id}: ` : ''}${f.message}`);
        return {
          content: [{ type: 'text' as const, text: [head, ...lines, JSON.stringify(structured)].join('\n') }],
          structuredContent: structured,
        };
      } catch (e) {
        return err(e instanceof FluentApiError ? e.message : `crm_sequences_validate failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );

  server.registerTool(
    'crm_sequences_bulk_update_emails',
    {
      description:
        'Update many sequence emails in one call. Each row is a merge-mode update: the current email is read, your partial fields are deep-merged onto it (omitted fields preserved), the write is verified, and the response reports per-row diffs and warnings. [FluentCRM · crm_sequences] PUT /sequences/{id}/email/{email_id} per row. No server-side transaction exists over REST: rows already written stay written when a later row fails (stop_on_error controls whether remaining rows are attempted). dry_run:true previews every row\'s diff without writing.',
      inputSchema: {
        id: ID_FIELD.describe('The parent sequence ID'),
        emails: z
          .array(z.record(z.unknown()))
          .min(1)
          .describe('One entry per email: {"email_id": 1305, "settings": {"timings": {...}}, ...} — fields other than email_id are the partial email object (or nest them under "email").'),
        mode: z
          .enum(['merge', 'replace'])
          .optional()
          .describe('"merge" (default) preserves omitted fields; "replace" sends each row\'s fields as the complete email object (requires confirm:true).'),
        confirm: z.boolean().optional().describe('Required (true) for mode:"replace".'),
        dry_run: z.boolean().optional().describe('Compute and return every row\'s diff without writing anything.'),
        stop_on_error: z
          .boolean()
          .optional()
          .describe('Stop at the first failed row (default true); already-written rows are NOT rolled back — re-run with the remaining rows after fixing.'),
      },
      outputSchema: {
        ok: z.boolean(),
        dry_run: z.boolean().optional(),
        summary: z.object({ requested: z.number(), updated: z.number(), failed: z.number(), skipped: z.number() }),
        results: z.array(
          z.object({
            email_id: z.union([z.string(), z.number()]),
            ok: z.boolean(),
            changed: z.record(z.object({ from: z.unknown(), to: z.unknown() })).optional(),
            warnings: z.array(z.string()).optional(),
            error: z.string().optional(),
            skipped: z.boolean().optional(),
          })
        ),
      },
      annotations: { title: 'Bulk Update Sequence Emails', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      id: string | number;
      emails: Rec[];
      mode?: 'merge' | 'replace';
      confirm?: boolean;
      dry_run?: boolean;
      stop_on_error?: boolean;
    }) => {
      const replace = args.mode === 'replace';
      const dryRun = args.dry_run === true;
      if (replace && args.confirm !== true && !dryRun) {
        return err(
          'Refused (nothing was changed): mode:"replace" sends each row\'s fields as the complete email object — omitted fields may be cleared on every listed email. Re-run with confirm: true, or drop mode to deep-merge.'
        );
      }
      const stopOnError = args.stop_on_error !== false;
      type RowResult = { email_id: string | number; ok: boolean; changed?: Diff; warnings?: string[]; error?: string; skipped?: boolean };
      const results: RowResult[] = [];
      let failed = 0;
      let updated = 0;

      for (let i = 0; i < args.emails.length; i++) {
        const row = args.emails[i];
        const emailId = row.email_id as string | number;
        if (emailId === undefined || emailId === null || emailId === '') {
          results.push({ email_id: '(missing)', ok: false, error: `row ${i}: email_id is required` });
          failed++;
          if (stopOnError) {
            results.push(...args.emails.slice(i + 1).map((r) => ({ email_id: (r.email_id as string | number) ?? '(missing)', ok: false, skipped: true as const })));
            break;
          }
          continue;
        }
        const { email_id: _id, ...rest } = row;
        const partial = isRec(rest.email) && Object.keys(rest).length === 1 ? (rest.email as Rec) : rest;
        if (!Object.keys(partial).length) {
          results.push({ email_id: emailId, ok: false, error: 'row has no fields to update' });
          failed++;
          if (stopOnError) {
            results.push(...args.emails.slice(i + 1).map((r) => ({ email_id: (r.email_id as string | number) ?? '(missing)', ok: false, skipped: true as const })));
            break;
          }
          continue;
        }
        const path = `/sequences/${encodeURIComponent(String(args.id))}/email/${encodeURIComponent(String(emailId))}`;
        try {
          const beforeRaw = (await client.request({ method: 'GET', path })).data;
          const supplied = { email: partial };
          const merged = buildMergedBody(beforeRaw, supplied);
          const body = replace ? supplied : merged.body;
          if (dryRun) {
            const changed = merged.base !== undefined ? diffRecords(merged.base, body) : undefined;
            results.push({ email_id: emailId, ok: true, ...(changed ? { changed } : {}) });
            continue;
          }
          await client.request({ method: 'PUT', path, body });
          const afterRaw = (await client.request({ method: 'GET', path })).data;
          const verification = verifyWrite(beforeRaw, afterRaw, supplied, merged.toRecordPath);
          if (verification.rejected) {
            throw new Error('the endpoint returned success but the record did not change — the body was likely ignored');
          }
          updated++;
          results.push({
            email_id: emailId,
            ok: true,
            changed: verification.changed,
            ...(verification.warnings.length ? { warnings: verification.warnings } : {}),
          });
        } catch (e) {
          failed++;
          results.push({ email_id: emailId, ok: false, error: e instanceof FluentApiError ? e.message : e instanceof Error ? e.message : String(e) });
          if (stopOnError) {
            results.push(...args.emails.slice(i + 1).map((r) => ({ email_id: (r.email_id as string | number) ?? '(missing)', ok: false, skipped: true as const })));
            break;
          }
        }
      }

      const skipped = results.filter((r) => r.skipped).length;
      const structured = {
        ok: failed === 0,
        ...(dryRun ? { dry_run: true } : {}),
        summary: { requested: args.emails.length, updated: dryRun ? 0 : updated, failed, skipped },
        results,
      };
      const head = dryRun
        ? `dry run — nothing was written; ${results.filter((r) => r.ok).length}/${args.emails.length} rows previewed`
        : `${updated}/${args.emails.length} emails updated${failed ? `, ${failed} failed` : ''}${skipped ? `, ${skipped} skipped (stop_on_error)` : ''}${failed ? ' — already-written rows are NOT rolled back' : ''}`;
      const result = {
        content: [{ type: 'text' as const, text: `crm_sequences_bulk_update_emails: ${head}\n${JSON.stringify(structured)}` }],
        structuredContent: structured,
        ...(failed ? { isError: true as const } : {}),
      };
      return result;
    }
  );

  return ['crm_sequences_preview_schedule', 'crm_sequences_validate', 'crm_sequences_bulk_update_emails'];
}

/** Map entries for tool_map / the catalog — listed under crm_sequences. */
export const SEQUENCE_EXTRA_MAP_TOOLS = [
  {
    name: 'crm_sequences_preview_schedule',
    summary: 'Computed send timetable for a hypothetical enrollment (connector-side)',
    params: ['id'],
    destructive: false,
    paginated: false,
  },
  {
    name: 'crm_sequences_validate',
    summary: 'Timing sanity checks: duplicate delays, broken sending_time, timings drift',
    params: ['id'],
    destructive: false,
    paginated: false,
  },
  {
    name: 'crm_sequences_bulk_update_emails',
    summary: 'Merge-mode updates for many sequence emails in one call, with per-row verification',
    params: ['id'],
    destructive: false,
    paginated: false,
  },
];
