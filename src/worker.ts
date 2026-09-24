/** All-In-One MCP for Fluent Suite — Cloudflare Workers entry point (MCP Streamable HTTP).
 *
 *  Same endpoints and auth as the Node remote server (src/remote.ts):
 *    POST /mcp/<token>   token in the URL path (claude.ai connector form)
 *    POST /mcp           with `Authorization: Bearer <token>`
 *    GET  /healthz       unauthenticated health check
 *
 *  Workers have no node:http, so instead of the SDK's Node transport this
 *  uses a minimal stateless bridge: each POST gets a fresh McpServer wired to
 *  a single-exchange transport that feeds the request message(s) in and
 *  collects the response(s). Configuration comes from Worker vars/secrets
 *  (same names as the env vars everywhere else). Deploy: docs/REMOTE.md. */

import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './core/config.js';
import { buildServer } from './server.js';
import { PRODUCTS } from './products/index.js';

interface Env {
  FLUENT_SITE_URL?: string;
  FLUENT_API_USERNAME?: string;
  FLUENT_API_PASSWORD?: string;
  FLUENT_MCP_TOKEN?: string;
  [key: string]: string | undefined;
}

const MIN_TOKEN_LENGTH = 16;
const RESPONSE_TIMEOUT_MS = 55_000;

/** Constant-time string compare (length is not secret here). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const isResponse = (m: JSONRPCMessage): boolean => 'id' in m && ('result' in m || 'error' in m);
const isRequest = (m: JSONRPCMessage): boolean => 'id' in m && 'method' in m;
/** A message carrying an id that is neither a request (has `method`) nor a
 *  response (has `result`/`error`). The SDK silently drops these, so the
 *  worker answers them with -32600 itself instead of returning an empty 202. */
const isMalformed = (m: unknown): boolean =>
  !m || typeof m !== 'object' || ('id' in m && !('method' in m) && !('result' in m) && !('error' in m));

/** Percent-decode the `/mcp/<token>` path segment; undecodable → ''. */
/** `/mcp`, `/mcp/<token>`, optionally followed by `/grouped` or `/individual`
 *  (a tool-mode override for URL-only clients). Mirrors remote-server.ts;
 *  duplicated so the Worker bundle stays free of Node's http module. */
const MCP_PATH_RE = /^\/mcp(?:\/([^/]+))?(?:\/(grouped|individual))?\/?$/;
function parseMcpPath(pathname: string): { tokenSegment?: string; toolMode?: 'grouped' | 'individual' } | undefined {
  const m = MCP_PATH_RE.exec(pathname);
  if (!m) return undefined;
  const [, first, second] = m;
  if (second) return { tokenSegment: first, toolMode: second as 'grouped' | 'individual' };
  if (first === 'grouped' || first === 'individual') return { toolMode: first };
  return { tokenSegment: first };
}

function pathToken(segment: string | undefined): string {
  if (segment === undefined) return '';
  try {
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
}

/** One HTTP exchange = one transport: dispatch client message(s), await the
 *  matching response(s). Server-initiated requests/notifications have nowhere
 *  to go in a stateless exchange and are dropped, per streamable-http
 *  stateless usage. */
class SingleExchangeTransport implements Transport {
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  private pending = new Set<string | number>();
  private responses: JSONRPCMessage[] = [];
  private resolveDone!: () => void;
  private done = new Promise<void>((r) => (this.resolveDone = r));

  async start(): Promise<void> {}
  async close(): Promise<void> {
    this.onclose?.();
  }
  async send(message: JSONRPCMessage): Promise<void> {
    if (isResponse(message)) {
      this.responses.push(message);
      this.pending.delete((message as { id: string | number }).id);
      if (this.pending.size === 0) this.resolveDone();
    }
  }

  /** Feed client messages in; resolve with all responses (empty for
   *  notification-only bodies). */
  async exchange(messages: JSONRPCMessage[], timeoutMs: number): Promise<JSONRPCMessage[]> {
    for (const m of messages) if (isRequest(m)) this.pending.add((m as { id: string | number }).id);
    if (this.pending.size === 0) this.resolveDone();
    for (const m of messages) this.onmessage?.(m);
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([
      this.done,
      new Promise<void>((_, reject) => {
        timer = setTimeout(() => reject(new Error('MCP exchange timed out')), timeoutMs);
      }),
    ]).finally(() => clearTimeout(timer));
    return this.responses;
  }
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version',
};

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });

