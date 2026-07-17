/** Shared server construction — used by both entry points (stdio + remote
 *  HTTP). Builds an McpServer with every enabled product's tools plus the
 *  built-ins (verify_setup, tool_map, wp_media), from a ServerConfig.
 *
 *  Tool surface: `individual` mode (default) registers one tool per
 *  operation with a focused schema; `grouped` mode (FLUENT_TOOL_MODE=grouped)
 *  registers the legacy one-tool-per-area surface for clients that can't
 *  handle a large tool list. */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerActionTools } from './core/action-tools.js';
import { loadConfig, productEnvStatus, type ServerConfig } from './core/config.js';
import { FluentClient } from './core/http.js';
import { registerWpMediaTool, registerWpMediaTools } from './core/media.js';
import { registerToolSpec } from './core/tool-factory.js';
import { buildInstructions, mapAreasOf, registerToolMapTool, serverArea, type MapArea } from './core/tool-map.js';
import { registerVerifySetup, type ProductEntry } from './core/verify.js';
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
  const mode = config.toolMode;

  // The map covers every product (disabled ones are marked, not hidden) plus
  // the built-in server tools, and feeds both tool_map and `instructions`.
  const statuses = PRODUCTS.map((module) => productEnvStatus(config, module.envPrefix));
  // configured already implies siteUrl is set (productEnvStatus checks both).
  const anyConfigured = statuses.some((s) => s.configured);
  const areas: MapArea[] = PRODUCTS.flatMap((module, i) => mapAreasOf(module, mode, statuses[i].configured));
  areas.push(serverArea(mode, anyConfigured));

  const server = new McpServer(
    { name: 'fluentmcp', version: SERVER_VERSION },
    { instructions: buildInstructions(areas, mode) }
  );

  let toolCount = 0;
  const entries: ProductEntry[] = PRODUCTS.map((module, i) => {
    const status = statuses[i];
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
        const runtime = { client, summaryFields: module.summaryFields[spec.name] };
        if (mode === 'individual') {
          toolCount += registerActionTools(server, spec, runtime, { productTitle: module.title }).length;
        } else {
          registerToolSpec(server, spec, runtime);
          toolCount++;
        }
      }
    }
    return { module, status, client };
  });

  registerToolMapTool(server, areas);
  toolCount++;

  registerVerifySetup(server, entries, config);
  toolCount++;

  // WordPress-core media tools (upload_from_url etc.) — need credentials, so
  // they register only when at least one product is configured.
  const firstClient = entries.find((e) => e.client)?.client;
  if (firstClient) {
    if (mode === 'individual') {
      toolCount += registerWpMediaTools(server, firstClient).length;
    } else {
      registerWpMediaTool(server, firstClient);
      toolCount++;
    }
  }

  return { server, entries, toolCount, config };
}

export function enablementSummary(built: BuiltServer): string {
  return (
    `fluentmcp: ${built.toolCount} tools registered (${built.config.toolMode} mode) — ` +
    built.entries.map((e) => `${e.module.key}: ${e.status.configured ? 'enabled' : 'not configured'}`).join(', ')
  );
}
