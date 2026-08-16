/** Integration tests for merge-mode writes through the real crm_sequences
 *  spec: the exact silent-data-loss scenario that motivated them (a partial
 *  update_sequence_email body wiping title and template_config), plus the
 *  replace gate, dry runs, optimistic concurrency, and ignored-body detection. */
import { describe, expect, it } from 'vitest';
import { individualNamesFor, makeActionHandler } from '../../src/core/action-tools.js';
import { PRODUCTS } from '../../src/products/index.js';
import { makeClient, mockFetch, type CapturedRequest } from '../helpers.js';

const crm = PRODUCTS.find((p) => p.key === 'fluentcrm')!;
const spec = crm.tools.find((t) => t.name === 'crm_sequences')!;
const names = individualNamesFor(spec);

const EMAIL_RECORD = {
  email: {
    id: 1305,
    title: 'Unlocked: Free Download (Day 7)',
    email_subject: 'Unlocked: Free Download (Day 7)',
    status: 'published',
    delay: 604800,
    settings: {
      timings: { delay: '7', delay_unit: 'days', is_anytime: 'yes', sending_time: '' },
      template_config: { footer: 'keep-me' },
    },
    updated_at: '2026-08-15 19:25:54',
  },
};

const PATCH = { email: { settings: { timings: { delay: '8', delay_unit: 'days', is_anytime: 'yes' } } } };

/** Route-based mock: GET returns `before` until a PUT lands, then `after`. */
function sequenceEmailApi(before: unknown, after: unknown, putStatus = 200) {
  let written = false;
  return mockFetch((req: CapturedRequest) => {
    if (req.method === 'PUT') {
      written = true;
      return { status: putStatus, body: { email: { id: 1305 }, message: 'updated' } };
    }
    return { status: 200, body: written ? after : before };
  });
}

function handler(fetchImpl: Parameters<typeof makeClient>[0]) {
  return makeActionHandler(
    spec,
    'update_sequence_email',
    { client: makeClient(fetchImpl) },
    names.update_sequence_email
  );
}

type Result = {
  isError?: boolean;
  content: Array<{ text: string }>;
  structuredContent?: Record<string, unknown>;
};

