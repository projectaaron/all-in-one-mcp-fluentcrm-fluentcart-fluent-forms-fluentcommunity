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
import { placeholdersOf } from '../src/core/tool-factory.js';
import type { ServerConfig } from '../src/core/config.js';
import { buildServer } from '../src/server.js';
import { PRODUCTS } from '../src/products/index.js';
import { makeClient, mockFetch } from './helpers.js';

const SERVER_TOOLS = ['verify_setup', 'tool_map', 'wp_media_upload_from_url', 'wp_media_get', 'wp_media_list'];

describe('individual tool names', () => {
  it('are unique across every product and the built-in server tools', () => {
    const all = [...SERVER_TOOLS];
    for (const product of PRODUCTS) {
      for (const spec of product.tools) all.push(...Object.values(individualNamesFor(spec)));
    }
    expect(all.length).toBe(new Set(all).size);
    expect(all.length).toBe(699 + SERVER_TOOLS.length);
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
          const isList = /^(list|search|get_all)/.test(action) && def.method === 'GET';
          expect('page' in shape, `${spec.name}.${action} page presence`).toBe(isList);
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

  it('individual mode registers one tool per operation (699 + 5 built-ins)', () => {
    expect(buildServer(config('individual')).toolCount).toBe(704);
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
