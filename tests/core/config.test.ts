import { describe, expect, it } from 'vitest';
import { loadConfig, productEnvStatus } from '../../src/core/config.js';

describe('config', () => {
  it('enables a product only when username and password are both set', () => {
    const config = loadConfig(['FLUENTCRM', 'FLUENTCART'], {
      FLUENT_SITE_URL: 'https://example.com/',
      FLUENTCRM_API_USERNAME: 'u',
      FLUENTCRM_API_PASSWORD: 'p',
      FLUENTCART_API_USERNAME: 'only-user',
    } as NodeJS.ProcessEnv);
    expect(config.siteUrl).toBe('https://example.com'); // trailing slash stripped
    expect(productEnvStatus(config, 'FLUENTCRM')).toEqual({ configured: true, missing: [] });
    const cart = productEnvStatus(config, 'FLUENTCART');
    expect(cart.configured).toBe(false);
    expect(cart.missing).toContain('FLUENTCART_API_USERNAME');
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
});