describe('merge-mode update_sequence_email', () => {
  it('hydrates a partial body from the record: title and template_config survive a timings-only patch', async () => {
    const applied = structuredClone(EMAIL_RECORD);
    applied.email.settings.timings.delay = '8';
    applied.email.delay = 691200;
    applied.email.updated_at = '2026-08-16 00:00:00';
    const api = sequenceEmailApi(EMAIL_RECORD, applied);
    const res = (await handler(api.fetchImpl)({ id: 1259, email_id: 1305, body: PATCH })) as Result;

    expect(res.isError, res.content?.[0]?.text).toBeUndefined();
    // GET before, PUT, GET after.
    expect(api.calls.map((c) => c.method)).toEqual(['GET', 'PUT', 'GET']);
    const sent = JSON.parse(api.calls[1].body!) as typeof EMAIL_RECORD;
    expect(sent.email.title).toBe('Unlocked: Free Download (Day 7)');
    expect(sent.email.settings.template_config).toEqual({ footer: 'keep-me' });
    expect(sent.email.settings.timings.delay).toBe('8');

    const structured = res.structuredContent!;
    expect(structured.mode).toBe('merge');
    const changed = structured.changed as Record<string, unknown>;
    expect(changed['email.settings.timings.delay']).toEqual({ from: '7', to: '8' });
    // The plugin recomputes the delay column from timings — a change outside
    // the request body, so it surfaces as a warning (confirming the recompute).
    expect(structured.warnings).toEqual(['email.delay: 604800 -> 691200 (field was not in your request body)']);
    expect(res.content[0].text).toContain('verified:');
  });

  it('surfaces unintended changes as warnings when the plugin still clears fields', async () => {
    const wiped = structuredClone(EMAIL_RECORD);
    wiped.email.settings.timings.delay = '8';
    wiped.email.title = '';
    delete (wiped.email.settings as Record<string, unknown>).template_config;
    const api = sequenceEmailApi(EMAIL_RECORD, wiped);
    const res = (await handler(api.fetchImpl)({ id: 1259, email_id: 1305, body: PATCH })) as Result;

    expect(res.isError).toBeUndefined();
    const warnings = res.structuredContent!.warnings as string[];
    expect(warnings.some((w) => w.includes('email.title') && w.includes('not in your request body'))).toBe(true);
    expect(res.content[0].text).toContain('⚠');
  });

  it('errors when the endpoint reports success but ignored the entire body', async () => {
    const api = sequenceEmailApi(EMAIL_RECORD, EMAIL_RECORD);
    // Every supplied value differs from the record, yet nothing changed —
    // provably ignored (values that already match the record are ambiguous).
    const patch = { email: { settings: { timings: { delay: '9' } } } };
    const res = (await handler(api.fetchImpl)({ id: 1259, email_id: 1305, body: patch })) as Result;
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('did not change');
  });

  it('refuses mode:"replace" without confirm and proceeds with it', async () => {
    const refuse = sequenceEmailApi(EMAIL_RECORD, EMAIL_RECORD);
    const refused = (await handler(refuse.fetchImpl)({ id: 1259, email_id: 1305, body: PATCH, mode: 'replace' })) as Result;
    expect(refused.isError).toBe(true);
    expect(refused.content[0].text).toContain('confirm: true');
    expect(refuse.calls.length).toBe(0);

    const applied = structuredClone(EMAIL_RECORD);
    applied.email.settings.timings.delay = '8';
    const api = sequenceEmailApi(EMAIL_RECORD, applied);
    const ok = (await handler(api.fetchImpl)({ id: 1259, email_id: 1305, body: PATCH, mode: 'replace', confirm: true })) as Result;
    expect(ok.isError).toBeUndefined();
    // Replace sends the body untouched…
    expect(JSON.parse(api.calls[1].body!)).toEqual(PATCH);
    // …but still verifies.
    expect(ok.structuredContent!.mode).toBe('replace');
    expect(ok.structuredContent!.changed).toBeDefined();
  });

  it('dry_run reads, diffs, and writes nothing', async () => {
    const api = sequenceEmailApi(EMAIL_RECORD, EMAIL_RECORD);
    const res = (await handler(api.fetchImpl)({ id: 1259, email_id: 1305, body: PATCH, dry_run: true })) as Result;
    expect(res.isError).toBeUndefined();
    expect(api.calls.map((c) => c.method)).toEqual(['GET']);
    const structured = res.structuredContent!;
    expect(structured.dry_run).toBe(true);
    const wouldSend = structured.would_send as { method: string; body: typeof EMAIL_RECORD };
    expect(wouldSend.method).toBe('PUT');
    expect(wouldSend.body.email.title).toBe('Unlocked: Free Download (Day 7)');
    expect((structured.changed as Record<string, unknown>)['email.settings.timings.delay']).toBeDefined();
    expect(res.content[0].text).toContain('nothing was written');
  });

  it('if_unmodified_since refuses on drift and passes on match', async () => {
    const drift = sequenceEmailApi(EMAIL_RECORD, EMAIL_RECORD);
    const refused = (await handler(drift.fetchImpl)({
      id: 1259,
      email_id: 1305,
      body: PATCH,
      if_unmodified_since: '2026-08-15 00:00:00',
    })) as Result;
    expect(refused.isError).toBe(true);
    expect(refused.content[0].text).toContain('precondition failed');
    expect(drift.calls.map((c) => c.method)).toEqual(['GET']); // read, no write

    const applied = structuredClone(EMAIL_RECORD);
    applied.email.settings.timings.delay = '8';
    const api = sequenceEmailApi(EMAIL_RECORD, applied);
    const ok = (await handler(api.fetchImpl)({
      id: 1259,
      email_id: 1305,
      body: PATCH,
      if_unmodified_since: '2026-08-15 19:25:54',
    })) as Result;
    expect(ok.isError).toBeUndefined();
  });

  it('fails closed when the pre-write read fails in merge mode', async () => {
    const api = mockFetch((req) =>
      req.method === 'GET' ? { status: 422, body: { message: 'Sequence email could not be found' } } : { status: 200, body: {} }
    );
    const res = (await handler(api.fetchImpl)({ id: 1259, email_id: 9999, body: PATCH })) as Result;
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('nothing was written');
    expect(api.calls.every((c) => c.method === 'GET')).toBe(true);
  });

  it('declares merge semantics in the tool schema and description', async () => {
    const { actionDescription, buildActionInputShape } = await import('../../src/core/action-tools.js');
    const def = spec.actions.update_sequence_email;
    const desc = actionDescription(spec, def, { productTitle: 'FluentCRM' }, true);
    expect(desc).toContain('[merge]');
    const shape = buildActionInputShape('update_sequence_email', def, true);
    for (const key of ['mode', 'dry_run', 'if_unmodified_since', 'confirm']) expect(shape).toHaveProperty(key);
    // Unpaired PUTs advertise replace semantics instead.
    const cart = PRODUCTS.find((p) => p.key === 'fluentcart')!;
    for (const s of cart.tools) {
      for (const [action, d] of Object.entries(s.actions)) {
        if (d.method === 'PUT' && !(await import('../../src/core/merge.js')).pairedReadFor(s, action)) {
          expect(actionDescription(s, d, { productTitle: cart.title })).toContain('[replace');
          return;
        }
      }
    }
  });
});
