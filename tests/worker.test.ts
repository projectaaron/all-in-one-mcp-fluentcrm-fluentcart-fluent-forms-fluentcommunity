import { describe, expect, it } from 'vitest';
import worker from '../src/worker.js';

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

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  worker.fetch(
    new Request(`https://worker.test${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    env
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
    expect(list.result.tools.length).toBe(45);
  });

  it('accepts Bearer-header auth', async () => {
    const list = (await (
      await post('/mcp', { jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} }, { Authorization: `Bearer ${TOKEN}` })
    ).json()) as any;
    expect(list.result.tools.length).toBe(45);
  });

  it('returns 202 for notification-only bodies and 400 for bad JSON', async () => {
    const notif = await post(`/mcp/${TOKEN}`, { jsonrpc: '2.0', method: 'notifications/initialized' });
    expect(notif.status).toBe(202);
    const bad = await post(`/mcp/${TOKEN}`, '{not json');
    expect(bad.status).toBe(400);
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
        params: { name: 'crm_tags', arguments: { action: 'delete_tag', id: 1 } },
      })
    ).json()) as any;
    expect(call.result.isError).toBe(true);
    expect(call.result.content[0].text).toContain('confirm: true');
  });
});
