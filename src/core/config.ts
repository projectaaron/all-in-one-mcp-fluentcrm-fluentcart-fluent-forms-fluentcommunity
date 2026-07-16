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
