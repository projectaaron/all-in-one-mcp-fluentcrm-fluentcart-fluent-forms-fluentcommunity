/** Unit tests for the merge-write machinery: deep merge, body hydration
 *  strategies, before/after diffing, and write verification. */
import { describe, expect, it } from 'vitest';
import {
  buildMergedBody,
  deepMerge,
  diffRecords,
  leafPaths,
  pairedReadFor,
  recordUpdatedAt,
  verifyWrite,
} from '../../src/core/merge.js';
import type { ToolSpec } from '../../src/core/types.js';

describe('deepMerge', () => {
  it('merges nested objects key-by-key and lets the patch win', () => {
    const base = { a: 1, nested: { keep: 'x', change: 'old' } };
    expect(deepMerge(base, { nested: { change: 'new' } })).toEqual({ a: 1, nested: { keep: 'x', change: 'new' } });
  });

  it('replaces arrays and scalars wholesale; null clears explicitly', () => {
    expect(deepMerge({ list: [1, 2, 3], s: 'a' }, { list: [9], s: null })).toEqual({ list: [9], s: null });
  });
});

describe('buildMergedBody', () => {
  it('record-shaped GET (top-level id): full record hydration', () => {
    const base = { id: 5, title: 'Keep me', settings: { a: 1, b: 2 } };
    const { body, strategy } = buildMergedBody(base, { settings: { b: 3 } });
    expect(strategy).toBe('record');
    expect(body).toEqual({ id: 5, title: 'Keep me', settings: { a: 1, b: 3 } });
  });

  it('wrapper-shaped GET with wrapped body ({email:{...}}): per-key hydration', () => {
    const base = {
      email: {
        id: 1305,
        title: 'Unlocked: Free Download (Day 7)',
        settings: { timings: { delay: '7', delay_unit: 'days' }, template_config: { footer: 'x' } },
      },
    };
    const { body, strategy } = buildMergedBody(base, { email: { settings: { timings: { delay: '8' } } } });
    expect(strategy).toBe('wrapped');
    const email = (body as { email: Record<string, unknown> }).email;
    // The disaster case: title and template_config must survive a timings-only patch.
    expect(email.title).toBe('Unlocked: Free Download (Day 7)');
    expect(email.settings).toEqual({ timings: { delay: '8', delay_unit: 'days' }, template_config: { footer: 'x' } });
  });

  it('flat body against wrapper-shaped GET: hydrates from the inner record', () => {
    const base = { sequence: { id: 1, title: 'Old', settings: { mailer_settings: { from_name: 'A' } } } };
    const merged = buildMergedBody(base, { title: 'New' });
    expect(merged.strategy).toBe('unwrapped');
    expect(merged.body).toMatchObject({ title: 'New', settings: { mailer_settings: { from_name: 'A' } } });
    expect(merged.toRecordPath('title')).toBe('sequence.title');
  });

  it('passes the body through untouched when shapes do not line up', () => {
    expect(buildMergedBody({ something: [1, 2] }, { other: 1 }).strategy).toBe('none');
    expect(buildMergedBody('not a record', { other: 1 }).strategy).toBe('none');
  });
});

describe('diffRecords / leafPaths', () => {
  it('reports dotted leaf paths with loose equality across string/number', () => {
    const diff = diffRecords({ a: { b: '1', c: 2 } }, { a: { b: 1, c: 3 } });
    expect(diff).toEqual({ 'a.c': { from: 2, to: 3 } });
  });

  it('truncates long values for display', () => {
    const long = 'x'.repeat(500);
    const diff = diffRecords({ body: 'short' }, { body: long });
    expect(String(diff.body.to)).toContain('… [500 chars]');
  });

  it('leafPaths treats empty objects and arrays as leaves', () => {
    expect(leafPaths({ email: { settings: { timings: { delay: 1 } }, tags: [] } })).toEqual([
      'email.settings.timings.delay',
      'email.tags',
    ]);
  });
});

describe('verifyWrite', () => {
  const toRecord = (p: string) => p;

  it('warns when a field changed without being in the request body (the wiped-title case)', () => {
    const before = { email: { title: 'Unlocked: Free Download (Day 7)', settings: { timings: { delay: 1 }, template_config: { a: 1 } } } };
    const after = { email: { title: '', settings: { timings: { delay: 2 } } } };
    const v = verifyWrite(before, after, { email: { settings: { timings: { delay: 2 } } } }, toRecord);
    expect(v.rejected).toBe(false);
    expect(v.warnings.some((w) => w.includes('email.title') && w.includes('not in your request body'))).toBe(true);
    expect(v.warnings.some((w) => w.includes('template_config'))).toBe(true);
    expect(v.changed['email.title']).toEqual({ from: 'Unlocked: Free Download (Day 7)', to: '' });
  });

  it('warns when a supplied field did not take effect', () => {
    const before = { email: { subject: 'Old', status: 'draft' } };
    const after = { email: { subject: 'Old', status: 'published' } };
    const v = verifyWrite(before, after, { email: { subject: 'New', status: 'published' } }, toRecord);
    expect(v.rejected).toBe(false); // status landed
    expect(v.warnings.some((w) => w.includes('email.subject') && w.includes('record now has'))).toBe(true);
  });

  it('flags a fully ignored body as rejected', () => {
    const record = { email: { subject: 'Old', delay: 1 } };
    const v = verifyWrite(record, record, { email: { subject: 'New' } }, toRecord);
    expect(v.rejected).toBe(true);
  });

  it('does not warn about volatile timestamps, and setting a field to its current value counts as landed', () => {
    const before = { email: { subject: 'Same', updated_at: '2026-01-01 00:00:00' } };
    const after = { email: { subject: 'Same', updated_at: '2026-01-02 00:00:00' } };
    const v = verifyWrite(before, after, { email: { subject: 'Same' } }, toRecord);
    expect(v.rejected).toBe(false);
    expect(v.warnings).toEqual([]);
    expect(v.changed['email.updated_at']).toBeDefined();
  });
});

describe('pairedReadFor / recordUpdatedAt', () => {
  const spec: ToolSpec = {
    name: 'crm_things',
    description: 'Things.',
    actions: {
      get_thing: { op: 'a/get', method: 'GET', path: '/things/{id}', summary: 'Get', destructive: false },
      update_thing: { op: 'a/update', method: 'PUT', path: '/things/{id}', summary: 'Update', destructive: false },
      rename_thing: { op: 'a/rename', method: 'PUT', path: '/things/{id}/rename', summary: 'Rename', destructive: false },
      create_thing: { op: 'a/create', method: 'POST', path: '/things', summary: 'Create', destructive: false },
    },
  };

  it('pairs a PUT with the GET on the identical path only', () => {
    expect(pairedReadFor(spec, 'update_thing')?.path).toBe('/things/{id}');
    expect(pairedReadFor(spec, 'rename_thing')).toBeUndefined();
    expect(pairedReadFor(spec, 'create_thing')).toBeUndefined();
    expect(pairedReadFor(spec, 'get_thing')).toBeUndefined();
  });

  it('finds updated_at at the top level or one wrapper down', () => {
    expect(recordUpdatedAt({ updated_at: 'x' })).toBe('x');
    expect(recordUpdatedAt({ email: { updated_at: 'y' } })).toBe('y');
    expect(recordUpdatedAt({ email: {} })).toBeUndefined();
  });
});
