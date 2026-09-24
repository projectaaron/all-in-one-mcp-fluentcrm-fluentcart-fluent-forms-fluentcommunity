/** The read-back guard: a write endpoint that stores any body and returns 200
 *  (Fluent Forms integration feeds under "<integration_name>_feeds") is
 *  validated against the plugin's own registry before writing, and the
 *  stored record is read back afterwards — a bare 200 is never trusted. */
import { describe, expect, it } from 'vitest';
import { makeActionHandler } from '../../src/core/action-tools.js';
import type { ToolSpec } from '../../src/core/types.js';
import { makeClient, mockFetch, type CapturedRequest } from '../helpers.js';

const spec: ToolSpec = {
  name: 'forms_integrations',
  description: 'Integrations.',
  actions: {
    save_form_integration: {
      op: 'integrations/save-form-integration',
      method: 'POST',
      path: '/integrations/{form_id}',
      summary: 'Save Form Integration',
      destructive: false,
      bodyNote: 'integration_name must be a registered slug.',
      readback: {
        path: '/integrations/{form_id}/form-integrations',
        allow: { bodyField: 'integration_name', fromKey: 'available_integrations', requiredWhen: 'integration' },
        stored: { itemsKey: 'feeds', idFrom: 'integration_id' },
      },
    },
  },
};

const REGISTRY = { fluentcrm: { title: 'FluentCRM' }, fluent_support: { title: 'FluentSupport' } };

/** In-memory plugin: the listing advertises REGISTRY; a save under a
 *  registered name shows up in `feeds`, one under an unregistered name
 *  is stored (200) but never listed — exactly the real plugin's behaviour. */
function integrationApi() {
  const feeds: Array<Record<string, unknown>> = [];
  let nextId = 300;
  return mockFetch((req: CapturedRequest) => {
    if (req.method === 'GET') return { status: 200, body: { feeds, available_integrations: REGISTRY } };
    const body = JSON.parse(req.body ?? '{}') as { integration_name?: string; integration?: Record<string, unknown> };
    const id = nextId++;
    if (body.integration_name && body.integration_name in REGISTRY) {
      feeds.push({ id, name: body.integration?.name, enabled: true, provider: body.integration_name, feed: body.integration });
    }
    return { status: 200, body: { message: 'Integration successfully saved', integration_id: id, integration_name: body.integration_name, created: true } };
  });
}

const run = (api: ReturnType<typeof integrationApi>, args: Record<string, unknown>) =>
  makeActionHandler(spec, 'save_form_integration', { client: makeClient(api.fetchImpl) }, 'forms_integrations_save')(args as never) as Promise<{
    isError?: boolean;
    content: Array<{ text: string }>;
    structuredContent?: Record<string, unknown>;
  }>;

describe('read-back guard', () => {
  it('refuses an unregistered integration_name before writing, naming the registered ones', async () => {
    const api = integrationApi();
    const res = await run(api, { form_id: 21, body: { integration_name: 'FluentCRM', integration: { name: 'Tag it' } } });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('nothing was written');
    expect(res.content[0].text).toContain('"fluentcrm"');
    expect(res.content[0].text).toContain('FluentCRM_feeds');
    expect(api.calls.map((c) => c.method)).toEqual(['GET']);
  });

  it('writes a registered feed and returns it as the plugin lists it', async () => {
    const api = integrationApi();
    const res = await run(api, { form_id: 21, body: { integration_name: 'fluentcrm', integration: { name: 'Tag it', list_id: '2' } } });
    expect(res.isError, res.content[0].text).toBeUndefined();
    expect(api.calls.map((c) => c.method)).toEqual(['GET', 'POST', 'GET']);
    const stored = res.structuredContent!.stored as Record<string, unknown>;
    expect(stored.provider).toBe('fluentcrm');
    expect(stored.name).toBe('Tag it');
  });

  it('errors when the plugin returned 200 but does not list the record', async () => {
    // Registry advertises nothing, but the write still "succeeds" — the
    // allow check can't help (no allow-list to check against), so the
    // read-back is the last line of defence.
    const { calls, fetchImpl } = mockFetch((req: CapturedRequest) =>
      req.method === 'GET'
        ? { status: 200, body: { feeds: [], available_integrations: { fluentcrm: {} } } }
        : { status: 200, body: { integration_id: 77, integration_name: 'fluentcrm' } }
    );
    const res = await makeActionHandler(spec, 'save_form_integration', { client: makeClient(fetchImpl) }, 'forms_integrations_save')({
      form_id: 21,
      body: { integration_name: 'fluentcrm', integration: { name: 'x' } },
    } as never) as { isError?: boolean; content: Array<{ text: string }> };
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('does not list that record');
    expect(calls.map((c) => c.method)).toEqual(['GET', 'POST', 'GET']);
  });

  it('lets a status-only toggle through without an integration_name', async () => {
    const api = integrationApi();
    const res = await run(api, { form_id: 21, body: { integration_id: 195, status: false } });
    // No allow check (requiredWhen "integration" absent) — straight to the write,
    // then the read-back; the toggle response carries integration_id 300 which
    // the in-memory plugin never listed, so the guard reports it honestly.
    expect(api.calls[0].method).toBe('POST');
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('does not list that record');
  });

  it('dry_run validates against the registry (a read) but never writes', async () => {
    const api = integrationApi();
    // An unregistered name is refused in a dry run too — a dry run must not
    // report ok for a body the real call would refuse.
    const bad = await run(api, { form_id: 21, dry_run: true, body: { integration_name: 'nope', integration: { name: 'x' } } });
    expect(bad.isError).toBe(true);
    expect(api.calls.map((c) => c.method)).toEqual(['GET']);

    const good = await run(api, { form_id: 21, dry_run: true, body: { integration_name: 'fluentcrm', integration: { name: 'x' } } });
    expect(good.isError).toBeUndefined();
    expect((good.structuredContent!.would_send as { method: string }).method).toBe('POST');
    expect(api.calls.every((c) => c.method === 'GET')).toBe(true);
  });
});
