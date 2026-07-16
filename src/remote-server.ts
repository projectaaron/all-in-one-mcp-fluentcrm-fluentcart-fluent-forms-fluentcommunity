/** Remote transport: a plain Node HTTP server speaking MCP Streamable HTTP.
 *
 *  Endpoint:  POST /mcp/<token>   (token in the path — claude.ai's custom
 *             connector form can't set headers)
 *             POST /mcp           with `Authorization: Bearer <token>`
 *  Health:    GET  /healthz       (no auth, no details)
 *
 *  Stateless: each request gets a fresh McpServer + transport, so any number
 *  of clients can connect concurrently with zero session state. */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { ServerConfig } from './core/config.js';
import { buildServer } from './server.js';

export const MIN_TOKEN_LENGTH = 16;

function tokenOk(req: IncomingMessage, pathToken: string | undefined, token: string): boolean {
  const auth = req.headers.authorization;
  const presented = pathToken ?? (auth?.startsWith('Bearer ') ? auth.slice(7).trim() : undefined);
  if (!presented) return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const rpcError = (code: number, message: string) => ({ jsonrpc: '2.0', error: { code, message }, id: null });

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version',
};

/** Build the HTTP server (not yet listening). Token must be ≥16 chars. */
export function createRemoteServer(config: ServerConfig, token: string): Server {
  if (!token || token.length < MIN_TOKEN_LENGTH) {
    throw new Error(`FLUENT_MCP_TOKEN must be at least ${MIN_TOKEN_LENGTH} characters`);
  }

  return createServer(async (req, res) => {
    for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const match = /^\/mcp(?:\/([^/]+))?\/?$/.exec(url.pathname);

    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204).end();
        return;
      }
      if (url.pathname === '/healthz') {
        json(res, 200, { ok: true });
        return;
      }
      if (!match) {
        json(res, 404, rpcError(-32000, 'Not found — the MCP endpoint is /mcp'));
        return;
      }
      if (!tokenOk(req, match[1], token)) {
        json(res, 401, rpcError(-32000, 'Unauthorized: present FLUENT_MCP_TOKEN as "Authorization: Bearer <token>" or in the URL path /mcp/<token>'));
        return;
      }
      if (req.method !== 'POST') {
        // Stateless mode: no SSE stream to resume, no session to delete.
        json(res, 405, rpcError(-32000, 'Method not allowed — POST JSON-RPC messages to this endpoint'));
        return;
      }

      const body = await readBody(req);
      if (body === null) {
        json(res, 400, rpcError(-32700, 'Parse error: invalid JSON'));
        return;
      }

      // Fresh server + transport per request (stateless Streamable HTTP).
      const built = buildServer(config);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => {
        void transport.close();
        void built.server.close();
      });
      await built.server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (err) {
      console.error('fluentmcp-remote: request failed:', err instanceof Error ? err.message : err);
      if (!res.headersSent) json(res, 500, rpcError(-32603, 'Internal server error'));
      else res.end();
    }
  });
}
