import { describe, expect, it } from 'vitest';
import worker from '../src/worker.js';
import { GROUPED_TOOL_COUNT, INDIVIDUAL_TOOL_COUNT } from './helpers.js';

const TOKEN = 'test-secret-token-0123456789abcdef';
const env = {
  FLUENT_SITE_URL: 'https://example.com',
  FLUENT_API_USERNAME: 'u',
  FLUENT_API_PASSWORD: 'p',
  FLUENT_MCP_TOKEN: TOKEN,
};

const INIT = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '0' } },
};

const post = (path: string, body: unknown, headers: Record<string, string> = {}, useEnv = env) =>
  worker.fetch(
    new Request(`https://worker.test${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    useEnv
  );

describe('cloudflare worker entry', () => {
  it('serves /healthz without auth', async () => {
    const res = await worker.fetch(new Request('https://worker.test/healthz'), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('rejects missing/wrong tokens with 401 and unknown paths with 404', async () => {
    expect((await post('/mcp', INIT)).status).toBe(401);
    expect((await post('/mcp/wrong', INIT)).status).toBe(401);
    expect((await post('/mcp', INIT, { Authorization: 'Bearer nope' })).status).toBe(401);
    expect((await post('/nope', INIT)).status).toBe(404);
  });

  it('500s with actionable message when the token secret is unset', async () => {
    const res = await post(`/mcp/${TOKEN}`, INIT).then(() =>
      worker.fetch(
        new Request(`https://worker.test/mcp/${TOKEN}`, { method: 'POST', body: JSON.stringify(INIT) }),
        { ...env, FLUENT_MCP_TOKEN: undefined }
      )
    );
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { message: string } };
    expect(body.error.message).toContain('FLUENT_MCP_TOKEN');
  });

  it('answers initialize and tools/list (URL-path token)', async () => {
    const init = (await (await post(`/mcp/${TOKEN}`, INIT)).json()) as any;
    expect(init.result.serverInfo.name).toBe('fluentmcp');

    const list = (await (
      await post(`/mcp/${TOKEN}`, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
    ).json()) as any;
    expect(list.result.tools.length).toBe(INDIVIDUAL_TOOL_COUNT);
  });

  it('accepts Bearer-header auth', async () => {
    const list = (await (
      await post('/mcp', { jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} }, { Authorization: `Bearer ${TOKEN}` })
    ).json()) as any;
    expect(list.result.tools.length).toBe(INDIVIDUAL_TOOL_COUNT);
  });

  it('switches to grouped mode from the URL for URL-only clients', async () => {
    const list = (await (
      await post(`/mcp/${TOKEN}/grouped`, { jsonrpc: '2.0', id: 4, method: 'tools/list', params: {} })
    ).json()) as any;
    expect(list.result.tools.length).toBe(GROUPED_TOOL_COUNT);
    expect(list.result.tools.map((t: { name: string }) => t.name)).toContain('cart_orders');
    const bearer = (await (
      await post('/mcp/grouped', { jsonrpc: '2.0', id: 5, method: 'tools/list', params: {} }, { Authorization: `Bearer ${TOKEN}` })
    ).json()) as any;
    expect(bearer.result.tools.length).toBe(GROUPED_TOOL_COUNT);
    expect((await post('/mcp/grouped', { jsonrpc: '2.0', id: 6, method: 'tools/list', params: {} })).status).toBe(401);
  });

  it('returns 202 for notification-only bodies and 400 for bad JSON', async () => {
    const notif = await post(`/mcp/${TOKEN}`, { jsonrpc: '2.0', method: 'notifications/initialized' });
    expect(notif.status).toBe(202);
    const bad = await post(`/mcp/${TOKEN}`, '{not json');
    expect(bad.status).toBe(400);
  });

  it('answers a malformed request (id without method) with a JSON-RPC error, not an empty 202', async () => {
    const res = await post(`/mcp/${TOKEN}`, { jsonrpc: '2.0', id: 7 });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: number; error?: { code: number } };
    expect(body.id).toBe(7);
    expect(body.error).toBeDefined();
  });

  it('accepts a percent-encoded token in the path', async () => {
    const odd = 'tok+en/with=odd%chars-0123456789';
    const res = await post(`/mcp/${encodeURIComponent(odd)}`, INIT, {}, { ...env, FLUENT_MCP_TOKEN: odd });
    expect(res.status).toBe(200);
  });

  it('rejects non-POST on the MCP endpoint (stateless)', async () => {
    const res = await worker.fetch(new Request(`https://worker.test/mcp/${TOKEN}`), env);
    expect(res.status).toBe(405);
  });

  it('confirm gate holds over the worker transport', async () => {
    const call = (await (
      await post(`/mcp/${TOKEN}`, {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'crm_tags_delete', arguments: { id: 1 } },
      })
    ).json()) as any;
    expect(call.result.isError).toBe(true);
    expect(call.result.content[0].text).toContain('confirm: true');
  });
});
