import { describe, expect, it } from 'vitest';
import { FluentApiError } from '../../src/core/errors.js';
import { makeClient, mockFetch } from '../helpers.js';

describe('FluentClient', () => {
  it('sends Basic auth built from credentials', async () => {
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: { ok: 1 } }]);
    await makeClient(fetchImpl).request({ method: 'GET', path: '/tags' });
    const expected = 'Basic ' + Buffer.from('apiuser:secret-pass').toString('base64');
    expect(calls[0].headers.Authorization).toBe(expected);
  });

  it('builds namespace URLs and serializes arrays WordPress-style', () => {
    const { fetchImpl } = mockFetch([{ status: 200 }]);
    const url = makeClient(fetchImpl).buildUrl('/orders', {
      page: 2,
      order_statuses: ['completed', 'processing'],
      'with[]': ['items'],
      filters: { status: 'active' },
      skip: undefined,
    });
    expect(url).toContain('https://example.com/wp-json/fluent-crm/v2/orders?');
    expect(url).toContain('page=2');
    expect(url).toContain('order_statuses%5B%5D=completed');
    expect(url).toContain('order_statuses%5B%5D=processing');
    expect(url).toContain('with%5B%5D=items');
    expect(url).toContain('filters%5Bstatus%5D=active');
    expect(url).not.toContain('skip');
  });

  it('resolves siteRoot paths against the site root, not wp-json', () => {
    const { fetchImpl } = mockFetch([{ status: 200 }]);
    const url = makeClient(fetchImpl).buildUrl('/?fluent-cart=check_license', { license_key: 'k' }, true);
    expect(url).toBe('https://example.com/?fluent-cart=check_license&license_key=k');
  });

  it('sends JSON bodies with content-type on writes', async () => {
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: {} }]);
    await makeClient(fetchImpl).request({ method: 'POST', path: '/tags', body: { title: 'VIP' } });
    expect(calls[0].headers['Content-Type']).toBe('application/json');
    expect(calls[0].body).toBe('{"title":"VIP"}');
  });

  it('retries 429 for writes and honors Retry-After', async () => {
    const { calls, fetchImpl } = mockFetch([
      { status: 429, headers: { 'retry-after': '1' } },
      { status: 200, body: { done: true } },
    ]);
    const res = await makeClient(fetchImpl).request({ method: 'POST', path: '/tags', body: {} });
    expect(res.status).toBe(200);
    expect(calls.length).toBe(2);
  });

  it('retries GET on 503 but not writes', async () => {
    const g = mockFetch([{ status: 503 }, { status: 200, body: {} }]);
    await expect(makeClient(g.fetchImpl).request({ method: 'GET', path: '/tags' })).resolves.toMatchObject({ status: 200 });
    expect(g.calls.length).toBe(2);

    const w = mockFetch([{ status: 503 }, { status: 200, body: {} }]);
    await expect(makeClient(w.fetchImpl).request({ method: 'POST', path: '/tags' })).rejects.toThrow(FluentApiError);
    expect(w.calls.length).toBe(1);
  });

  // Regression: FluentCRM's reset_system_logs mutates via GET — destructive
  // actions set noRetry so a flaky network can't double-fire them.
  it('does not retry noRetry GETs on 503 or network failure (429 still retries)', async () => {
    const s = mockFetch([{ status: 503 }, { status: 200, body: {} }]);
    await expect(
      makeClient(s.fetchImpl).request({ method: 'GET', path: '/setting/system-logs/reset', noRetry: true })
    ).rejects.toThrow(FluentApiError);
    expect(s.calls.length).toBe(1);

    let attempts = 0;
    const flaky = async () => {
      attempts++;
      throw new Error('socket hang up');
    };
    await expect(
      makeClient(flaky as never).request({ method: 'GET', path: '/setting/system-logs/reset', noRetry: true })
    ).rejects.toThrow(/Could not reach/);
    expect(attempts).toBe(1);

    const r = mockFetch([{ status: 429 }, { status: 200, body: {} }]);
    await expect(
      makeClient(r.fetchImpl).request({ method: 'GET', path: '/setting/system-logs/reset', noRetry: true })
    ).resolves.toMatchObject({ status: 200 });
    expect(r.calls.length).toBe(2);
  });

  it('requestRaw passes an abort signal (timeout applies to the probe)', async () => {
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: { namespaces: [] } }]);
    await makeClient(fetchImpl).requestRaw('/', { _fields: 'namespaces' });
    expect(calls[0].signal).toBeInstanceOf(AbortSignal);
  });

  it('retries network failures for GET only', async () => {
    let attempts = 0;
    const flaky = async () => {
      attempts++;
      if (attempts === 1) throw new Error('socket hang up');
      return new Response('{"ok":1}', { status: 200, headers: { 'content-type': 'application/json' } });
    };
    await expect(makeClient(flaky as never).request({ method: 'GET', path: '/tags' })).resolves.toMatchObject({ status: 200 });

    attempts = 0;
    const flakyWrite = async () => {
      attempts++;
      throw new Error('socket hang up');
    };
    await expect(makeClient(flakyWrite as never).request({ method: 'POST', path: '/tags' })).rejects.toThrow(/Could not reach/);
    expect(attempts).toBe(1);
  });

  it('normalizes WP errors with actionable hints and never leaks credentials', async () => {
    const cases: Array<[number, RegExp]> = [
      [401, /FLUENTCRM_API_USERNAME/],
      [403, /capability|permission/],
      [404, /installed and active/],
      [500, /PHP error log/],
    ];
    for (const [status, hint] of cases) {
      const { fetchImpl } = mockFetch([{ status, body: { code: 'err', message: 'nope' } }]);
      const err = await makeClient(fetchImpl)
        .request({ method: 'GET', path: '/tags' })
        .catch((e) => e as FluentApiError);
      expect(err).toBeInstanceOf(FluentApiError);
      expect(err.message).toMatch(hint);
      expect(err.message).not.toContain('secret-pass');
      expect(err.message).not.toContain('apiuser');
    }
  });

  it('survives non-JSON error bodies', async () => {
    const { fetchImpl } = mockFetch([{ status: 500, body: '<html>Fatal error</html>' }]);
    const err = await makeClient(fetchImpl)
      .request({ method: 'GET', path: '/tags' })
      .catch((e) => e as FluentApiError);
    expect(err.status).toBe(500);
  });

  it('works without credentials (public endpoints)', async () => {
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: [] }]);
    await makeClient(fetchImpl, { credentials: undefined }).request({ method: 'GET', path: '/public/products' });
    expect(calls[0].headers.Authorization).toBeUndefined();
  });
});
