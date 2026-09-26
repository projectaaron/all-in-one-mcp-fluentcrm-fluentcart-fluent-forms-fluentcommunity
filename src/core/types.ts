/** Shared types for the product-agnostic core. */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// Type-only circular import (http.ts imports this module's interfaces) — fine for TS.
import type { FluentClient } from './http.js';

/** One reachable REST endpoint, as generated into a product's endpoints.gen.ts. */
export interface EndpointDef {
  /** `group/slug` from the product's docs — the coverage key. */
  op: string;
  /** HTTP method, upper case. */
  method: string;
  /** Path template relative to the REST namespace, e.g. `/orders/{order_id}`. */
  path: string;
  /** One-line summary from the OpenAPI spec. */
  summary: string;
  /** Hard-to-undo operation — requires `confirm: true`. */
  destructive: boolean;
  /** Pin this operation's individual tool name (external API stability) —
   *  set via tool-map.json operationOverrides; wins over the name stemmer. */
  toolName?: string;
  /** Top-level body keys the endpoint requires. Checked before the HTTP call
   *  so a malformed body fails fast with guidance instead of an opaque
   *  plugin-side error — set via tool-map.json operationOverrides. */
  requiredBody?: string[];
  /** Body-shape hint for endpoints whose payload nests under a wrapper key
   *  (the plugin silently ignores flat fields). Appended to the tool
   *  description and to missing-body errors — set via operationOverrides. */
  bodyNote?: string;
  /** Path lives at the site root (e.g. `/?fluent-cart=...`), not under wp-json. */
  siteRoot?: boolean;
  /** Read-back guard for writes whose endpoint accepts a body the plugin will
   *  store but never act on (e.g. a form-integration feed saved under an
   *  unregistered integration name). A GET on `path` (same placeholders as
   *  the write) is fetched before the write to validate `allow`, and after
   *  it to return the stored record as `stored` — set via operationOverrides. */
  readback?: EndpointReadback;
}

export interface EndpointReadback {
  /** GET path template resolved with the write's own path parameters. */
  path: string;
  /** Preflight: `body[bodyField]` must be a key (or member) of the readback
   *  response's `fromKey`. Enforced only when `requiredWhen` (a body field)
   *  is present and non-empty, so status-only toggles pass through. */
  allow?: { bodyField: string; fromKey: string; requiredWhen?: string };
  /** Post-write: locate the stored item in readback[itemsKey] whose `id`
   *  equals the write response's `idFrom` field; missing means the plugin
   *  stored something it will never read. */
  stored?: { itemsKey: string; idFrom: string };
}

/** A consolidated tool: one resource domain, many actions. */
export interface ToolSpec {
  /** Tool name, e.g. `cart_orders`. */
  name: string;
  /** One plain sentence. */
  description: string;
  /** action name -> endpoint */
  actions: Record<string, EndpointDef>;
  /** Extra sentence(s) appended to the description (auth caveats etc). */
  note?: string;
  /** Every write action is safely repeatable (sets idempotentHint). */
  idempotent?: boolean;
}

export interface ProductCredentials {
  username: string;
  password: string;
}

/** Server settings hand-written tools may read (from ServerConfig). */
export interface ExtrasSettings {
  suspiciousIpPrefixes?: string[];
}

/** A product's hand-written tools beyond the generated endpoint surface —
 *  e.g. the FluentCRM sequence schedule preview. Registered in both tool
 *  modes and listed in tool_map under an existing area. */
export interface ProductExtras {
  /** Default area key the tools are listed under in tool_map, e.g. `crm_sequences`. */
  area: string;
  /** tool_map entries (name/summary/params/destructive/paginated). An entry's
   *  own `area` overrides the default. */
  mapTools: Array<{ name: string; summary: string; params: string[]; destructive: boolean; paginated: boolean; area?: string }>;
  /** Areas that exist only for extras (no generated endpoints) — area key →
   *  one-sentence description, listed in tool_map after the product's areas. */
  newAreas?: Record<string, string>;
  /** Register the tools; returns the registered names. */
  register: (server: McpServer, client: FluentClient, settings?: ExtrasSettings) => string[];
}

/** A self-contained Fluent product module. Adding a product never touches core. */
export interface ProductModule {
  /** Product key, e.g. `fluentcrm`. Also the docs/api-reference/<key> name. */
  key: string;
  /** Human name, e.g. `FluentCRM`. */
  title: string;
  /** WP REST namespace, e.g. `fluent-crm/v2`. */
  namespace: string;
  /** Env var prefix, e.g. `FLUENTCRM` -> FLUENTCRM_API_USERNAME/_PASSWORD. */
  envPrefix: string;
  /** Tool prefix, e.g. `crm`. */
  toolPrefix: string;
  /** The consolidated tools. */
  tools: ToolSpec[];
  /** Summary-mode projections: tool name -> field names kept per record. */
  summaryFields: Record<string, string[]>;
  /** A harmless authenticated GET used by verify_setup, e.g. `/tags`. */
  verifyRead: { path: string; query?: Record<string, unknown>; label: string };
  /** Hand-written tools beyond the generated endpoint surface. */
  extras?: ProductExtras;
}

export interface RequestOptions {
  method: string;
  /** Fully substituted path relative to the namespace, e.g. `/orders/12`. */
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  /** Resolve against the site root instead of the REST namespace. */
  siteRoot?: boolean;
  /** Never retry beyond 429 — set for destructive actions (even GET ones). */
  noRetry?: boolean;
}

export interface FluentResponse {
  status: number;
  data: unknown;
}
