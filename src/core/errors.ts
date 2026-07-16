/** Normalized errors with actionable hints. Credentials never appear here. */

export class FluentApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly product: string;
  readonly endpoint: string;
  readonly hint: string;

  constructor(args: {
    status: number;
    code?: string;
    message?: string;
    product: string;
    productTitle: string;
    envPrefix: string;
    endpoint: string;
  }) {
    const hint = hintFor(args.status, args.productTitle, args.envPrefix);
    super(
      `${args.productTitle} API error [${args.status}${args.code ? ` ${args.code}` : ''}] on ${args.endpoint}: ` +
        `${args.message || `HTTP ${args.status}`}${hint ? ` — ${hint}` : ''}`
    );
    this.name = 'FluentApiError';
    this.status = args.status;
    this.code = args.code || 'unknown';
    this.product = args.product;
    this.endpoint = args.endpoint;
    this.hint = hint;
  }
}

function hintFor(status: number, productTitle: string, envPrefix: string): string {
  switch (status) {
    case 0:
      return `Could not reach the site. Check FLUENT_SITE_URL (is it the WordPress site root, reachable from this machine?)`;
    case 400:
    case 422:
      return `The request body or parameters were rejected — compare against the endpoint schema in docs/api-reference/`;
    case 401:
      return `Authentication failed — check FLUENT_API_USERNAME / FLUENT_API_PASSWORD (or the ${envPrefix}_API_* overrides) and that the Application Password hasn't been revoked (create one under WP Admin → Users → your user → Application Passwords)`;
    case 403:
      return `Authenticated but not allowed — the ${productTitle} user behind the API credentials lacks the capability/permission for this endpoint (or the endpoint needs a customer browser session, see docs/api-reference/auth.md)`;
    case 404:
      return `Endpoint not found — is ${productTitle} installed and active on the site? Is FLUENT_SITE_URL the WordPress root (not the admin URL)? Pro-only endpoints 404 without the Pro plugin`;
    case 429:
      return `Rate limited by the site — the request was retried with backoff and still failed; slow down or raise the site's rate limits`;
    default:
      return status >= 500
        ? `The WordPress site errored — check the site's PHP error log; retrying may help for transient errors`
        : '';
  }
}

/** Extract WP-style error fields from a REST error payload, defensively. */
export function parseWpError(data: unknown): { code?: string; message?: string } {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    return {
      code: typeof d.code === 'string' ? d.code : undefined,
      message: typeof d.message === 'string' ? d.message : undefined,
    };
  }
  return {};
}
