/** support_report: redaction, the recent-call log, and the end-to-end report
 *  through a real in-memory MCP client. */
import { describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { loadConfig, productEnvStatus } from '../../src/core/config.js';
import {
  DiagnosticsLog,
  buildSupportReport,
  classifyResult,
  makeRedactor,
  registerSupportReport,
} from '../../src/core/support.js';
import { makeActionHandler } from '../../src/core/action-tools.js';
import { makeHandler } from '../../src/core/tool-factory.js';
import type { ProductEntry } from '../../src/core/verify.js';
import { PRODUCTS } from '../../src/products/index.js';
import { SERVER_VERSION } from '../../src/version.js';
import { makeClient, mockFetch } from '../helpers.js';

const [crm, cart] = PRODUCTS;
const prefixes = PRODUCTS.map((p) => p.envPrefix);

const env = {
  FLUENT_SITE_URL: 'https://shop.example-store.com/blog',
  FLUENT_API_USERNAME: 'aaron',
  FLUENT_API_PASSWORD: 'abcd EFGH 1234 ijkl MNOP 5678',
  FLUENTCRM_API_USERNAME: 'crm-manager',
  FLUENTCRM_API_PASSWORD: 'crm-secret-pass',
} as NodeJS.ProcessEnv;

describe('makeRedactor', () => {
  const redact = makeRedactor(loadConfig(prefixes, env));

  it('masks the site host, usernames and passwords wherever they appear', () => {
    const out = redact(
      'FluentCRM API error [401 rest_forbidden] on GET https://shop.example-store.com/blog/wp-json/fluent-crm/v2/tags: ' +
        'user aaron / crm-manager with abcd EFGH 1234 ijkl MNOP 5678 and crm-secret-pass'
    );
    expect(out).not.toContain('example-store');
    expect(out).not.toContain('aaron');
    expect(out).not.toContain('crm-manager');
    expect(out).not.toContain('crm-secret-pass');
    expect(out).not.toContain('abcd EFGH');
    expect(out).toContain('[site]/blog/wp-json/fluent-crm/v2/tags');
    expect(out).toContain('[401 rest_forbidden]');
  });

  it('masks emails, Authorization headers, application passwords and long tokens it has never seen', () => {
    const out = redact(
      'contact jane.doe+test@customer.io; Authorization: Basic YWRtaW46c2VjcmV0cGFzc3dvcmQ=; Bearer 0123456789abcdef0123456789abcdef0123456789abcdef; ' +
        'pass wxyz ABCD 9876 efgh IJKL 5432; token 9f8e7d6c5b4a39281706f5e4d3c2b1a0ffeeddcc'
    );
    expect(out).not.toContain('customer.io');
    expect(out).not.toContain('YWRtaW4');
    expect(out).not.toContain('0123456789abcdef');
    expect(out).not.toContain('wxyz ABCD');
    expect(out).not.toContain('9f8e7d6c');
    expect(out).toContain('[email]');
    expect(out).toContain('Basic [redacted]');
    expect(out).toContain('[app-password]');
    expect(out).toContain('[token]');
  });

  it('masks usernames as whole words only, so the issues URL survives a user called "aaron"', () => {
    const out = redact('open https://github.com/projectaaron/x/issues/new as aaron (aaron@x.io) — /author/aaron/');
    expect(out).toContain('github.com/projectaaron/x/issues/new');
    expect(out).toContain('as [redacted] ([email]) — /author/[redacted]/');
  });

  it('leaves long tool names and ordinary text alone', () => {
    const text = 'cart_customer_portal_get_transaction_billing_address failed: Endpoint not found — is FluentCart installed?';
    expect(redact(text)).toBe(text);
  });

  it('works without a site URL or credentials', () => {
    const r = makeRedactor(loadConfig(prefixes, {} as NodeJS.ProcessEnv));
    expect(r('nothing to hide')).toBe('nothing to hide');
  });
});

describe('DiagnosticsLog', () => {
  it('keeps only the newest N entries, newest first', () => {
    const log = new DiagnosticsLog(3);
    for (let i = 1; i <= 5; i++) log.record({ at: `t${i}`, tool: `tool${i}`, outcome: 'ok', ms: i });
    expect(log.size).toBe(3);
    expect(log.entries().map((e) => e.tool)).toEqual(['tool5', 'tool4', 'tool3']);
  });

  it('classifies results: ok, dry run, API error with status/code, refusal', () => {
    expect(classifyResult({ content: [{ type: 'text', text: 'ok' }], structuredContent: { status: 200 } })).toEqual({ outcome: 'ok', status: 200 });
    expect(classifyResult({ content: [], structuredContent: { status: 200, dry_run: true } }).outcome).toBe('dry_run');
    const apiErr = classifyResult({
      isError: true,
      content: [{ type: 'text', text: 'FluentCRM API error [403 rest_forbidden] on GET /tags: Sorry — Authenticated but not allowed' }],
    });
    expect(apiErr).toMatchObject({ outcome: 'error', status: 403, code: 'rest_forbidden' });
    expect(apiErr.message).toContain('rest_forbidden');
    expect(classifyResult({ isError: true, content: [{ type: 'text', text: '🔒 Refused: crm_settings_reset_database is locked' }] }).outcome).toBe('refused');
    expect(classifyResult({ isError: true, content: [{ type: 'text', text: 'Refused: crm_tags_delete is destructive and requires confirm:true' }] }).outcome).toBe('refused');
  });

  it('records every executeAction outcome with the endpoint template, not the filled path', async () => {
    const { fetchImpl } = mockFetch([{ status: 404, body: { code: 'rest_no_route', message: 'No route was found' } }]);
    const diagnostics = new DiagnosticsLog();
    const spec = crm.tools.find((t) => t.name === 'crm_tags')!;
    const handler = makeHandler(spec, { client: makeClient(fetchImpl), diagnostics });
    const res = await handler({ action: 'get_tag', id: 12345 } as never);
    expect(res.isError).toBe(true);
    const [rec] = diagnostics.entries();
    expect(rec.tool).toBe('crm_tags.get_tag');
    expect(rec.endpoint).toMatch(/^GET \/tags\/\{/);
    expect(rec.endpoint).not.toContain('12345');
    expect(rec.outcome).toBe('error');
    expect(rec.status).toBe(404);
    expect(rec.code).toBe('rest_no_route');
    expect(typeof rec.ms).toBe('number');
  });
});

describe('individual-mode handler logging', () => {
  it('logs lock refusals and missing-parameter refusals, not just executed calls', async () => {
    const diagnostics = new DiagnosticsLog();
    const { fetchImpl, calls } = mockFetch([{ status: 200, body: {} }]);
    const client = makeClient(fetchImpl);
    const spec = crm.tools.find((t) => t.name === 'crm_tags')!;
    const locked = makeActionHandler(spec, 'delete_tag', { client, diagnostics, lockedTools: new Set(['crm_tags_delete']) }, 'crm_tags_delete');
    await locked({ id: 1, confirm: true } as never);
    const missing = makeActionHandler(spec, 'get_tag', { client, diagnostics }, 'crm_tags_get');
    await missing({} as never);
    expect(calls).toHaveLength(0);
    const [m, l] = diagnostics.entries();
    expect(l).toMatchObject({ tool: 'crm_tags_delete', endpoint: 'DELETE /tags/{id}', outcome: 'refused' });
    expect(m).toMatchObject({ tool: 'crm_tags_get', endpoint: 'GET /tags/{id}', outcome: 'error' });
    expect(m.message).toContain('Missing required parameter');
  });
});

async function callSupportReport(entries: ProductEntry[], config: ReturnType<typeof loadConfig>, diagnostics: DiagnosticsLog, args: Record<string, unknown> = {}) {
  const server = new McpServer({ name: 'test', version: '0.0.0' });
  registerSupportReport(server, entries, config, { transport: 'stdio', toolCount: 1298, diagnostics });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'probe', version: '0.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  const result = (await client.callTool({ name: 'support_report', arguments: args })) as {
    isError?: boolean;
    structuredContent: { version: string; transport: string; ok?: boolean; error_count: number; markdown: string; issues_url: string };
    content: Array<{ text: string }>;
  };
  await client.close();
  return result;
}

describe('support_report', () => {
  it('produces a redacted report with version, product checks and the error log', async () => {
    const config = loadConfig(prefixes, env);
    // The namespace index works; the CRM test read is rejected (revoked password).
    const { fetchImpl } = mockFetch((req) =>
      req.url.includes('_fields=namespaces')
        ? { status: 200, body: { namespaces: ['wp/v2', 'fluent-crm/v2'] } }
        : { status: 401, body: { code: 'rest_not_logged_in', message: 'Sorry, you are not allowed — user aaron at https://shop.example-store.com' } }
    );
    const client = makeClient(fetchImpl, { credentials: { username: 'crm-manager', password: 'crm-secret-pass' }, siteUrl: config.siteUrl! });
    const entries: ProductEntry[] = [
      { module: crm, status: productEnvStatus(config, crm.envPrefix), client },
      { module: cart, status: productEnvStatus(config, cart.envPrefix) },
    ];
    const diagnostics = new DiagnosticsLog();
    const handler = makeHandler(crm.tools.find((t) => t.name === 'crm_tags')!, { client, diagnostics });
    await handler({ action: 'list_tags' } as never);

    const res = await callSupportReport(entries, config, diagnostics);
    expect(res.isError).toBeFalsy();
    const md = res.content[0].text;
    expect(res.structuredContent.version).toBe(SERVER_VERSION);
    expect(res.structuredContent.transport).toBe('stdio');
    expect(res.structuredContent.ok).toBe(false);
    expect(res.structuredContent.error_count).toBe(1);
    expect(res.structuredContent.issues_url).toMatch(/\/issues\/new$/);

    expect(md).toContain('## All-In-One MCP for Fluent Suite — support report');
    expect(md).toContain(`- Version: ${SERVER_VERSION}`);
    expect(md).toContain('- Transport: stdio');
    expect(md).toContain('- Tool mode: individual (1298 tools registered)');
    expect(md).toContain('- Locked tools: 12 (the default list)');
    expect(md).toContain('- Site URL: https://[site]/blog');
    expect(md).toContain('shared FLUENT_API_USERNAME/PASSWORD set; per-product overrides for FLUENTCRM');
    expect(md).toContain('FLUENT_API_PASSWORD'); // the *name* is listed…
    expect(md).toContain('| FluentCRM | auth_failed | yes |');
    expect(md).toContain('| FluentCart | not_configured |');
    expect(md).toContain('1 error');
    expect(md).toMatch(/\| crm_tags\.list_tags \| GET \/tags \| 401 \| error \(rest_not_logged_in\) \|/);

    // …but nothing identifying leaks, not even through the upstream error text.
    // (the repository owner in the issues URL is the one legitimate "aaron")
    const outsideUrl = md.replaceAll('github.com/projectaaron/', '');
    for (const secret of ['example-store', 'aaron', 'crm-manager', 'crm-secret-pass', 'abcd EFGH']) {
      expect(outsideUrl).not.toContain(secret);
    }
  });

  it('can skip the live probe and explains an empty log', async () => {
    const config = loadConfig(prefixes, { FLUENT_SITE_URL: 'http://localhost:8080' } as NodeJS.ProcessEnv);
    const entries: ProductEntry[] = PRODUCTS.map((module) => ({ module, status: productEnvStatus(config, module.envPrefix) }));
    const res = await callSupportReport(entries, config, new DiagnosticsLog(), { probe: false });
    const md = res.content[0].text;
    expect(res.structuredContent.ok).toBeUndefined();
    expect(md).toContain('Live connection checks skipped');
    expect(md).toContain('plain HTTP');
    expect(md).toContain('No tool calls yet in this session');
    expect(md).toContain('FluentCRM: not configured (missing');
  });

  it('flags a missing site URL and honours the calls limit', async () => {
    const config = loadConfig(prefixes, {} as NodeJS.ProcessEnv);
    const entries: ProductEntry[] = PRODUCTS.map((module) => ({ module, status: productEnvStatus(config, module.envPrefix) }));
    const diagnostics = new DiagnosticsLog();
    for (let i = 0; i < 10; i++) diagnostics.record({ at: new Date().toISOString(), tool: `t${i}`, outcome: 'ok', ms: 1 });
    const { markdown } = await buildSupportReport(entries, config, { transport: 'cloudflare-worker', toolCount: 5, diagnostics }, { probe: true, calls: 3 });
    expect(markdown).toContain('Site URL: NOT SET');
    expect(markdown).toContain('(3 of 10 logged');
    expect(markdown).toContain('fresh server per request');
    expect(markdown).toContain('| t9 |');
    expect(markdown).not.toContain('| t6 |');
  });
});
