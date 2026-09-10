import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { loadConfig } from '../src/core/config.js';
import { createRemoteServer, MIN_TOKEN_LENGTH } from '../src/remote-server.js';
import { PRODUCTS } from '../src/products/index.js';
import { INDIVIDUAL_TOOL_COUNT } from './helpers.js';

const TOKEN = 'test-secret-token-0123456789abcdef';
const env = {
  FLUENT_SITE_URL: 'https://example.com',
  FLUENT_API_USERNAME: 'u',
  FLUENT_API_PASSWORD: 'p',
} as NodeJS.ProcessEnv;

let server: Server;
let base: string;

beforeAll(async () => {
  server = createRemoteServer(loadConfig(PRODUCTS.map((p) => p.envPrefix), env), TOKEN);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('no address');
  base = `http://127.0.0.1:${addr.port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const INIT = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'test', version: '0.0.0' },
  },
};
const LIST = { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} };

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...headers },
    body: JSON.stringify(body),
  });

/** Streamable HTTP responses may be SSE-framed; extract the JSON payload. */
async function rpcResult(res: Response): Promise<any> {
  const text = await res.text();
  if (res.headers.get('content-type')?.includes('text/event-stream')) {
    const data = text.split('\n').filter((l) => l.startsWith('data: ')).map((l) => l.slice(6));
    return JSON.parse(data[data.length - 1]);
  }
  return JSON.parse(text);
}

describe('remote streamable-http server', () => {
  it('serves /healthz without auth', async () => {
    const res = await fetch(`${base}/healthz`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('rejects missing and wrong tokens with 401, and unknown paths with 404', async () => {
    expect((await post('/mcp', INIT)).status).toBe(401);
    expect((await post('/mcp/wrong-token', INIT)).status).toBe(401);
    expect((await post('/mcp', INIT, { Authorization: 'Bearer nope' })).status).toBe(401);
    expect((await post('/other', INIT)).status).toBe(404);
  });

  it('answers initialize + tools/list with the token in the URL path (claude.ai style)', async () => {
    const init = await rpcResult(await post(`/mcp/${TOKEN}`, INIT));
    expect(init.result.serverInfo.name).toBe('fluentmcp');

    const list = await rpcResult(await post(`/mcp/${TOKEN}`, LIST));
    expect(list.result.tools.length).toBe(INDIVIDUAL_TOOL_COUNT);
    const names = list.result.tools.map((t: { name: string }) => t.name);
    expect(names).toContain('verify_setup');
    expect(names).toContain('tool_map');
    expect(names).toContain('crm_contacts_list');
    expect(names).toContain('cart_orders_get');
    expect(names).toContain('wp_media_upload_from_url');
  });

  it('accepts the token as a Bearer header too', async () => {
    const list = await rpcResult(await post('/mcp', LIST, { Authorization: `Bearer ${TOKEN}` }));
    expect(list.result.tools.length).toBe(INDIVIDUAL_TOOL_COUNT);
  });

  it('rejects non-POST on the MCP endpoint (stateless mode)', async () => {
    const res = await fetch(`${base}/mcp/${TOKEN}`);
    expect(res.status).toBe(405);
  });

  it('returns JSON-RPC parse error on bad JSON', async () => {
    const res = await fetch(`${base}/mcp/${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });
    expect(res.status).toBe(400);
  });

  it('refuses to construct with a short token', () => {
    expect(() => createRemoteServer(loadConfig([], env), 'short')).toThrow(new RegExp(String(MIN_TOKEN_LENGTH)));
  });
});
