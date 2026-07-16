import { FluentClient, type FetchLike } from '../src/core/http.js';

export interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
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
    };
    calls.push(req);
    const next = typeof responses === 'function' ? responses(req) : responses[Math.min(calls.length - 1, responses.length - 1)];
    const bodyText = next.body === undefined ? '' : typeof next.body === 'string' ? next.body : JSON.stringify(next.body);
    return new Response(bodyText, {
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
