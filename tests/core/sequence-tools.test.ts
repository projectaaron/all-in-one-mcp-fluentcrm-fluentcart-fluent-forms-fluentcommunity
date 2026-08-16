/** Tests for the FluentCRM sequence intelligence tools: the connector-side
 *  schedule computation, the timing validator, and the bulk email updater. */
import { describe, expect, it } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  computeSchedule,
  parseEnrolledAt,
  parseTimezone,
  registerSequenceTools,
  validateTimings,
} from '../../src/products/fluentcrm/sequence-tools.js';
import { makeClient, mockFetch, type CapturedRequest } from '../helpers.js';

const NY = parseTimezone('America/New_York')!;
const UTC = parseTimezone('+00:00')!;

// 2026-08-20 15:32 EDT (UTC-4) — the enrollment moment from the field report.
const ENROLLED = parseEnrolledAt('2026-08-20 15:32', NY)!;

function email(id: number, delay: number, timings: Record<string, unknown> = {}, title = `Email ${id}`) {
  return { id, title, status: 'published', delay, timings };
}

describe('parseTimezone / parseEnrolledAt', () => {
  it('accepts IANA names and UTC offsets, rejects junk', () => {
    expect(parseTimezone('America/New_York')).toEqual({ kind: 'iana', name: 'America/New_York' });
    expect(parseTimezone('-04:00')).toEqual({ kind: 'fixed', minutes: -240, label: 'UTC-04:00' });
    expect(parseTimezone('+5')).toMatchObject({ minutes: 300 });
    expect(parseTimezone('Mars/Olympus')).toBeUndefined();
  });

  it('reads local datetimes in the given timezone', () => {
    // 15:32 EDT == 19:32 UTC.
    expect(new Date(ENROLLED).toISOString()).toBe('2026-08-20T19:32:00.000Z');
    expect(parseEnrolledAt('2026-08-20T19:32:00Z', NY)).toBe(ENROLLED);
    expect(parseEnrolledAt('yesterday-ish', NY)).toBeUndefined();
  });
});

describe('computeSchedule', () => {
  it('treats delay as absolute-from-enrollment, not relative to the previous email', () => {
    const rows = computeSchedule(
      [email(1, 0, { is_anytime: 'yes' }), email(2, 3600, { is_anytime: 'yes' }), email(3, 86400, { is_anytime: 'yes' })],
      ENROLLED,
      NY
    );
    expect(rows.map((r) => r.sends_at)).toEqual([
      '2026-08-20 15:32 America/New_York',
      '2026-08-20 16:32 America/New_York',
      '2026-08-21 15:32 America/New_York', // 1 day after ENROLLMENT, not after email 2
    ]);
    expect(rows[0].notes).toContain('immediate');
    expect(rows.map((r) => r.delay_human)).toEqual(['immediate', '1h', '1d']);
  });

  it('applies the sending_time window on the target day when is_anytime is "no"', () => {
    const rows = computeSchedule(
      [email(1, 86400, { is_anytime: 'no', sending_time: ['05:00', '05:30'] })],
      ENROLLED,
      NY
    );
    expect(rows[0].sends_at).toBe('2026-08-21 05:00–05:30 America/New_York');
    // 05:30 on the target day is before enrollment+delay (15:32) — flagged.
    expect(rows[0].notes.some((n) => n.includes('next scheduler run'))).toBe(true);
  });

  it('flags the broken empty-sending_time config instead of inventing a time', () => {
    const rows = computeSchedule([email(1, 3600, { is_anytime: 'no', sending_time: ['', ''] })], ENROLLED, NY);
    expect(rows[0].notes.some((n) => n.includes('BROKEN CONFIG'))).toBe(true);
  });

  it('pushes to the next allowed sending day and marks same-delay groups', () => {
    // 2026-08-21 is a Friday; only Monday allowed → pushed to 08-24.
    const rows = computeSchedule(
      [
        email(1, 86400, { is_anytime: 'no', sending_time: ['09:00'], sending_days: ['mon'] }),
        email(2, 86400, { is_anytime: 'yes' }),
      ],
      ENROLLED,
      NY
    );
    expect(rows[0].sends_at).toBe('2026-08-24 09:00 America/New_York');
    expect(rows[0].notes.some((n) => n.includes('next allowed sending day'))).toBe(true);
    expect(rows[0].notes.some((n) => n.includes('shares delay 86400'))).toBe(true);
    expect(rows[1].notes.some((n) => n.includes('shares delay 86400'))).toBe(true);
  });

  it('warns when sending_time is set but ignored by is_anytime "yes"', () => {
    const rows = computeSchedule([email(1, 0, { is_anytime: 'yes', sending_time: ['05:00'] })], ENROLLED, UTC);
    expect(rows[0].notes.some((n) => n.includes('ignored'))).toBe(true);
  });
});

