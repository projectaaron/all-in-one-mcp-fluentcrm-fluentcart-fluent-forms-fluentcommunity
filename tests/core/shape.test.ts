import { describe, expect, it } from 'vitest';
import { shapeResponse, textSummary } from '../../src/core/shape.js';

const paginator = {
  current_page: 2,
  per_page: 20,
  total: 45,
  last_page: 3,
  data: [
    { id: 1, email: 'a@x.com', secret_notes: 'x'.repeat(1000), status: 'active' },
    { id: 2, email: 'b@x.com', secret_notes: 'y', status: 'inactive' },
  ],
};

describe('shapeResponse', () => {
  it('finds a nested paginator and extracts pagination', () => {
    const shaped = shapeResponse({ subscribers: paginator }, { detail: 'summary', summaryFields: ['id', 'email'] });
    expect(shaped.pagination).toEqual({ page: 2, per_page: 20, total: 45, total_pages: 3 });
    expect(shaped.itemCount).toBe(2);
    const items = (shaped.data as { subscribers: { data: unknown[] } }).subscribers.data;
    expect(items[0]).toEqual({ id: 1, email: 'a@x.com' });
  });

  it('projects to explicit fields even in full mode and keeps id', () => {
    const shaped = shapeResponse(paginator, { detail: 'full', fields: ['status'] });
    const items = (shaped.data as { data: unknown[] }).data;
    expect(items[0]).toEqual({ status: 'active', id: 1 });
  });

  it('returns raw data in full mode without fields', () => {
    const shaped = shapeResponse({ subscribers: paginator }, { detail: 'full' });
    expect(shaped.data).toEqual({ subscribers: paginator });
    expect(shaped.summarized).toBe(false);
    expect(shaped.pagination?.total).toBe(45);
  });

  it('prunes long strings when no summary fields are configured', () => {
    const shaped = shapeResponse(paginator, { detail: 'summary' });
    const items = (shaped.data as { data: Array<Record<string, unknown>> }).data;
    expect(String(items[0].secret_notes)).toMatch(/… \[1000 chars\]$/);
    expect(items[1].secret_notes).toBe('y');
  });

  it('handles plain arrays and single objects', () => {
    const arr = shapeResponse([{ id: 1 }, { id: 2 }], { detail: 'summary' });
    expect(arr.itemCount).toBe(2);
    const single = shapeResponse({ id: 9, title: 'T' }, { detail: 'summary', summaryFields: ['title'] });
    expect(single.data).toEqual({ title: 'T', id: 9 });
  });
});

describe('textSummary', () => {
  it('summarizes lists with pagination', () => {
    const shaped = shapeResponse({ subscribers: paginator }, { detail: 'summary', summaryFields: ['id'] });
    const text = textSummary('crm_contacts', 'list_contacts', 200, shaped);
    expect(text).toContain('crm_contacts.list_contacts');
    expect(text).toContain('2 items');
    expect(text).toContain('page 2/3');
    expect(text).toContain('total 45');
  });

  it('identifies single records', () => {
    const shaped = shapeResponse({ id: 7, email: 'x@y.z' }, { detail: 'summary' });
    expect(textSummary('crm_contacts', 'get_contact', 200, shaped)).toContain('id=7');
  });
});
