/** verify_setup through a real in-memory MCP client — covers registration,
 *  schema, and all product states (ok / not_configured / auth_failed /
 *  plugin_missing). */
import { describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { loadConfig, productEnvStatus } from '../../src/core/config.js';
import { registerVerifySetup, type ProductEntry } from '../../src/core/verify.js';
import { PRODUCTS } from '../../src/products/index.js';
import { makeClient, mockFetch } from '../helpers.js';

async function callVerify(entries: ProductEntry[], env: NodeJS.ProcessEnv) {
  const config = loadConfig(PRODUCTS.map((p) => p.envPrefix), env);
  const server = new McpServer({ name: 'test', version: '0.0.0' });
  registerVerifySetup(server, entries, config);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'probe', version: '0.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  const result = (await client.callTool({ name: 'verify_setup', arguments: {} })) as {
    structuredContent: { ok: boolean; products: Array<Record<string, unknown>> };
    content: Array<{ text: string }>;
  };
  await client.close();
  return result;
}

const [crm, cart] = PRODUCTS;

describe('verify_setup', () => {
  it('reports unconfigured products as not_configured without erroring', async () => {
    const env = { FLUENT_SITE_URL: 'https://example.com' } as NodeJS.ProcessEnv;
    const config = loadConfig(PRODUCTS.map((p) => p.envPrefix), env);
    const entries: ProductEntry[] = PRODUCTS.map((module) => ({ module, status: productEnvStatus(config, module.envPrefix) }));
    const res = await callVerify(entries, env);
    expect(res.structuredContent.products).toHaveLength(PRODUCTS.length);
    for (const p of res.structuredContent.products) {
      expect(p.status).toBe('not_configured');
      expect(String(p.detail)).toContain('_API_USERNAME');
    }
  });

  it('reports ok with namespace detection and test read', async () => {
    const env = {
      FLUENT_SITE_URL: 'https://example.com',
      FLUENTCRM_API_USERNAME: 'u',
      FLUENTCRM_API_PASSWORD: 'p',
    } as NodeJS.ProcessEnv;
    const { fetchImpl } = mockFetch((req) =>
      req.url.includes('_fields=namespaces')
        ? { status: 200, body: { namespaces: ['wp/v2', 'fluent-crm/v2'] } }
        : { status: 200, body: { tags: [] } }
    );
    const config = loadConfig(PRODUCTS.map((p) => p.envPrefix), env);
    const entries: ProductEntry[] = [
      { module: crm, status: productEnvStatus(config, crm.envPrefix), client: makeClient(fetchImpl) },
      { module: cart, status: productEnvStatus(config, cart.envPrefix) },
    ];
    const res = await callVerify(entries, env);
    const crmReport = res.structuredContent.products.find((p) => p.product === 'fluentcrm')!;
    expect(crmReport.status).toBe('ok');
    expect(crmReport.namespace_detected).toBe(true);
    expect(crmReport.tools).toBe(
      crm.tools.reduce((n, t) => n + Object.keys(t.actions).length, 0) + (crm.extras?.mapTools.length ?? 0)
    );
    expect(crmReport.areas).toBe(crm.tools.length);
    expect(res.structuredContent.ok).toBe(true);
    expect(res.content[0].text).toContain('✅ FluentCRM: ok');
    expect(res.content[0].text).toContain('⏭️ FluentCart: not_configured');
  });

  it('distinguishes auth failure from missing plugin', async () => {
    const env = {
      FLUENT_SITE_URL: 'https://example.com',
      FLUENTCRM_API_USERNAME: 'u',
      FLUENTCRM_API_PASSWORD: 'p',
      FLUENTCART_API_USERNAME: 'u',
      FLUENTCART_API_PASSWORD: 'p',
    } as NodeJS.ProcessEnv;
    const auth401 = mockFetch((req) =>
      req.url.includes('_fields=namespaces') ? { status: 200, body: { namespaces: [] } } : { status: 401, body: { message: 'no' } }
    );
    const missing404 = mockFetch([{ status: 404, body: { code: 'rest_no_route' } }]);
    const config = loadConfig(PRODUCTS.map((p) => p.envPrefix), env);
    const entries: ProductEntry[] = [
      { module: crm, status: productEnvStatus(config, crm.envPrefix), client: makeClient(auth401.fetchImpl) },
      {
        module: cart,
        status: productEnvStatus(config, cart.envPrefix),
        client: makeClient(missing404.fetchImpl, { namespace: cart.namespace, envPrefix: cart.envPrefix, productTitle: cart.title }),
      },
    ];
    const res = await callVerify(entries, env);
    const crmReport = res.structuredContent.products.find((p) => p.product === 'fluentcrm')!;
    const cartReport = res.structuredContent.products.find((p) => p.product === 'fluentcart')!;
    expect(crmReport.status).toBe('auth_failed');
    expect(String(crmReport.detail)).toContain('FLUENT_API_USERNAME');
    expect(cartReport.status).toBe('plugin_missing');
    expect(res.structuredContent.ok).toBe(false);
  });
});