describe('validateTimings', () => {
  it('accepts a clean sequence', () => {
    expect(
      validateTimings([
        email(1, 0, { delay: 0, delay_unit: 'days', is_anytime: 'yes' }),
        email(2, 86400, { delay: 1, delay_unit: 'days', is_anytime: 'yes' }),
      ])
    ).toEqual([]);
  });

  it('warns on duplicate delays (the all-86400 mistake)', () => {
    const findings = validateTimings([
      email(1, 86400, { delay: 1, delay_unit: 'days' }),
      email(2, 86400, { delay: 1, delay_unit: 'days' }),
      email(3, 86400, { delay: 1, delay_unit: 'days' }),
    ]);
    const dup = findings.find((f) => f.message.includes('share delay 86400'));
    expect(dup?.level).toBe('warning');
    expect(dup?.message).toContain('1, 2, 3');
  });

  it('errors on timings-vs-column drift — the scheduler uses the column', () => {
    const findings = validateTimings([email(1, 86400, { delay: 2, delay_unit: 'days', is_anytime: 'yes' })]);
    expect(findings.some((f) => f.level === 'error' && f.message.includes('SCHEDULER USES THE COLUMN'))).toBe(true);
  });

  it('errors on is_anytime "no" with a malformed window; warns on an ignored window', () => {
    const findings = validateTimings([
      email(1, 0, { is_anytime: 'no', sending_time: ['', ''] }),
      email(2, 3600, { is_anytime: 'yes', sending_time: ['05:00', '05:30'] }),
    ]);
    expect(findings.find((f) => f.email_id === 1)?.level).toBe('error');
    expect(findings.find((f) => f.email_id === 2)?.level).toBe('warning');
  });
});

// ------------------------------------------------------------- bulk updates

function fakeServer() {
  const tools: Record<string, { handler: (args: Record<string, unknown>) => Promise<Record<string, unknown>> }> = {};
  const server = {
    registerTool: (name: string, _meta: unknown, handler: never) => {
      tools[name] = { handler };
    },
  } as unknown as McpServer;
  return { server, tools };
}

const RECORDS: Record<string, Record<string, unknown>> = {
  '1305': { email: { id: 1305, title: 'Day 7', settings: { timings: { delay: '7', delay_unit: 'days' }, template_config: { a: 1 } } } },
  '1314': { email: { id: 1314, title: 'Day 8', settings: { timings: { delay: '8', delay_unit: 'days' } } } },
};

/** In-memory sequence-email API: GET serves RECORDS, PUT applies the body. */
function bulkApi(overrides: { failPutFor?: string } = {}) {
  const store = structuredClone(RECORDS);
  return mockFetch((req: CapturedRequest) => {
    const id = req.url.match(/email\/(\d+)/)?.[1] ?? '';
    if (req.method === 'PUT') {
      if (overrides.failPutFor === id) return { status: 500, body: { message: 'boom' } };
      store[id] = JSON.parse(req.body!) as Record<string, unknown>;
      return { status: 200, body: { message: 'updated' } };
    }
    return store[id] ? { status: 200, body: store[id] } : { status: 422, body: { message: 'not found' } };
  });
}

async function runBulk(api: ReturnType<typeof bulkApi>, args: Record<string, unknown>) {
  const { server, tools } = fakeServer();
  registerSequenceTools(server, makeClient(api.fetchImpl));
  return (await tools.crm_sequences_bulk_update_emails.handler(args)) as {
    isError?: boolean;
    content: Array<{ text: string }>;
    structuredContent: {
      ok: boolean;
      dry_run?: boolean;
      summary: { requested: number; updated: number; failed: number; skipped: number };
      results: Array<{ email_id: string | number; ok: boolean; changed?: Record<string, unknown>; warnings?: string[]; error?: string; skipped?: boolean }>;
    };
  };
}

describe('crm_sequences_bulk_update_emails', () => {
  const rows = [
    { email_id: 1305, settings: { timings: { delay: '9' } } },
    { email_id: 1314, settings: { timings: { delay: '10' } } },
  ];

  it('merge-updates every row and reports per-row diffs; omitted fields survive', async () => {
    const api = bulkApi();
    const res = await runBulk(api, { id: 1259, emails: rows });
    expect(res.isError).toBeUndefined();
    expect(res.structuredContent.summary).toEqual({ requested: 2, updated: 2, failed: 0, skipped: 0 });
    const first = res.structuredContent.results[0];
    expect(first.changed?.['email.settings.timings.delay']).toEqual({ from: '7', to: '9' });
    // The merged PUT body preserved title and template_config.
    const put = api.calls.find((c) => c.method === 'PUT' && c.url.includes('email/1305'))!;
    const sent = JSON.parse(put.body!) as { email: { title: string; settings: { template_config?: unknown } } };
    expect(sent.email.title).toBe('Day 7');
    expect(sent.email.settings.template_config).toEqual({ a: 1 });
  });

  it('dry_run previews every diff and writes nothing', async () => {
    const api = bulkApi();
    const res = await runBulk(api, { id: 1259, emails: rows, dry_run: true });
    expect(res.structuredContent.dry_run).toBe(true);
    expect(api.calls.every((c) => c.method === 'GET')).toBe(true);
    expect(res.structuredContent.results.every((r) => r.ok && r.changed)).toBe(true);
  });

  it('stops on the first failure by default, marks the rest skipped, and never claims rollback', async () => {
    const api = bulkApi({ failPutFor: '1305' });
    const res = await runBulk(api, { id: 1259, emails: rows });
    expect(res.isError).toBe(true);
    expect(res.structuredContent.summary).toMatchObject({ updated: 0, failed: 1, skipped: 1 });
    expect(res.structuredContent.results[1].skipped).toBe(true);
    expect(api.calls.some((c) => c.url.includes('email/1314') && c.method === 'PUT')).toBe(false);
  });

  it('continues past failures with stop_on_error:false', async () => {
    const api = bulkApi({ failPutFor: '1305' });
    const res = await runBulk(api, { id: 1259, emails: rows, stop_on_error: false });
    expect(res.structuredContent.summary).toMatchObject({ updated: 1, failed: 1, skipped: 0 });
  });

  it('gates mode:"replace" behind confirm', async () => {
    const api = bulkApi();
    const res = await runBulk(api, { id: 1259, emails: rows, mode: 'replace' });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('confirm: true');
    expect(api.calls.length).toBe(0);
  });
});
