/** The individualized tool surface: deterministic names, focused schemas,
 *  and — table-driven over EVERY action of every product — correct routing
 *  and confirm-gating through the individual handlers. */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  actionAnnotations,
  actionDescription,
  buildActionInputShape,
  individualNamesFor,
  makeActionHandler,
} from '../src/core/action-tools.js';
import { makeHandler, placeholdersOf } from '../src/core/tool-factory.js';
import type { ServerConfig } from '../src/core/config.js';
import { buildServer } from '../src/server.js';
import { PRODUCTS } from '../src/products/index.js';
import { DOCUMENTED_ENDPOINTS, INDIVIDUAL_TOOL_COUNT, SERVER_TOOLS, makeClient, mockFetch } from './helpers.js';

describe('individual tool names', () => {
  it('are unique across every product and the built-in server tools', () => {
    const all = [...SERVER_TOOLS];
    for (const product of PRODUCTS) {
      for (const spec of product.tools) all.push(...Object.values(individualNamesFor(spec)));
    }
    expect(all.length).toBe(new Set(all).size);
    expect(all.length).toBe(DOCUMENTED_ENDPOINTS + SERVER_TOOLS.length);
  });

  it('are lowercase identifiers of at most 64 characters, prefixed by their area', () => {
    for (const product of PRODUCTS) {
      for (const spec of product.tools) {
        for (const name of Object.values(individualNamesFor(spec))) {
          expect(name).toMatch(/^[a-z][a-z0-9_]*$/);
          expect(name.length).toBeLessThanOrEqual(64);
          expect(name.startsWith(`${spec.name}_`)).toBe(true);
        }
      }
    }
  });

  it('strip words the area name already carries', () => {
    const crm = PRODUCTS.find((p) => p.key === 'fluentcrm')!;
    const contacts = individualNamesFor(crm.tools.find((t) => t.name === 'crm_contacts')!);
    expect(contacts.list_contacts).toBe('crm_contacts_list');
    expect(contacts.create_contact).toBe('crm_contacts_create');
    expect(contacts.get_contact_notes).toBe('crm_contacts_get_notes');

    const cart = PRODUCTS.find((p) => p.key === 'fluentcart')!;
    const orders = individualNamesFor(cart.tools.find((t) => t.name === 'cart_orders')!);
    expect(orders.refund_order).toBe('cart_orders_refund');
    expect(orders.list_orders).toBe('cart_orders_list');
  });

  it('fall back to the full action name when stripping would collide', () => {
    const crm = PRODUCTS.find((p) => p.key === 'fluentcrm')!;
    const contacts = individualNamesFor(crm.tools.find((t) => t.name === 'crm_contacts')!);
    // delete_contact vs delete_contacts both strip to _delete — both keep full form.
    expect(contacts.delete_contact).toBe('crm_contacts_delete_contact');
    expect(contacts.delete_contacts).toBe('crm_contacts_delete_contacts');
  });

  it('keep the leading verb when stripping would empty the name; drop area nouns elsewhere', () => {
    const crm = PRODUCTS.find((p) => p.key === 'fluentcrm')!;
    const lists = individualNamesFor(crm.tools.find((t) => t.name === 'crm_lists')!);
    expect(lists.list_lists).toBe('crm_lists_list');
    const cart = PRODUCTS.find((p) => p.key === 'fluentcart')!;
    const reports = individualNamesFor(cart.tools.find((t) => t.name === 'cart_reports')!);
    // report_overview: "report" is an area word and NOT position-protected.
    expect(reports.report_overview).toBe('cart_reports_overview');
  });

  it('honor an explicit toolName override (external-API name pinning)', () => {
    const spec = {
      name: 'crm_things',
      description: 'Things.',
      actions: {
        list_things: { op: 'a', method: 'GET', path: '/things', summary: 'List', destructive: false },
        get_thing: { op: 'b', method: 'GET', path: '/things/{id}', summary: 'Get', destructive: false, toolName: 'crm_things_fetch' },
      },
    } as never;
    const names = individualNamesFor(spec);
    expect(names).toEqual({ list_things: 'crm_things_list', get_thing: 'crm_things_fetch' });
  });
});

