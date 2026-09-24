/** Regression tests for the 1.3.0 security and correctness audit. Each block
 *  reproduces a reported exploit or bug end to end — through the real server
 *  build where the wiring matters — and asserts it is refused or fixed. */
import net from 'node:net';
import type { Server } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { loadConfig, normalizeSiteUrl } from '../src/core/config.js';
import { FluentClient } from '../src/core/http.js';
import { assertSafeSourceUrl, isBlockedIPv6 } from '../src/core/media.js';
import { buildMergedBody, verifyWrite } from '../src/core/merge.js';
import { shapeResponse } from '../src/core/shape.js';
import { createRemoteServer } from '../src/remote-server.js';
import { buildServer, enablementSummary } from '../src/server.js';
import worker from '../src/worker.js';
import { PRODUCTS } from '../src/products/index.js';

const prefixes = PRODUCTS.map((p) => p.envPrefix);
const BASE_ENV = {
  FLUENT_SITE_URL: 'https://example.com',
  FLUENT_API_USERNAME: 'u',
  FLUENT_API_PASSWORD: 'p',
} as NodeJS.ProcessEnv;

type Result = { isError?: boolean; content: Array<{ text: string }>; structuredContent?: Record<string, unknown> };

let fetchSpy: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchSpy = vi.fn(async () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }));
  vi.stubGlobal('fetch', fetchSpy);
});
afterEach(() => vi.unstubAllGlobals());

async function connect(env: NodeJS.ProcessEnv = BASE_ENV) {
  const built = buildServer(loadConfig(prefixes, env), { transport: 'stdio' });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'audit', version: '0' });
  await Promise.all([built.server.connect(st), client.connect(ct)]);
  const call = async (name: string, args: Record<string, unknown>) =>
    (await client.callTool({ name, arguments: args })) as unknown as Result;
  return { built, client, call };
}

