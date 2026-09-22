import { readFileSync } from 'node:fs';
import { FluentClient, type FetchLike } from '../src/core/http.js';
import { PRODUCTS } from '../src/products/index.js';

/** Built-in tools registered in every mode and configuration. */
export const SERVER_TOOLS = ['verify_setup', 'tool_map', 'support_report', 'wp_media_upload_from_url', 'wp_media_get', 'wp_media_list'];

/** Endpoints documented across every product's api-reference inventory.
 *  Derived from the committed inventories rather than written as a literal:
 *  scripts/gen-api-docs.mjs refreshes those from upstream on a weekly
 *  schedule, and a hardcoded total turns any upstream API change into a
 *  handful of unrelated-looking count failures across four test files
 *  instead of the one coverage failure that actually says what drifted. */
export const DOCUMENTED_ENDPOINTS = PRODUCTS.reduce((total, product) => {
  const inventory = JSON.parse(
    readFileSync(new URL(`../docs/api-reference/${product.key}/endpoints.json`, import.meta.url), 'utf8')
  ) as { count: number };
  return total + inventory.count;
}, 0);

/** Hand-written product extras (schedule preview, validator, bulk updates). */
export const PRODUCT_EXTRA_TOOLS = PRODUCTS.reduce((n, p) => n + (p.extras?.mapTools.length ?? 0), 0);

/** What `tools/list` returns in individual mode: one tool per documented
 *  endpoint, plus product extras, plus the built-ins. */
export const INDIVIDUAL_TOOL_COUNT = DOCUMENTED_ENDPOINTS + PRODUCT_EXTRA_TOOLS + SERVER_TOOLS.length;

export interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal | null;
  redirect?: string;
}

/** A fetch mock that records requests and replays scripted responses. */
export function mockFetch(
  responses: Array<{ status: number; body?: unknown; headers?: Record<string, string> }> | ((req: CapturedRequest) => { status: number; body?: unknown; headers?: Record<string, string> })
) {
  const calls: CapturedRequest[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    const req: CapturedRequest = {
      url,
      method: init.method ?? 'GET',
      headers: (init.headers ?? {}) as Record<string, string>,
      body: typeof init.body === 'string' ? init.body : undefined,
      signal: init.signal,
      redirect: init.redirect,
    };
    calls.push(req);
    const next = typeof responses === 'function' ? responses(req) : responses[Math.min(calls.length - 1, responses.length - 1)];
    const body =
      next.body === undefined
        ? ''
        : typeof next.body === 'string' || next.body instanceof ArrayBuffer || next.body instanceof Uint8Array
          ? (next.body as BodyInit)
          : JSON.stringify(next.body);
    return new Response(body, {
      status: next.status,
      headers: { 'content-type': 'application/json', ...(next.headers ?? {}) },
    });
  };
  return { calls, fetchImpl };
}

export function makeClient(
  fetchImpl: FetchLike,
  overrides: Partial<ConstructorParameters<typeof FluentClient>[0]> = {}
): FluentClient {
  return new FluentClient({
    siteUrl: 'https://example.com',
    namespace: 'fluent-crm/v2',
    product: 'fluentcrm',
    productTitle: 'FluentCRM',
    envPrefix: 'FLUENTCRM',
    credentials: { username: 'apiuser', password: 'secret-pass' },
    fetchImpl,
    sleep: async () => {},
    ...overrides,
  });
}