describe('individual tool schemas and annotations', () => {
  it('require every path parameter, gate destructive actions, paginate lists', () => {
    for (const product of PRODUCTS) {
      for (const spec of product.tools) {
        for (const [action, def] of Object.entries(spec.actions)) {
          const shape = buildActionInputShape(action, def);
          const placeholders = placeholdersOf(def.path);
          const schema = z.object(shape);

          // Path params are required, one each, at the top level.
          const full = Object.fromEntries(placeholders.map((p) => [p, 1]));
          expect(schema.safeParse(full).success, `${spec.name}.${action} should accept its params`).toBe(true);
          if (placeholders.length) {
            expect(schema.safeParse({}).success, `${spec.name}.${action} must require ${placeholders[0]}`).toBe(false);
          }

          expect('confirm' in shape, `${spec.name}.${action} confirm presence`).toBe(def.destructive);
          // Pagination on every GET (plenty of paginated collections hide
          // behind get_* names) and on list/search actions of any method.
          const paged = def.method === 'GET' || /^(list|search|get_all)/.test(action);
          expect('page' in shape, `${spec.name}.${action} page presence`).toBe(paged);
          expect('body' in shape, `${spec.name}.${action} body presence`).toBe(def.method !== 'GET' && def.method !== 'HEAD');

          const ann = actionAnnotations(spec, def);
          expect(ann.readOnlyHint).toBe((def.method === 'GET' || def.method === 'HEAD') && !def.destructive);
          expect(ann.destructiveHint).toBe(def.destructive);
        }
      }
    }
  });

  it('describe each tool with its summary, area, endpoint, and destruction warning', () => {
    const crm = PRODUCTS.find((p) => p.key === 'fluentcrm')!;
    const spec = crm.tools.find((t) => t.name === 'crm_contacts')!;
    const desc = actionDescription(spec, spec.actions.delete_contact, { productTitle: crm.title });
    expect(desc).toContain('Delete Contact');
    expect(desc).toContain('crm_contacts');
    expect(desc).toContain('DELETE /subscribers/{id}');
    expect(desc).toContain('confirm:true');
    const readDesc = actionDescription(spec, spec.actions.get_contact, { productTitle: crm.title });
    expect(readDesc).not.toContain('confirm:true');
  });
});

describe('individual handler ergonomics', () => {
  const crm = () => PRODUCTS.find((p) => p.key === 'fluentcrm')!;
  const contacts = () => crm().tools.find((t) => t.name === 'crm_contacts')!;

  it('missing/empty path params name the top-level parameter, not id/path_params', async () => {
    const spec = contacts();
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: {} }]);
    const handler = makeActionHandler(spec, 'get_contact', { client: makeClient(fetchImpl) }, 'crm_contacts_get');
    const res = (await handler({ id: '' } as never)) as { isError?: boolean; content: Array<{ text: string }> };
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('crm_contacts_get');
    expect(res.content[0].text).toContain('top-level argument');
    expect(res.content[0].text).not.toContain('path_params');
    expect(calls.length).toBe(0);
  });

  it('non-list GET tools accept and forward page/per_page (no silent stripping)', async () => {
    const spec = contacts();
    const shape = buildActionInputShape('get_contact_emails', spec.actions.get_contact_emails);
    expect('page' in shape && 'per_page' in shape).toBe(true);
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: {} }]);
    const handler = makeActionHandler(spec, 'get_contact_emails', { client: makeClient(fetchImpl) }, 'crm_contacts_get_emails');
    await handler({ id: 7, page: 2, per_page: 50 } as never);
    const url = new URL(calls[0].url);
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('per_page')).toBe('50');
  });
});

describe('buildServer tool modes', () => {
  const config = (toolMode: ServerConfig['toolMode'], creds = true): ServerConfig => ({
    siteUrl: creds ? 'https://example.com' : undefined,
    timeoutMs: 1000,
    maxRetries: 0,
    credentials: creds
      ? { FLUENTCRM: { username: 'u', password: 'p' }, FLUENTCART: { username: 'u', password: 'p' } }
      : { FLUENTCRM: undefined, FLUENTCART: undefined },
    toolMode,
  });

  it('individual mode registers one tool per documented operation, plus the built-ins', () => {
    expect(buildServer(config('individual')).toolCount).toBe(INDIVIDUAL_TOOL_COUNT);
  });

  it('grouped mode keeps the legacy surface (43 areas + verify_setup, wp_media, tool_map)', () => {
    expect(buildServer(config('grouped')).toolCount).toBe(46);
  });

  it('with nothing configured only tool_map and verify_setup register', () => {
    expect(buildServer(config('individual', false)).toolCount).toBe(2);
  });
});

