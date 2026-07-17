/** Env-driven configuration. Credentials never leave this module except as
 *  an Authorization header built inside the HTTP client.
 *
 *  One WordPress Application Password runs the whole server:
 *  FLUENT_API_USERNAME / FLUENT_API_PASSWORD apply to every product.
 *  Per-product overrides (<PREFIX>_API_USERNAME / <PREFIX>_API_PASSWORD)
 *  are still honored when set — useful for scoped users. */

import type { ProductCredentials } from './types.js';

export interface ServerConfig {
  siteUrl: string | undefined;
  timeoutMs: number;
  maxRetries: number;
  /** Resolved per product prefix: override creds when present, else shared. */
  credentials: Record<string, ProductCredentials | undefined>;
  /** `individual` (default): one tool per operation. `grouped`: the legacy
   *  one-tool-per-area surface with an `action` parameter — for clients that
   *  can't handle a large tool list. Set via FLUENT_TOOL_MODE. */
  toolMode: 'individual' | 'grouped';
  /** Tools that refuse unconditionally — confirm:true cannot override.
   *  Canonical individual tool names; enforced in both modes. */
  lockedTools: Set<string>;
}

/** Locked by default: operations no agent has any business executing —
 *  catastrophic (full CRM wipe, audience-wide delete), self-lockout
 *  (revoking API keys), or business-breaking with no agent use case
 *  (disconnecting checkout payments, invalidating customers' license keys).
 *  Override with FLUENT_LOCKED_TOOLS: a comma-separated list of individual
 *  tool names replaces this set; the token `default` expands to it
 *  ("default,crm_contacts_bulk_action" = these plus one more); the single
 *  value `none` disables locking entirely. */
export const DEFAULT_LOCKED_TOOLS = [
  'crm_settings_reset_database',
  'crm_contacts_delete_contacts',
  'crm_settings_delete_rest_key',
  'crm_settings_test_delete_request',
  'cart_settings_disconnect_payment_method',
  'cart_licensing_regenerate_license_key',
] as const;

export function parseLockedTools(raw: string | undefined): Set<string> {
  if (raw === undefined || raw.trim() === '') return new Set(DEFAULT_LOCKED_TOOLS);
  const tokens = raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (tokens.includes('none')) return new Set();
  const out = new Set<string>();
  for (const t of tokens) {
    if (t === 'default') for (const d of DEFAULT_LOCKED_TOOLS) out.add(d);
    else out.add(t);
  }
  return out;
}

export interface ProductEnvStatus {
  configured: boolean;
  missing: string[];
}

const int = (v: string | undefined, fallback: number, min = 1): number => {
  const n = v ? Number.parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n >= min ? n : fallback;
};

const pair = (env: NodeJS.ProcessEnv, prefix: string): ProductCredentials | undefined => {
  const username = env[`${prefix}_API_USERNAME`]?.trim();
  const password = env[`${prefix}_API_PASSWORD`]?.trim();
  return username && password ? { username, password } : undefined;
};

/** Read configuration for the given env prefixes (one per product). */
export function loadConfig(envPrefixes: string[], env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const shared = pair(env, 'FLUENT');
  const credentials: Record<string, ProductCredentials | undefined> = {};
  for (const prefix of envPrefixes) {
    credentials[prefix] = pair(env, prefix) ?? shared;
  }
  return {
    siteUrl: env.FLUENT_SITE_URL?.trim().replace(/\/+$/, '') || undefined,
    timeoutMs: int(env.FLUENT_HTTP_TIMEOUT_MS, 30000),
    maxRetries: int(env.FLUENT_HTTP_MAX_RETRIES, 3, 0), // 0 disables retries
    credentials,
    toolMode: env.FLUENT_TOOL_MODE?.trim().toLowerCase() === 'grouped' ? 'grouped' : 'individual',
    lockedTools: parseLockedTools(env.FLUENT_LOCKED_TOOLS),
  };
}

/** Why a product is or isn't configured — for verify_setup and startup logs. */
export function productEnvStatus(config: ServerConfig, envPrefix: string): ProductEnvStatus {
  const missing: string[] = [];
  if (!config.siteUrl) missing.push('FLUENT_SITE_URL');
  if (!config.credentials[envPrefix]) {
    missing.push(`FLUENT_API_USERNAME + FLUENT_API_PASSWORD (or ${envPrefix}_API_USERNAME + ${envPrefix}_API_PASSWORD)`);
  }
  return { configured: missing.length === 0, missing };
}
