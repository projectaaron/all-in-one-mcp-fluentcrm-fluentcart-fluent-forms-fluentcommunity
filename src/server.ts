/** Shared server construction — used by both entry points (stdio + remote
 *  HTTP). Builds an McpServer with every enabled product's tools plus the
 *  built-ins (verify_setup, tool_map, wp_media), from a ServerConfig.
 *
 *  Tool surface: `individual` mode (default) registers one tool per
 *  operation with a focused schema; `grouped` mode (FLUENT_TOOL_MODE=grouped)
 *  registers the legacy one-tool-per-area surface for clients that can't
 *  handle a large tool list. */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { individualNamesFor, registerActionTools } from './core/action-tools.js';
import { loadConfig, productEnvStatus, type ServerConfig } from './core/config.js';
import { FluentClient } from './core/http.js';
import { registerWpMediaTool, registerWpMediaTools, wpMediaMapTools } from './core/media.js';
import type { RouteRef } from './core/path-safety.js';
import { DiagnosticsLog, registerSupportReport, type Transport } from './core/support.js';
import { lockedRefusal, registerToolSpec, withDiagnostics, type ToolRuntime } from './core/tool-factory.js';
import type { ProductModule } from './core/types.js';
import { buildInstructions, mapAreasOf, registerToolMapTool, serverArea, type MapArea } from './core/tool-map.js';
import { registerVerifySetup, type ProductEntry } from './core/verify.js';
import { PRODUCTS } from './products/index.js';
import { SERVER_VERSION } from './version.js';

export interface BuiltServer {
  server: McpServer;
  entries: ProductEntry[];
  toolCount: number;
  config: ServerConfig;
  /** Recent tool calls (feeds support_report). */
  diagnostics: DiagnosticsLog;
  /** FLUENT_LOCKED_TOOLS entries that match no tool (typos lock nothing). */
  unknownLocks: string[];
}

/** Every route a product serves, with the tool that serves it — built once
 *  per module and shared by all its tools for the sibling-route check. */
const ROUTE_CACHE = new WeakMap<ProductModule, RouteRef[]>();
function routesOf(module: ProductModule): RouteRef[] {
  let routes = ROUTE_CACHE.get(module);
  if (!routes) {
    routes = module.tools.flatMap((spec) => {
      const names = individualNamesFor(spec);
      return Object.entries(spec.actions).map(([action, d]) => ({
        method: d.method,
        path: d.path,
        siteRoot: d.siteRoot,
        tool: names[action],
      }));
    });
    ROUTE_CACHE.set(module, routes);
  }
  return routes;
}

/** Every canonical tool name an admin may put in FLUENT_LOCKED_TOOLS. */
export function knownToolNames(): Set<string> {
  const names = new Set<string>(['tool_map', 'verify_setup', 'support_report']);
  for (const module of PRODUCTS) {
    for (const spec of module.tools) for (const n of Object.values(individualNamesFor(spec))) names.add(n);
    for (const t of module.extras?.mapTools ?? []) names.add(t.name);
  }
  for (const t of wpMediaMapTools('individual')) names.add(t.name);
  return names;
}

/** Hand-written tools (product extras, wp_media) register through this
 *  wrapper so they honour FLUENT_LOCKED_TOOLS exactly like generated tools
 *  and land in the support_report call log. */
function guardedServer(server: McpServer, locked: Set<string>, diagnostics: DiagnosticsLog): McpServer {
  const runtime = { diagnostics } as unknown as ToolRuntime;
  return new Proxy(server, {
    get(target, prop, receiver) {
      if (prop === 'registerTool') {
        return (name: string, config: { description?: string }, cb: (...a: unknown[]) => unknown) => {
          const isLocked = locked.has(name);
          const cfg = isLocked
            ? { ...config, description: `${config.description ?? ''} 🔒 Locked by the server admin — always refuses.`.trim() }
            : config;
          const handler = (...a: unknown[]) =>
            withDiagnostics(runtime, undefined, name, async () =>
              isLocked ? lockedRefusal(name) : ((await cb(...a)) as ReturnType<typeof lockedRefusal>)
            );
          return (target.registerTool as (...x: unknown[]) => unknown)(name, cfg, handler);
        };
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export interface BuildOptions {
  /** How this server is being served — reported by support_report. */
  transport?: Transport;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return loadConfig(PRODUCTS.map((p) => p.envPrefix), env);
}

export function buildServer(config: ServerConfig, options: BuildOptions = {}): BuiltServer {
  const mode = config.toolMode;
  const lockedTools = config.lockedTools ?? new Set<string>();
  const diagnostics = new DiagnosticsLog();

  // The map covers every product (disabled ones are marked, not hidden) plus
  // the built-in server tools, and feeds both tool_map and `instructions`.
  const statuses = PRODUCTS.map((module) => productEnvStatus(config, module.envPrefix));
  // configured already implies siteUrl is set (productEnvStatus checks both).
  const anyConfigured = statuses.some((s) => s.configured);
  const areas: MapArea[] = PRODUCTS.flatMap((module, i) =>
    mapAreasOf(module, mode, statuses[i].configured, config.lockedTools)
  );
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
        const runtime = {
          client,
          summaryFields: module.summaryFields[spec.name],
          lockedTools: config.lockedTools,
          diagnostics,
          routes: routesOf(module),
          // Grouped mode checks locks by each action's canonical individual name.
          ...(mode === 'grouped' ? { canonicalNames: individualNamesFor(spec) } : {}),
        };
        if (mode === 'individual') {
          toolCount += registerActionTools(server, spec, runtime, { productTitle: module.title }).length;
        } else {
          registerToolSpec(server, spec, runtime);
          toolCount++;
        }
      }
      // Hand-written product extras (e.g. the sequence schedule preview) —
      // standalone tools in both modes.
      if (module.extras) toolCount += module.extras.register(guardedServer(server, lockedTools, diagnostics), client).length;
    }
    return { module, status, client };
  });

  registerToolMapTool(server, areas);
  toolCount++;

  registerVerifySetup(server, entries, config);
  toolCount++;

  // support_report needs the final tool count, so it registers last and
  // reads the count lazily through the context object.
  const known = knownToolNames();
  const unknownLocks = [...lockedTools].filter((n) => !known.has(n)).sort();
  const supportCtx = { transport: options.transport ?? 'unknown', toolCount: 0, diagnostics, unknownLocks };
  registerSupportReport(server, entries, config, supportCtx);
  toolCount++;

  // WordPress-core media tools (upload_from_url etc.) — need credentials, so
  // they register only when at least one product is configured.
  const firstClient = entries.find((e) => e.client)?.client;
  if (firstClient) {
    const media = guardedServer(server, lockedTools, diagnostics);
    if (mode === 'individual') {
      toolCount += registerWpMediaTools(media, firstClient).length;
    } else {
      registerWpMediaTool(media, firstClient);
      toolCount++;
    }
  }

  supportCtx.toolCount = toolCount;
  return { server, entries, toolCount, config, diagnostics, unknownLocks };
}

export function enablementSummary(built: BuiltServer): string {
  const summary =
    `fluentmcp: ${built.toolCount} tools registered (${built.config.toolMode} mode) — ` +
    built.entries.map((e) => `${e.module.key}: ${e.status.configured ? 'enabled' : 'not configured'}`).join(', ');
  return built.unknownLocks.length
    ? `${summary}\nfluentmcp: WARNING — FLUENT_LOCKED_TOOLS names match no tool and lock nothing: ${built.unknownLocks.join(', ')}`
    : summary;
}
