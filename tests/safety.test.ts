import { describe, expect, it } from 'vitest';
import { annotationsFor } from '../src/core/tool-factory.js';
import { PRODUCTS } from '../src/products/index.js';

const spec = (product: string, tool: string) => {
  const p = PRODUCTS.find((x) => x.key === product)!;
  return p.tools.find((t) => t.name === tool)!;
};

/** Regressions from the final adversarial verification — keep these pinned. */
describe('safety regressions', () => {
  it('reset_system_logs (a GET that deletes all logs) is confirm-gated', () => {
    const def = spec('fluentcrm', 'crm_settings').actions.reset_system_logs;
    expect(def.method).toBe('GET');
    expect(def.destructive).toBe(true);
  });

  it('mass-send actions are confirm-gated; single-recipient sends are not', () => {
    const campaigns = spec('fluentcrm', 'crm_campaigns').actions;
    for (const a of [
      'schedule_campaign',
      'resume_campaign',
      'resend_campaign_emails',
      'resend_failed_emails',
      'resend_unopened_emails',
    ]) {
      expect(campaigns[a]?.destructive, `crm_campaigns.${a}`).toBe(true);
    }
    expect(campaigns.send_campaign_test_email?.destructive).toBe(false);
    expect(campaigns.pause_campaign?.destructive).toBe(false);

    const sms = spec('fluentcrm', 'crm_sms').actions;
    expect(sms.schedule_sms_campaign?.destructive).toBe(true);
    expect(sms.resume_sms_campaign?.destructive).toBe(true);
    expect(sms.send_subscriber_custom_sms?.destructive).toBe(false);
  });

  it('report tools stay pure-read despite refund-ish slugs', () => {
    for (const [product, tool] of [
      ['fluentcart', 'cart_reports'],
      ['fluentcrm', 'crm_reports'],
    ] as const) {
      const s = spec(product, tool);
      expect(annotationsFor(s).readOnlyHint, tool).toBe(true);
      for (const [name, def] of Object.entries(s.actions)) {
        expect(def.destructive, `${tool}.${name}`).toBe(false);
      }
    }
  });

  it('crm_custom_fields opts into idempotentHint; others stay conservative', () => {
    expect(annotationsFor(spec('fluentcrm', 'crm_custom_fields')).idempotentHint).toBe(true);
    expect(annotationsFor(spec('fluentcrm', 'crm_settings')).idempotentHint).toBe(false);
    expect(annotationsFor(spec('fluentcart', 'cart_settings')).idempotentHint).toBe(false);
  });
});

// Regression: claude.ai renders only the text content block to the model, so
// the shaped records must be serialized there, not just in structuredContent.
import { makeHandler } from '../src/core/tool-factory.js';
import { FluentClient } from '../src/core/http.js';

describe('text block carries data', () => {
  it('list responses serialize shaped records into content[0].text', async () => {
    const client = new FluentClient({
      siteUrl: 'https://example.com', namespace: 'fluent-cart/v2', product: 'fluentcart',
      productTitle: 'FluentCart', envPrefix: 'FLUENTCART',
      credentials: { username: 'u', password: 'p' },
      fetchImpl: async () => new Response(JSON.stringify({
        products: { current_page: 1, per_page: 20, total: 1, last_page: 1,
          data: [{ ID: 92372, post_title: 'Test Product', post_status: 'publish' }],
          links: [{ url: 'x', label: '1' }], first_page_url: 'x' },
      }), { status: 200, headers: { 'content-type': 'application/json' } }),
      sleep: async () => {},
    });
    const s = spec('fluentcart', 'cart_products');
    const handler = makeHandler(s, { client });
    const res = (await handler({ action: 'list_products' })) as { content: Array<{ text: string }> };
    expect(res.content[0].text).toContain('Test Product');
    expect(res.content[0].text).toContain('92372');
    expect(res.content[0].text).not.toContain('first_page_url');
  });
});
