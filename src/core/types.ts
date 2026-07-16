/** Shared types for the product-agnostic core. */

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
  /** Path lives at the site root (e.g. `/?fluent-cart=...`), not under wp-json. */
  siteRoot?: boolean;
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
}

export interface ProductCredentials {
  username: string;
  password: string;
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
}

export interface RequestOptions {
  method: string;
  /** Fully substituted path relative to the namespace, e.g. `/orders/12`. */
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  /** Resolve against the site root instead of the REST namespace. */
  siteRoot?: boolean;
}

export interface FluentResponse {
  status: number;
  data: unknown;
}
