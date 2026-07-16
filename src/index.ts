#!/usr/bin/env node
/** fluentMCP — MCP server for WPManageNinja Fluent products (stdio transport).
 *  Products with credentials present are enabled; the rest are skipped and
 *  reported by verify_setup as not configured. stdout is reserved for MCP
 *  JSON-RPC; all logging goes to stderr. */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig, productEnvStatus } from './core/config.js';
import { FluentClient } from './core/http.js';
import { registerToolSpec } from './core/tool-factory.js';
import { registerVerifySetup, type ProductEntry } from './core/verify.js';
import { PRODUCTS } from './products/index.js';

const config = loadConfig(PRODUCTS.map((p) => p.envPrefix));
const server = new McpServer({ name: 'fluentmcp', version: '0.1.0' });

let toolCount = 0;
const entries: ProductEntry[] = PRODUCTS.map((module) => {
  const status = productEnvStatus(config, module.envPrefix);
  let client: FluentClient | undefined;
  if (status.configured && config.siteUrl) {
    client = new FluentClient({
      siteUrl: config.siteUrl,
      namespace: module.namespace,
      product: module.key,
      productTitle: module.title,
      envPrefix: module.envPrefix,
      credentials: config.credentials[module.envPrefix],
      timeoutMs: config.timeoutMs,
      maxRetries: config.maxRetries,
    });
    for (const spec of module.tools) {
      registerToolSpec(server, spec, { client, summaryFields: module.summaryFields[spec.name] });
      toolCount++;
    }
  }
  return { module, status, client };
});

registerVerifySetup(server, entries, config);
toolCount++;

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(
  `fluentmcp: ${toolCount} tools registered — ` +
    entries.map((e) => `${e.module.key}: ${e.status.configured ? 'enabled' : 'not configured'}`).join(', ')
);
