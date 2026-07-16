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
