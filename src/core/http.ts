/** The one shared WordPress REST client. Auth injection, retry with backoff,
 *  rate-limit handling, normalized errors. No other module performs HTTP. */

import { FluentApiError, parseWpError } from './errors.js';
import { METHOD_OVERRIDE_REFUSAL, methodOverrideKey } from './path-safety.js';
import type { FluentResponse, ProductCredentials, RequestOptions } from './types.js';

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export interface FluentClientOptions {
  siteUrl: string;
  namespace: string;
  product: string;
  productTitle: string;
  envPrefix: string;
  credentials?: ProductCredentials;
  timeoutMs?: number;
  maxRetries?: number;
  fetchImpl?: FetchLike;
  /** Injectable sleep for tests. */
  sleep?: (ms: number) => Promise<void>;
}

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

export class FluentClient {
  private readonly baseUrl: string;
  private readonly authHeader: string | undefined;
  private readonly opts: Required<Pick<FluentClientOptions, 'timeoutMs' | 'maxRetries'>> &
    Omit<FluentClientOptions, 'timeoutMs' | 'maxRetries'>;
  private readonly fetchImpl: FetchLike;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(options: FluentClientOptions) {
    this.opts = { timeoutMs: 30000, maxRetries: 3, ...options };
    this.baseUrl = `${options.siteUrl.replace(/\/+$/, '')}/wp-json/${options.namespace.replace(/^\/+|\/+$/g, '')}`;
    this.authHeader = options.credentials
      ? 'Basic ' + Buffer.from(`${options.credentials.username}:${options.credentials.password}`).toString('base64')
      : undefined;
    this.fetchImpl = options.fetchImpl ?? ((url, init) => fetch(url, init));
    this.sleep = options.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  }