for (const product of PRODUCTS) {
  describe(`${product.key} individual handlers`, () => {
    for (const spec of product.tools) {
      it(`${spec.name}: every action calls its endpoint; destructive ones gate`, async () => {
        const names = individualNamesFor(spec);
        for (const [action, def] of Object.entries(spec.actions)) {
          const placeholders = placeholdersOf(def.path);
          const args: Record<string, unknown> = Object.fromEntries(placeholders.map((p, i) => [p, 11 + i]));
          if (def.destructive) args.confirm = true;

          // Success path: the exact documented endpoint is called.
          const ok = mockFetch([{ status: 200, body: { ok: true } }]);
          const handler = makeActionHandler(
            spec,
            action,
            { client: makeClient(ok.fetchImpl, { namespace: product.namespace, envPrefix: product.envPrefix, productTitle: product.title }) },
            names[action]
          );
          const res = (await handler(args as never)) as {
            isError?: boolean;
            content: Array<{ text: string }>;
            structuredContent?: { ok: boolean };
          };
          expect(res.isError, `${names[action]} unexpectedly errored: ${res.content?.[0]?.text}`).toBeUndefined();
          expect(res.structuredContent?.ok).toBe(true);
          expect(ok.calls.length, `${names[action]} did not call the API`).toBe(1);
          expect(ok.calls[0].method).toBe(def.method);
          let expectedPath = def.path;
          placeholders.forEach((p, i) => (expectedPath = expectedPath.replace(`{${p}}`, String(11 + i))));
          const calledUrl = new URL(ok.calls[0].url);
          const expectedUrl = def.siteRoot
            ? new URL(`https://example.com${expectedPath}`)
            : new URL(`https://example.com/wp-json/${product.namespace}${expectedPath}`);
          expect(calledUrl.pathname, names[action]).toBe(expectedUrl.pathname);

          // Result text leads with the individual tool name.
          expect(res.content[0].text.startsWith(names[action]), `${names[action]} label in text`).toBe(true);

          // Destructive gate: without confirm, refuse and touch nothing.
          if (def.destructive) {
            const gate = mockFetch([{ status: 200, body: {} }]);
            const gated = makeActionHandler(spec, action, { client: makeClient(gate.fetchImpl) }, names[action]);
            const { confirm: _confirm, ...noConfirm } = args;
            const refused = (await gated(noConfirm as never)) as { isError?: boolean; content: Array<{ text: string }> };
            expect(refused.isError, `${names[action]} must be confirm-gated`).toBe(true);
            expect(refused.content[0].text).toContain('confirm: true');
            expect(refused.content[0].text).toContain(names[action]);
            expect(gate.calls.length, `${names[action]} called the API without confirm`).toBe(0);
          }
        }
      });
    }
  });
}

describe('reserved parameter guard', () => {
  it('throws when a path placeholder shadows an envelope parameter', () => {
    const def = { op: 'x', method: 'GET', path: '/reports/{page}/export', summary: 'X', destructive: false } as never;
    expect(() => buildActionInputShape('get_export', def)).toThrow(/reserved "page"/);
  });
});

describe('locked tools refuse unconditionally', () => {
  const crm = () => PRODUCTS.find((p) => p.key === 'fluentcrm')!;
  const settings = () => crm().tools.find((t) => t.name === 'crm_settings')!;
  const locked = new Set(['crm_settings_reset_database']);

  it('individual mode: confirm:true cannot override the lock; no HTTP happens', async () => {
    const spec = settings();
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: {} }]);
    const handler = makeActionHandler(
      spec,
      'reset_database',
      { client: makeClient(fetchImpl), lockedTools: locked },
      'crm_settings_reset_database'
    );
    const res = (await handler({ confirm: true } as never)) as { isError?: boolean; content: Array<{ text: string }> };
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('🔒');
    expect(res.content[0].text).toContain('FLUENT_LOCKED_TOOLS');
    expect(calls.length).toBe(0);
  });

  it('grouped mode: the same canonical name locks the action', async () => {
    const spec = settings();
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: {} }]);
    const handler = makeHandler(spec, {
      client: makeClient(fetchImpl),
      lockedTools: locked,
      canonicalNames: individualNamesFor(spec),
    });
    const res = (await handler({ action: 'reset_database', confirm: true } as never)) as {
      isError?: boolean;
      content: Array<{ text: string }>;
    };
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('🔒');
    expect(calls.length).toBe(0);
  });

  it('unlocked tools in the same area are unaffected', async () => {
    const spec = settings();
    const { calls, fetchImpl } = mockFetch([{ status: 200, body: {} }]);
    const names = individualNamesFor(spec);
    const [action] = Object.entries(spec.actions).find(([, d]) => d.method === 'GET' && !d.destructive)!;
    const handler = makeActionHandler(spec, action, { client: makeClient(fetchImpl), lockedTools: locked }, names[action]);
    const res = (await handler({} as never)) as { isError?: boolean };
    expect(res.isError).toBeUndefined();
    expect(calls.length).toBe(1);
  });
});
