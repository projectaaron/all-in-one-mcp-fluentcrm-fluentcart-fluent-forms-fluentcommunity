/** The coverage guarantee: every endpoint documented in
 *  docs/api-reference/<product>/endpoints.json is reachable through exactly
 *  one tool action, and the surface stays within its design constraints. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { annotationsFor } from '../src/core/tool-factory.js';
import { PRODUCTS } from '../src/products/index.js';

interface Inventory {
  count: number;
  endpoints: Array<{ group: string; slug: string; method: string; path: string }>;
}

for (const product of PRODUCTS) {
  describe(`${product.key} coverage`, () => {
    const inventory = JSON.parse(
      readFileSync(new URL(`../docs/api-reference/${product.key}/endpoints.json`, import.meta.url), 'utf8')
    ) as Inventory;

    it('maps every documented endpoint to exactly one tool action', () => {
      const mapped = new Map<string, string>();
      for (const spec of product.tools) {
        for (const [action, def] of Object.entries(spec.actions)) {
          expect(mapped.has(def.op), `duplicate mapping for ${def.op}`).toBe(false);
          mapped.set(def.op, `${spec.name}.${action}`);
        }
      }
      const missing = inventory.endpoints.filter((e) => !mapped.has(`${e.group}/${e.slug}`));
      expect(missing.map((e) => `${e.group}/${e.slug}`), 'endpoints not reachable through any tool').toEqual([]);
      expect(mapped.size, 'stale actions mapping endpoints that no longer exist').toBe(inventory.count);
    });

    it('action methods and paths match the documented inventory', () => {
      const byOp = new Map(inventory.endpoints.map((e) => [`${e.group}/${e.slug}`, e]));
      for (const spec of product.tools) {
        for (const def of Object.values(spec.actions)) {
          const doc = byOp.get(def.op)!;
          expect(`${def.method} ${def.path}`).toBe(`${doc.method} ${doc.path}`);
        }
      }
    });

    it('read-only tools contain no writes and no destructive actions', () => {
      for (const spec of product.tools) {
        const annotations = annotationsFor(spec);
        if (annotations.readOnlyHint) {
          for (const [action, def] of Object.entries(spec.actions)) {
            expect(def.method, `${spec.name}.${action}`).toMatch(/^(GET|HEAD)$/);
            expect(def.destructive, `${spec.name}.${action}`).toBe(false);
          }
        }
      }
    });

    it('every DELETE-method action is destructive (confirm-gated)', () => {
      for (const spec of product.tools) {
        for (const [action, def] of Object.entries(spec.actions)) {
          if (def.method === 'DELETE') expect(def.destructive, `${spec.name}.${action}`).toBe(true);
        }
      }
    });
  });
}

describe('overall surface', () => {
  it('stays within the 30-60 tool budget (incl. verify_setup)', () => {
    const total = PRODUCTS.reduce((n, p) => n + p.tools.length, 0) + 1;
    expect(total).toBeGreaterThanOrEqual(30);
    expect(total).toBeLessThanOrEqual(60);
  });

  it('tool names carry their product prefix and one-sentence descriptions', () => {
    for (const product of PRODUCTS) {
      for (const spec of product.tools) {
        expect(spec.name.startsWith(`${product.toolPrefix}_`), spec.name).toBe(true);
        expect(spec.description.length, spec.name).toBeGreaterThan(20);
        expect(spec.description.trim().endsWith('.'), `${spec.name} description should be a sentence`).toBe(true);
      }
    }
  });

  it('critical destructive endpoints are gated', () => {
    const find = (toolName: string, action: string) => {
      for (const p of PRODUCTS) {
        const t = p.tools.find((t) => t.name === toolName);
        if (t?.actions[action]) return t.actions[action];
      }
      throw new Error(`${toolName}.${action} not found`);
    };
    expect(find('crm_settings', 'reset_database').destructive).toBe(true);
    expect(find('cart_orders', 'refund_order').destructive).toBe(true);
    expect(find('cart_orders', 'delete_order').destructive).toBe(true);
    expect(find('crm_contacts', 'delete_contacts').destructive).toBe(true);
    expect(find('cart_licensing', 'regenerate_license_key').destructive).toBe(true);
  });
});
