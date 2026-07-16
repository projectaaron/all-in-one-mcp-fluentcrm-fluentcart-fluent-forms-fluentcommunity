/** Table-driven tests over EVERY tool action of every product:
 *  - success: the exact endpoint (method + fully substituted path) is called
 *  - API error: upstream failure surfaces as isError with actionable text
 *  plus per-product auth-failure and per-tool validation checks. */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildInputShape, makeHandler, placeholdersOf } from '../src/core/tool-factory.js';
import { PRODUCTS } from '../src/products/index.js';
import { makeClient, mockFetch } from './helpers.js';

function argsFor(def: { path: string; destructive: boolean }, action: string) {
  const placeholders = placeholdersOf(def.path);
  const args: Record<string, unknown> = { action };
  if (placeholders.length) {
    args.id = 11;
    args.path_params = Object.fromEntries(placeholders.slice(1).map((p, i) => [p, 100 + i]));
  }
  if (def.destructive) args.confirm = true;
  return { args, placeholders };
}

for (const product of PRODUCTS) {
  describe(`${product.key} tools`, () => {
    for (const spec of product.tools) {
      describe(spec.name, () => {
        it('every action calls its documented endpoint and handles API errors', async () => {
          for (const [action, def] of Object.entries(spec.actions)) {
            const { args, placeholders } = argsFor(def, action);

            // success path
            const ok = mockFetch([{ status: 200, body: { ok: true } }]);
            const handler = makeHandler(spec, {
              client: makeClient(ok.fetchImpl, { namespace: product.namespace, envPrefix: product.envPrefix, productTitle: product.title }),
            });
            const res = (await handler(args as never)) as { isError?: boolean; content: Array<{ text: string }>; structuredContent?: { ok: boolean } };
            expect(res.isError, `${spec.name}.${action} unexpectedly errored: ${res.content?.[0]?.text}`).toBeUndefined();
            expect(res.structuredContent?.ok).toBe(true);
            expect(ok.calls.length, `${spec.name}.${action} did not call the API`).toBe(1);
            expect(ok.calls[0].method).toBe(def.method);

            // URL must be the substituted template
            let expectedPath = def.path;
            if (placeholders.length) {
              expectedPath = expectedPath.replace(`{${placeholders[0]}}`, '11');
              placeholders.slice(1).forEach((p, i) => (expectedPath = expectedPath.replace(`{${p}}`, String(100 + i))));
            }
            const calledUrl = new URL(ok.calls[0].url);
            const expectedUrl = def.siteRoot
              ? new URL(`https://example.com${expectedPath}`)
              : new URL(`https://example.com/wp-json/${product.namespace}${expectedPath}`);
            expect(calledUrl.pathname, `${spec.name}.${action}`).toBe(expectedUrl.pathname);
            for (const [k, v] of expectedUrl.searchParams) expect(calledUrl.searchParams.get(k)).toBe(v);

            // API-error path
            const bad = mockFetch([{ status: 500, body: { code: 'boom', message: 'exploded' } }]);
            const errHandler = makeHandler(spec, {
              client: makeClient(bad.fetchImpl, { namespace: product.namespace, envPrefix: product.envPrefix, productTitle: product.title }),
            });
            const errRes = (await errHandler(args as never)) as { isError?: boolean; content: Array<{ text: string }> };
            expect(errRes.isError, `${spec.name}.${action} should surface API errors`).toBe(true);
            expect(errRes.content[0].text).toContain('500');
          }
        });

        it('destructive actions refuse without confirm; input schema validates', async () => {
          const schema = z.object(buildInputShape(spec));
          expect(schema.safeParse({ action: '__nope__' }).success).toBe(false);
          const first = Object.keys(spec.actions)[0];
          expect(schema.safeParse({ action: first }).success).toBe(true);

          for (const [action, def] of Object.entries(spec.actions)) {
            if (!def.destructive) continue;
            const { args } = argsFor(def, action);
            delete (args as { confirm?: boolean }).confirm;
            const gate = mockFetch([{ status: 200, body: {} }]);
            const handler = makeHandler(spec, { client: makeClient(gate.fetchImpl) });
            const res = (await handler(args as never)) as { isError?: boolean; content: Array<{ text: string }> };
            expect(res.isError, `${spec.name}.${action} must be confirm-gated`).toBe(true);
            expect(res.content[0].text).toContain('confirm: true');
            expect(gate.calls.length, `${spec.name}.${action} called the API without confirm`).toBe(0);
          }
        });
      });
    }

    it('401s carry the product env-var hint', async () => {
      const spec = product.tools[0];
      const [action, def] = Object.entries(spec.actions).find(([, d]) => !d.destructive)!;
      const { args } = argsFor(def, action);
      const { fetchImpl } = mockFetch([{ status: 401, body: { message: 'unauthorized' } }]);
      const handler = makeHandler(spec, {
        client: makeClient(fetchImpl, { namespace: product.namespace, envPrefix: product.envPrefix, productTitle: product.title }),
      });
      const res = (await handler(args as never)) as { content: Array<{ text: string }> };
      expect(res.content[0].text).toContain(`${product.envPrefix}_API_USERNAME`);
    });
  });
}