const rpcError = (code: number, message: string) => ({ jsonrpc: '2.0', error: { code, message }, id: null });

/** Same cap as the Node remote server. */
const MAX_BODY_BYTES = 4 * 1024 * 1024;
/** One exchange builds a whole server; a huge batch is only abuse. */
const MAX_BATCH = 32;

/** Read the body as text, giving up (undefined) past `max` bytes — checked
 *  against Content-Length first, then while streaming, so a chunked body
 *  can't be buffered to the platform limit. */
async function readCappedText(request: Request, max: number): Promise<string | undefined> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > max) return undefined;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const route = parseMcpPath(url.pathname);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (url.pathname === '/healthz') return json(200, { ok: true });
    if (!route) return json(404, rpcError(-32000, 'Not found — the MCP endpoint is /mcp'));

    const token = env.FLUENT_MCP_TOKEN?.trim() ?? '';
    if (token.length < MIN_TOKEN_LENGTH) {
      return json(500, rpcError(-32000, `Server misconfigured: set the FLUENT_MCP_TOKEN secret (${MIN_TOKEN_LENGTH}+ chars) — npx wrangler secret put FLUENT_MCP_TOKEN`));
    }
    const auth = request.headers.get('authorization');
    const presented = route.tokenSegment !== undefined ? pathToken(route.tokenSegment) : auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!presented || !safeEqual(presented, token)) {
      return json(401, rpcError(-32000, 'Unauthorized: present FLUENT_MCP_TOKEN as "Authorization: Bearer <token>" or in the URL path /mcp/<token>'));
    }
    if (request.method !== 'POST') {
      return json(405, rpcError(-32000, 'Method not allowed — POST JSON-RPC messages to this endpoint'));
    }

    let body: unknown;
    const text = await readCappedText(request, MAX_BODY_BYTES);
    if (text === undefined) {
      return json(413, rpcError(-32000, `Payload too large — requests are capped at ${MAX_BODY_BYTES / 1048576} MB`));
    }
    try {
      body = JSON.parse(text);
    } catch {
      return json(400, rpcError(-32700, 'Parse error: invalid JSON'));
    }
    const incoming = Array.isArray(body) ? body : [body];
    if (incoming.length > MAX_BATCH) {
      return json(400, rpcError(-32600, `Invalid Request: batches are capped at ${MAX_BATCH} messages`));
    }
    // Two requests with the same id would share one pending slot: the first
    // response would end the exchange and the other's write would run with
    // its result dropped.
    const ids = incoming.filter((m) => m !== null && typeof m === 'object' && isRequest(m as JSONRPCMessage)).map((m) => (m as { id: unknown }).id);
    if (new Set(ids.map((i) => JSON.stringify(i))).size !== ids.length) {
      return json(400, rpcError(-32600, 'Invalid Request: duplicate request ids in one batch'));
    }
    const invalid = incoming.filter(isMalformed).map((m) => ({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request: a message with an id needs a method (request) or result/error (response)' },
      id: m && typeof m === 'object' && 'id' in m ? (m as { id: string | number }).id : null,
    })) as JSONRPCMessage[];
    const messages = incoming.filter((m) => !isMalformed(m)) as JSONRPCMessage[];

    const config = loadConfig(PRODUCTS.map((p) => p.envPrefix), env as NodeJS.ProcessEnv);
    if (route.toolMode) config.toolMode = route.toolMode;
    const built = buildServer(config, { transport: 'cloudflare-worker' });
    const transport = new SingleExchangeTransport();
    try {
      await built.server.connect(transport);
      const responses = [...invalid, ...(messages.length ? await transport.exchange(messages, RESPONSE_TIMEOUT_MS) : [])];
      if (responses.length === 0) return new Response(null, { status: 202, headers: CORS_HEADERS });
      return json(200, Array.isArray(body) ? responses : responses[0]);
    } catch (err) {
      console.error('fluentmcp worker: request failed:', err instanceof Error ? err.message : err);
      return json(500, rpcError(-32603, 'Internal server error'));
    } finally {
      void built.server.close();
    }
  },
};
