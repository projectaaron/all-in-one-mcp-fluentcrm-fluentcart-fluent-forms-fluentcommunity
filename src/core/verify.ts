/** The verify_setup diagnostic tool: the first thing to run after install.
 *  Reports per product: not_configured (with the missing env vars), or the
 *  result of a namespace check + one harmless authenticated read. */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig, ProductEnvStatus } from './config.js';
import { FluentApiError } from './errors.js';
import type { FluentClient } from './http.js';
import type { ProductModule } from './types.js';

export interface ProductEntry {
  module: ProductModule;
  status: ProductEnvStatus;
  client?: FluentClient;
}

interface ProductReport {
  product: string;
  title: string;
  status: 'ok' | 'not_configured' | 'auth_failed' | 'plugin_missing' | 'error';
  api_namespace: string;
  namespace_detected?: boolean;
  test_read?: string;
  /** Registered tool count for this product (mode-aware). */
  tools?: number;
  /** Resource areas (tool-name prefixes like crm_contacts). */
  areas?: number;
  detail?: string;
}

export function registerVerifySetup(server: McpServer, entries: ProductEntry[], config: ServerConfig): void {
  server.registerTool(
    'verify_setup',
    {
      description:
        'Check this MCP server\'s setup: site reachability, per-product credentials, plugin presence, and one harmless read per configured product. Run this first after installing.',
      inputSchema: {},
      outputSchema: {
        site: z.string().optional(),
        ok: z.boolean(),
        products: z.array(
          z.object({
            product: z.string(),
            title: z.string(),
            status: z.enum(['ok', 'not_configured', 'auth_failed', 'plugin_missing', 'error']),
            api_namespace: z.string(),
            namespace_detected: z.boolean().optional(),
            test_read: z.string().optional(),
            tools: z.number().optional(),
            areas: z.number().optional(),
            detail: z.string().optional(),
          })
        ),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async () => {
      const reports: ProductReport[] = [];

      // One site-level namespace listing (unauthenticated route index).
      let namespaces: string[] | undefined;
      const firstClient = entries.find((e) => e.client)?.client;
      if (firstClient) {
        try {
          const res = await firstClient.requestRaw('/', { _fields: 'namespaces' });
          const data = res.data as { namespaces?: unknown } | null;
          if (data && Array.isArray(data.namespaces)) namespaces = data.namespaces.map(String);
        } catch {
          /* index blocked on some sites — per-product reads still tell the story */
        }
      }

      for (const { module, status, client } of entries) {
        const base: Pick<ProductReport, 'product' | 'title' | 'api_namespace'> = {
          product: module.key,
          title: module.title,
          api_namespace: module.namespace,
        };
        if (!status.configured || !client) {
          reports.push({
            ...base,
            status: 'not_configured',
            detail: `Set ${status.missing.join(', ')} to enable ${module.title}. Not an error — this product is simply skipped.`,
          });
          continue;
        }
        const namespaceDetected = namespaces ? namespaces.includes(module.namespace) : undefined;
        try {
          await client.request({ method: 'GET', path: module.verifyRead.path, query: module.verifyRead.query });
          reports.push({
            ...base,
            status: 'ok',
            namespace_detected: namespaceDetected,
            test_read: `${module.verifyRead.label} — ok`,
            tools:
              (config.toolMode === 'grouped'
                ? module.tools.length
                : module.tools.reduce((n, t) => n + Object.keys(t.actions).length, 0)) +
              (module.extras?.mapTools.length ?? 0),
            areas: module.tools.length,
          });
        } catch (e) {
          const err = e instanceof FluentApiError ? e : undefined;
          reports.push({
            ...base,
            status: err?.status === 401 || err?.status === 403 ? 'auth_failed' : err?.status === 404 ? 'plugin_missing' : 'error',
            namespace_detected: namespaceDetected,
            test_read: `${module.verifyRead.label} — failed`,
            detail: err?.message ?? (e instanceof Error ? e.message : String(e)),
          });
        }
      }

      const ok = reports.some((r) => r.status === 'ok') && !reports.some((r) => ['auth_failed', 'plugin_missing', 'error'].includes(r.status));
      const lines = reports.map((r) => {
        const mark = r.status === 'ok' ? '✅' : r.status === 'not_configured' ? '⏭️' : '❌';
        return `${mark} ${r.title}: ${r.status}${r.tools ? ` (${r.tools} tools in ${r.areas} areas)` : ''}${r.detail ? ` — ${r.detail}` : ''}`;
      });
      if (!config.siteUrl) lines.unshift('❌ FLUENT_SITE_URL is not set — no product can connect.');
      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
        structuredContent: { site: config.siteUrl, ok, products: reports },
      };
    }
  );
}