describe('path values cannot steer a call to another endpoint', () => {
  it('refuses "." / ".." path values that would reach the locked bulk contact delete', async () => {
    const { call, client } = await connect();
    const viaDots = await call('crm_sequences_remove_subscribers', { id: '..', confirm: true, body: { subscribers: [1, 2, 3] } });
    expect(viaDots.isError).toBe(true);
    expect(viaDots.content[0].text).toContain('not allowed');
    const viaDot = await call('crm_contacts_delete_contact', { id: '.', confirm: true });
    expect(viaDot.isError).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    await client.close();
  });

  it('refuses the same trick in grouped mode', async () => {
    const { call, client } = await connect({ ...BASE_ENV, FLUENT_TOOL_MODE: 'grouped' });
    const res = await call('crm_sequences', { action: 'remove_sequence_subscribers', id: '..', confirm: true });
    expect(res.isError).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    await client.close();
  });

  it("refuses a value equal to a sibling route's literal segment, naming the real tool", async () => {
    const { call, client } = await connect();
    const res = await call('cart_orders_update', { order_id: 'do-bulk-action', body: { action: 'delete_orders', order_ids: [1] } });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('cart_orders_bulk_actions');
    expect(fetchSpy).not.toHaveBeenCalled();
    // An ordinary id still goes through.
    const ok = await call('cart_orders_update', { order_id: 42, body: { note: 'x' } });
    expect(ok.content[0].text).not.toContain('resolves to');
    await client.close();
  });

  it('refuses the WordPress _method override in any spelling PHP normalizes', async () => {
    const { call, client } = await connect();
    for (const key of ['_method', '_METHOD', '.method', ' method', '_method[]']) {
      const res = await call('crm_contacts_create', { query: { [key]: 'DELETE', subscribers: [1] }, body: { email: 'a@b.co' } });
      expect(res.isError, key).toBe(true);
      expect(res.content[0].text, key).toContain('_method');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    await client.close();
  });

  it('backstops hand-written paths in the HTTP client', async () => {
    const c = new FluentClient({ siteUrl: 'https://example.com', namespace: 'fluent-crm/v2', product: 'x', productTitle: 'X', envPrefix: 'X' });
    await expect(c.request({ method: 'DELETE', path: '/sequences/../subscribers' })).rejects.toThrow(/segment/);
    await expect(c.wpRequest({ method: 'GET', path: '/wp/v2/media', query: { _method: 'DELETE' } })).rejects.toThrow(/_method/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('locks cover hand-written tools too', () => {
  it('refuses locked product extras and wp_media tools, and flags unknown lock names', async () => {
    const env = { ...BASE_ENV, FLUENT_LOCKED_TOOLS: 'default,crm_sequences_bulk_update_emails,wp_media_list,crm_contact_delete' };
    const { call, client, built } = await connect(env);
    const extra = await call('crm_sequences_bulk_update_emails', { id: 1, emails: [{ email_id: 9, subject: 'x' }] });
    expect(extra.isError).toBe(true);
    expect(extra.content[0].text).toContain('🔒');
    const media = await call('wp_media_list', {});
    expect(media.isError).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();

    expect(built.unknownLocks).toEqual(['crm_contact_delete']);
    expect(enablementSummary(built)).toContain('match no tool');
    const report = await call('support_report', { probe: false });
    expect(report.content[0].text).toContain('crm_contact_delete');
    await client.close();
  });
});

describe('HTTP client', () => {
  const client = (fetchImpl: (url: string, init?: RequestInit) => Promise<Response>, timeoutMs = 5000) =>
    new FluentClient({
      siteUrl: 'https://example.com',
      namespace: 'fluent-cart/v2',
      product: 'fluentcart',
      productTitle: 'FluentCart',
      envPrefix: 'FLUENTCART',
      timeoutMs,
      maxRetries: 0,
      fetchImpl,
    });

  it('never follows a redirect on a write (a 301 would silently turn it into a GET)', async () => {
    const seen: RequestInit[] = [];
    const c = client(async (_u, init) => {
      seen.push(init!);
      return new Response(null, { status: 301, headers: { location: 'https://www.example.com/x' } });
    });
    await expect(c.request({ method: 'POST', path: '/orders/5/refund', body: {} })).rejects.toThrow(/NOT re-sent/);
    expect(seen).toHaveLength(1);
    expect(seen[0].redirect).toBe('manual');
  });

  it('times out a response whose body stalls, and says a timed-out write may have applied', async () => {
    const stalled = (_u: string, init?: RequestInit) =>
      Promise.resolve(
        new Response(
          new ReadableStream({
            start(ctrl) {
              init!.signal!.addEventListener('abort', () => ctrl.error(new DOMException('aborted', 'AbortError')));
            },
          }),
          { status: 200 }
        )
      );
    const started = Date.now();
    await expect(client(stalled, 100).request({ method: 'GET', path: '/orders' })).rejects.toThrow(/timed out/);
    expect(Date.now() - started).toBeLessThan(2000);

    const hang = (_u: string, init?: RequestInit) =>
      new Promise<Response>((_, reject) =>
        init!.signal!.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
      );
    await expect(client(hang, 100).request({ method: 'POST', path: '/orders/5/refund', body: {} })).rejects.toThrow(
      /may still have been applied/
    );
  });
});

describe('remote server and Worker hardening', () => {
  let server: Server | undefined;
  afterEach(() => new Promise<void>((r) => (server ? server.close(() => r()) : r())));

  it('survives a request with a malformed Host header (it used to crash the process)', async () => {
    vi.unstubAllGlobals();
    server = createRemoteServer(loadConfig(prefixes, BASE_ENV), 'test-secret-token-0123456789abcdef');
    await new Promise<void>((r) => server!.listen(0, '127.0.0.1', r));
    const { port } = server.address() as { port: number };
    await new Promise<void>((resolve) => {
      const sock = net.connect(port, '127.0.0.1', () => sock.end('GET /healthz HTTP/1.1\r\nHost: a b\r\nConnection: close\r\n\r\n'));
      sock.on('data', () => undefined);
      sock.on('close', () => resolve());
      sock.on('error', () => resolve());
    });
    const res = await fetch(`http://127.0.0.1:${port}/healthz`);
    expect(res.status).toBe(200);
  });

  it('caps Worker batch size, body size, and rejects duplicate request ids', async () => {
    const TOKEN = 'test-secret-token-0123456789abcdef';
    const env = { ...BASE_ENV, FLUENT_MCP_TOKEN: TOKEN };
    const post = (body: string) =>
      worker.fetch(new Request(`https://w.test/mcp/${TOKEN}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body }), env);
    const ping = (id: number) => ({ jsonrpc: '2.0', id, method: 'ping' });
    expect((await post(JSON.stringify(Array.from({ length: 33 }, (_, i) => ping(i))))).status).toBe(400);
    expect((await post(JSON.stringify([ping(1), ping(1)]))).status).toBe(400);
    expect((await post('x'.repeat(4 * 1024 * 1024 + 1))).status).toBe(413);
    expect((await post(JSON.stringify([null, ping(2)]))).status).toBe(200);
  });
});

describe('media sideloading', () => {
  it('blocks trailing-dot hostnames and 6to4/Teredo-embedded private addresses', () => {
    for (const u of ['http://localhost./a.png', 'http://metadata.google.internal./x', 'http://169.254.169.254.nip.io./', 'http://x.nip.io./']) {
      expect(() => assertSafeSourceUrl(u), u).toThrow();
    }
    expect(isBlockedIPv6('[2002:7f00:1::]')).toBe(true); // 6to4 wrapping 127.0.0.1
    expect(isBlockedIPv6('2001:0:4136:e378::1')).toBe(true); // Teredo
    expect(isBlockedIPv6('2002:0808:0808::')).toBe(false); // 6to4 wrapping 8.8.8.8
  });

  it('refuses SVG and derives the stored extension from the real content type', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const posts: Array<Record<string, string>> = [];
    fetchSpy.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.startsWith('https://cdn.example.com/')) {
        const svg = url.endsWith('.svg');
        return new Response(svg ? '<svg/>' : png, { status: 200, headers: { 'content-type': svg ? 'image/svg+xml' : 'image/png' } });
      }
      posts.push(init!.headers as Record<string, string>);
      return new Response(JSON.stringify({ id: 7, source_url: 'https://example.com/x.png', mime_type: 'image/png' }), { status: 201 });
    });
    const { call, client } = await connect();
    const svg = await call('wp_media_upload_from_url', { source_url: 'https://cdn.example.com/logo.svg' });
    expect(svg.isError).toBe(true);
    expect(svg.content[0].text).toContain('SVG');
    const renamed = await call('wp_media_upload_from_url', { source_url: 'https://cdn.example.com/a.png', filename: 'evil.html' });
    expect(renamed.isError).toBeFalsy();
    expect(posts[0]['Content-Disposition']).toContain('filename="evil.png"');
    await client.close();
  });
});

describe('configuration', () => {
  it('normalizes the site URL people actually paste', () => {
    expect(normalizeSiteUrl('mysite.com')).toBe('https://mysite.com');
    expect(normalizeSiteUrl('https://example.com/wp-admin/')).toBe('https://example.com');
    expect(normalizeSiteUrl('https://user:secret@example.com/blog/wp-login.php?x=1')).toBe('https://example.com/blog');
    expect(normalizeSiteUrl('   ')).toBeUndefined();
  });
});

describe('write safety', () => {
  it('refuses if_unmodified_since when the record has no updated_at to compare', async () => {
    fetchSpy.mockImplementation(async () => new Response(JSON.stringify({ id: 1, title: 'old' }), { status: 200 }));
    const { call, client } = await connect();
    const res = await call('crm_tags_update', { id: 1, body: { title: 'new' }, if_unmodified_since: 'STALE' });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('no updated_at');
    expect(fetchSpy.mock.calls.every(([, init]) => !init || (init as RequestInit).method === 'GET')).toBe(true);
    await client.close();
  });

  it('does not report a normalized no-op write as rejected', () => {
    const before = { id: 1, stackable: 'yes', tags: [{ id: 1 }] };
    const v = verifyWrite(before, before, { stackable: true, tags: [1] }, (p) => p);
    expect(v.rejected).toBe(false);
  });

  it('merges a flat settings object instead of sending the partial body alone', () => {
    const m = buildMergedBody({ enabled: 'yes', from_name: 'Store' }, { enabled: 'no' });
    expect(m.body).toEqual({ enabled: 'no', from_name: 'Store' });
  });
});

describe('response shaping', () => {
  it('projects the nested record, not a wrapper that shares a field name', () => {
    const shaped = shapeResponse({ status: 'success', message: 'ok', data: { id: 5, email: 'a@b.co', status: 'subscribed' } }, {
      detail: 'summary',
      summaryFields: ['id', 'email', 'status'],
    });
    expect(shaped.data).toEqual({ data: { id: 5, email: 'a@b.co', status: 'subscribed' } });
  });

  it('treats a single record with an array beside it as one record, not a list', () => {
    const shaped = shapeResponse({ order: { id: 9, total: 10 }, activities: [{ id: 1 }, { id: 2 }] }, { detail: 'summary' });
    expect(shaped.itemCount).toBeUndefined();
  });

  it('keeps a pagination total of "0"', () => {
    const shaped = shapeResponse({ data: [], total: '0', current_page: 1 }, { detail: 'summary' });
    expect(shaped.pagination?.total).toBe(0);
  });
});
