/** The one shared WordPress REST client. Auth injection, retry with backoff,
 *  rate-limit handling, normalized errors. No other module performs HTTP. */

import { FluentApiError, parseWpError } from './errors.js';
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
    const url = new URL(root + (path.startsWith('/') ? path : `/${path}`));
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          const k = key.endsWith('[]') ? key : `${key}[]`;
          for (const v of value) url.searchParams.append(k, String(v));
        } else if (typeof value === 'object') {
          // nested objects -> key[sub]=v (WP style)
          for (const [sub, v] of Object.entries(value as Record<string, unknown>)) {
            if (v !== undefined && v !== null) url.searchParams.append(`${key}[${sub}]`, String(v));
          }
        } else {
          url.searchParams.set(key, String(value));
        }
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

    const maxAttempts = this.opts.maxRetries + 1;
    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) await this.sleep(this.backoffMs(attempt));
      let response: Response;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs);
        try {
          response = await this.fetchImpl(url, { method, headers, body: bodyText, signal: controller.signal });
        } finally {
          clearTimeout(timer);
        }
      } catch (err) {
        // Network-level failure. Retry only when we know the request never
        // mutated anything (GET/HEAD, and not flagged noRetry — some Fluent
        // endpoints mutate via GET) — a dropped response on a write could
        // otherwise double-apply.
        lastError = err;
        if ((method === 'GET' || method === 'HEAD') && !options.noRetry && attempt < maxAttempts - 1) continue;
        throw new FluentApiError({
          status: 0,
          message: err instanceof Error ? err.message : String(err),
          product: this.opts.product,
          productTitle: this.opts.productTitle,
          envPrefix: this.opts.envPrefix,
          endpoint: `${method} ${options.path}`,
        });
      }

      if (RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts - 1) {
        // 429 is always safe to retry (the server refused before executing);
        // 5xx only for reads that can't mutate (not noRetry).
        if (response.status === 429 || ((method === 'GET' || method === 'HEAD') && !options.noRetry)) {
          const retryAfter = Number.parseFloat(response.headers.get('retry-after') ?? '');
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            await this.sleep(Math.min(retryAfter * 1000, 30000));
          }
          continue;
        }
      }

      const data = await parseBody(response);
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
    const site = this.baseUrl.slice(0, this.baseUrl.indexOf('/wp-json/'));
    const url = new URL(`${site}/wp-json${path.startsWith('/') ? path : `/${path}`}`);
    if (query) for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.authHeader) headers.Authorization = this.authHeader;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs);
    try {
      const response = await this.fetchImpl(url.toString(), { method: 'GET', headers, signal: controller.signal });
      return { status: response.status, data: await parseBody(response) };
    } finally {
      clearTimeout(timer);
    }
  }

  private backoffMs(attempt: number): number {
    const base = 500 * 2 ** (attempt - 1);
    return base + Math.floor(Math.random() * 250);
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