  /** Build the absolute URL incl. WP-style query serialization (arr -> k[]=v). */
  buildUrl(path: string, query?: Record<string, unknown>, siteRoot = false): string {
    const root = siteRoot ? this.baseUrl.slice(0, this.baseUrl.indexOf('/wp-json/')) : this.baseUrl;
    assertSafeRequest(path, query);
    const url = new URL(root + (path.startsWith('/') ? path : `/${path}`));
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        appendQuery(url.searchParams, key, value);
      }
    }
    return url.toString();
  }

  async request(options: RequestOptions): Promise<FluentResponse> {
    const url = this.buildUrl(options.path, options.query, options.siteRoot);
    const method = options.method.toUpperCase();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.authHeader) headers.Authorization = this.authHeader;
    let bodyText: string | undefined;
    if (options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      headers['Content-Type'] = 'application/json';
      bodyText = JSON.stringify(options.body);
    }

    const isRead = method === 'GET' || method === 'HEAD';
    const maxAttempts = this.opts.maxRetries + 1;
    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) await this.sleep(this.backoffMs(attempt));
      // One deadline covers the whole exchange — headers AND body — so a
      // site that stalls mid-response can't hang the call forever.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs);
      let response: Response;
      let data: unknown;
      try {
        try {
          response = await this.fetchImpl(url, {
            method,
            headers,
            body: bodyText,
            signal: controller.signal,
            // A redirect turns a write into a GET (301/302), which would then
            // report ok for a write that never happened. Writes never follow.
            redirect: isRead ? 'follow' : 'manual',
          });
        } catch (err) {
          // Network-level failure. Retry only when we know the request never
          // mutated anything (GET/HEAD, and not flagged noRetry — some Fluent
          // endpoints mutate via GET) — a dropped response on a write could
          // otherwise double-apply.
          lastError = err;
          if (isRead && !options.noRetry && attempt < maxAttempts - 1) continue;
          throw this.transportError(method, options.path, err, controller.signal.aborted);
        }

        if (RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts - 1) {
          // 429 is always safe to retry (the server refused before executing);
          // 5xx only for reads that can't mutate (not noRetry).
          if (response.status === 429 || (isRead && !options.noRetry)) {
            const retryAfter = Number.parseFloat(response.headers.get('retry-after') ?? '');
            if (Number.isFinite(retryAfter) && retryAfter > 0) {
              await this.sleep(Math.min(retryAfter * 1000, 30000));
            }
            continue;
          }
        }

        if (!isRead && response.status >= 300 && response.status < 400) {
          throw new FluentApiError({
            status: response.status,
            message: `the site redirected the request to ${response.headers.get('location') ?? '(no Location header)'} — the write was NOT re-sent`,
            product: this.opts.product,
            productTitle: this.opts.productTitle,
            envPrefix: this.opts.envPrefix,
            endpoint: `${method} ${options.path}`,
            hint: 'Set the site URL to the exact address the site redirects to (https vs http, www vs no-www), then retry.',
          });
        }

        try {
          data = await parseBody(response);
        } catch (err) {
          lastError = err;
          if (isRead && !options.noRetry && attempt < maxAttempts - 1) continue;
          throw this.transportError(method, options.path, err, controller.signal.aborted);
        }
      } finally {
        clearTimeout(timer);
      }

      if (response.ok) return { status: response.status, data };

      const { code, message } = parseWpError(data);
      throw new FluentApiError({
        status: response.status,
        code,
        message,
        product: this.opts.product,
        productTitle: this.opts.productTitle,
        envPrefix: this.opts.envPrefix,
        endpoint: `${method} ${options.path}`,
      });
    }
    // Unreachable in practice; satisfy the compiler.
    throw lastError instanceof Error ? lastError : new Error('request failed');
  }

  /** Fetch an arbitrary wp-json path (outside the product namespace). */
  async requestRaw(path: string, query?: Record<string, unknown>): Promise<FluentResponse> {
    return this.wpRequest({ method: 'GET', path, query });
  }

  /** Authenticated request against WordPress core REST (`/wp-json/...`),
   *  with arbitrary method/headers/body — used by the wp_media tool. Throws
   *  a normalized FluentApiError on non-2xx. */
  async wpRequest(options: {
    method: string;
    path: string;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: RequestInit['body'];
    /** Skip the throw-on-error normalization (verify_setup probes). */
    tolerant?: boolean;
  }): Promise<FluentResponse> {
    const site = this.baseUrl.slice(0, this.baseUrl.indexOf('/wp-json/'));
    assertSafeRequest(options.path, options.query);
    const url = new URL(`${site}/wp-json${options.path.startsWith('/') ? options.path : `/${options.path}`}`);
    if (options.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const headers: Record<string, string> = { Accept: 'application/json', ...(options.headers ?? {}) };
    if (this.authHeader) headers.Authorization = this.authHeader;
    const method = options.method.toUpperCase();
    const isRead = method === 'GET' || method === 'HEAD';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs);
    let response: Response;
    let data: unknown;
    try {
      try {
        response = await this.fetchImpl(url.toString(), {
          method: options.method,
          headers,
          body: options.body,
          signal: controller.signal,
          redirect: isRead ? 'follow' : 'manual',
        });
        if (!isRead && response.status >= 300 && response.status < 400) {
          throw new FluentApiError({
            status: response.status,
            message: `the site redirected the request to ${response.headers.get('location') ?? '(no Location header)'} — the write was NOT re-sent`,
            product: 'wordpress',
            productTitle: 'WordPress',
            envPrefix: 'FLUENT',
            endpoint: `${options.method} ${options.path}`,
            hint: 'Set the site URL to the exact address the site redirects to (https vs http, www vs no-www), then retry.',
          });
        }
        data = await parseBody(response);
      } catch (err) {
        if (err instanceof FluentApiError) throw err;
        throw this.transportError(method, options.path, err, controller.signal.aborted, 'wordpress');
      }
    } finally {
      clearTimeout(timer);
    }
    if (!response.ok && !options.tolerant) {
      const { code, message } = parseWpError(data);
      throw new FluentApiError({
        status: response.status,
        code,
        message,
        product: 'wordpress',
        productTitle: 'WordPress',
        envPrefix: 'FLUENT',
        endpoint: `${options.method} ${options.path}`,
      });
    }
    return { status: response.status, data };
  }

  /** Plain fetch of an external URL (no auth header) through the injected
   *  fetch, with the configured timeout — used to sideload media. Redirects
   *  are NOT followed: the caller re-validates each Location hop. */
  async fetchUrl(url: string): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs);
    try {
      return await this.fetchImpl(url, { method: 'GET', signal: controller.signal, redirect: 'manual' });
    } finally {
      clearTimeout(timer);
    }
  }

  /** Normalize a network failure or timeout. A timed-out WRITE is not
   *  "could not reach the site": the site may have applied it, so say so and
   *  steer away from a blind retry that could double-refund or double-send. */
  private transportError(method: string, path: string, err: unknown, timedOut: boolean, as?: 'wordpress'): FluentApiError {
    const isRead = method === 'GET' || method === 'HEAD';
    return new FluentApiError({
      status: 0,
      message: timedOut ? `timed out after ${this.opts.timeoutMs} ms` : err instanceof Error ? err.message : String(err),
      product: as ?? this.opts.product,
      productTitle: as ? 'WordPress' : this.opts.productTitle,
      envPrefix: as ? 'FLUENT' : this.opts.envPrefix,
      endpoint: `${method} ${path}`,
      ...(timedOut
        ? {
            hint: isRead
              ? 'The site did not answer in time — it may be slow or overloaded. Retry, or raise FLUENT_HTTP_TIMEOUT_MS.'
              : 'The site did not answer in time. The write may still have been applied — read the record before retrying so it is not applied twice.',
          }
        : {}),
    });
  }

  private backoffMs(attempt: number): number {
    const base = 500 * 2 ** (attempt - 1);
    return base + Math.floor(Math.random() * 250);
  }
}

/** PHP/WordPress bracket serialization at any depth: arrays -> k[]=v (or
 *  k[i][sub]=v for arrays of objects), objects -> k[sub]=v, recursively. */
/** Backstop for every request, whoever built the path: refuse dot segments
 *  (URL parsing collapses them, rerouting the call to another endpoint) and
 *  the WordPress `_method` override. Tool-level checks give the friendlier
 *  refusal first; this guarantees nothing slips through hand-written paths. */
function assertSafeRequest(path: string, query?: Record<string, unknown>): void {
  const bare = path.split('?')[0];
  for (const seg of bare.split('/')) {
    const s = seg.toLowerCase().replace(/%2e/g, '.');
    if (s === '.' || s === '..') {
      throw new Error(`Refused (nothing was sent): the request path ${JSON.stringify(path)} contains a "${seg}" segment, which would reach a different endpoint.`);
    }
  }
  const key = methodOverrideKey(query);
  if (key) throw new Error(`Refused (nothing was sent): query key "${key}" — ${METHOD_OVERRIDE_REFUSAL}.`);
}

function appendQuery(params: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    const base = key.endsWith('[]') ? key.slice(0, -2) : key;
    value.forEach((v, i) => {
      if (v !== null && typeof v === 'object') appendQuery(params, `${base}[${i}]`, v);
      else params.append(`${base}[]`, String(v));
    });
  } else if (typeof value === 'object') {
    for (const [sub, v] of Object.entries(value as Record<string, unknown>)) appendQuery(params, `${key}[${sub}]`, v);
  } else {
    params.append(key, String(value));
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Non-JSON (HTML error page, plugin notice). Keep a short excerpt.
    return { raw: text.slice(0, 500) };
  }
}
