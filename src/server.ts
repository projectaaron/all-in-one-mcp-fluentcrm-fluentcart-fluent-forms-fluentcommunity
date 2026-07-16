/** Shared server construction — used by both entry points (stdio + remote
 *  HTTP). Builds an McpServer with every enabled product's tools plus
 *  verify_setup, from a ServerConfig. */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadConfig, productEnvStatus, type ServerConfig } from './core/config.js';
import { FluentClient } from './core/http.js';
import { registerToolSpec } from './core/tool-factory.js';
import { registerVerifySetup, type ProductEntry } from './core/verify.js';
import { registerWpMediaTool } from './core/media.js';
import { PRODUCTS } from './products/index.js';
import { SERVER_VERSION } from './version.js';

export interface BuiltServer {
  server: McpServer;
  entries: ProductEntry[];
  toolCount: number;
  config: ServerConfig;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return loadConfig(PRODUCTS.map((p) => p.envPrefix), env);
}

export function buildServer(config: ServerConfig): BuiltServer {
  const server = new McpServer({ name: 'fluentmcp', version: SERVER_VERSION });

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

  // WordPress-core media tool (upload_from_url etc.) — needs credentials, so
  // it registers only when at least one product is configured.
  const firstClient = entries.find((e) => e.client)?.client;
  if (firstClient) {
    registerWpMediaTool(server, firstClient);
    toolCount++;
  }

  return { server, entries, toolCount, config };
}

export function enablementSummary(built: BuiltServer): string {
  return (
    `fluentmcp: ${built.toolCount} tools registered — ` +
    built.entries.map((e) => `${e.module.key}: ${e.status.configured ? 'enabled' : 'not configured'}`).join(', ')
  );
}
