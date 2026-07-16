import { describe, expect, it } from 'vitest';
import { loadConfig, productEnvStatus } from '../../src/core/config.js';

describe('config', () => {
  it('one shared credential pair enables every product', () => {
    const config = loadConfig(['FLUENTCRM', 'FLUENTCART'], {
      FLUENT_SITE_URL: 'https://example.com/',
      FLUENT_API_USERNAME: 'admin',
      FLUENT_API_PASSWORD: 'app-pass',
    } as NodeJS.ProcessEnv);
    expect(config.siteUrl).toBe('https://example.com'); // trailing slash stripped
    expect(productEnvStatus(config, 'FLUENTCRM')).toEqual({ configured: true, missing: [] });
    expect(productEnvStatus(config, 'FLUENTCART')).toEqual({ configured: true, missing: [] });
    expect(config.credentials.FLUENTCRM).toEqual({ username: 'admin', password: 'app-pass' });
  });

  it('per-product overrides win over the shared pair; half a pair does not count', () => {
    const config = loadConfig(['FLUENTCRM', 'FLUENTCART'], {
      FLUENT_SITE_URL: 'https://example.com',
      FLUENT_API_USERNAME: 'admin',
      FLUENT_API_PASSWORD: 'app-pass',
      FLUENTCRM_API_USERNAME: 'crm-manager',
      FLUENTCRM_API_PASSWORD: 'crm-pass',
      FLUENTCART_API_USERNAME: 'only-user', // no password -> override ignored, shared used
    } as NodeJS.ProcessEnv);
    expect(config.credentials.FLUENTCRM).toEqual({ username: 'crm-manager', password: 'crm-pass' });
    expect(config.credentials.FLUENTCART).toEqual({ username: 'admin', password: 'app-pass' });
  });

  it('reports missing credentials when neither shared nor override pair is set', () => {
    const config = loadConfig(['FLUENTCART'], {
      FLUENT_SITE_URL: 'https://example.com',
    } as NodeJS.ProcessEnv);
    const cart = productEnvStatus(config, 'FLUENTCART');
    expect(cart.configured).toBe(false);
    expect(cart.missing.join(' ')).toContain('FLUENT_API_USERNAME');
  });

  it('reports missing site URL for every product', () => {
    const config = loadConfig(['FLUENTCRM'], {
      FLUENTCRM_API_USERNAME: 'u',
      FLUENTCRM_API_PASSWORD: 'p',
    } as NodeJS.ProcessEnv);
    const status = productEnvStatus(config, 'FLUENTCRM');
    expect(status.configured).toBe(false);
    expect(status.missing).toEqual(['FLUENT_SITE_URL']);
  });

  it('parses tuning vars with sane fallbacks', () => {
    const config = loadConfig([], {
      FLUENT_HTTP_TIMEOUT_MS: 'not-a-number',
      FLUENT_HTTP_MAX_RETRIES: '5',
    } as NodeJS.ProcessEnv);
    expect(config.timeoutMs).toBe(30000);
    expect(config.maxRetries).toBe(5);
  });

  it('accepts FLUENT_HTTP_MAX_RETRIES=0 (retries disabled), not for timeout', () => {
    const config = loadConfig([], {
      FLUENT_HTTP_MAX_RETRIES: '0',
      FLUENT_HTTP_TIMEOUT_MS: '0',
    } as NodeJS.ProcessEnv);
    expect(config.maxRetries).toBe(0);
    expect(config.timeoutMs).toBe(30000);
  });
});
