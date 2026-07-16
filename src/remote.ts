#!/usr/bin/env node
/** fluentMCP — remote entry point (MCP Streamable HTTP). Add it to claude.ai /
 *  Claude apps as a custom connector URL; works on web, mobile, and desktop.
 *
 *  FLUENT_MCP_TOKEN is required: this server fronts your whole store/CRM, so
 *  it refuses to start without a shared secret. Serve it over HTTPS only
 *  (put a TLS proxy or tunnel in front — see docs/REMOTE.md). */

import { buildServer, enablementSummary, readConfig } from './server.js';
import { createRemoteServer, MIN_TOKEN_LENGTH } from './remote-server.js';

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.FLUENT_MCP_HOST ?? '0.0.0.0';
const TOKEN = process.env.FLUENT_MCP_TOKEN?.trim() ?? '';

if (TOKEN.length < MIN_TOKEN_LENGTH) {
  console.error(
    `fluentmcp-remote: refusing to start. Set FLUENT_MCP_TOKEN to a long random secret (${MIN_TOKEN_LENGTH}+ chars), e.g.:\n` +
      '  FLUENT_MCP_TOKEN=$(openssl rand -hex 32)\n' +
      'Every request must present it (Authorization: Bearer <token>, or in the URL path /mcp/<token>).'
  );
  process.exit(1);
}

const config = readConfig();
// Build once at startup purely to validate config and log enablement.
console.error(enablementSummary(buildServer(config)));

createRemoteServer(config, TOKEN).listen(PORT, HOST, () => {
  console.error(
    `fluentmcp-remote: listening on http://${HOST}:${PORT}/mcp — auth via Bearer token or /mcp/<token> path. ` +
      'Serve over HTTPS in production (docs/REMOTE.md).'
  );
});
