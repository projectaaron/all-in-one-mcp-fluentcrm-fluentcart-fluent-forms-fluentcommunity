import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  actionSignatures,
  annotationsFor,
  buildInputShape,
  isListAction,
  makeHandler,
} from '../../src/core/tool-factory.js';
import type { ToolSpec } from '../../src/core/types.js';
import { makeClient, mockFetch } from '../helpers.js';

const spec: ToolSpec = {
  name: 'crm_things',
  description: 'Manage things.',
  actions: {
    list_things: { op: 'things/list-things', method: 'GET', path: '/things', summary: 'List Things', destructive: false },
    get_thing: { op: 'things/get-thing', method: 'GET', path: '/things/{id}', summary: 'Get Thing', destructive: false },
    move_thing: {
      op: 'things/move-thing',
      method: 'POST',
      path: '/things/{id}/move/{target}',
      summary: 'Move Thing',
      destructive: false,
    },
    delete_thing: { op: 'things/delete-thing', method: 'DELETE', path: '/things/{id}', summary: 'Delete Thing', destructive: true },
  },
};

function run(args: Record<string, unknown>, responses: Parameters<typeof mockFetch>[0] = [{ status: 200, body: { ok: 1 } }]) {
  const { calls, fetchImpl } = mockFetch(responses);
  const handler = makeHandler(spec, { client: makeClient(fetchImpl) });
  return { calls, result: handler(args as never) };
}

describe('tool factory', () => {
  it('routes an action to its endpoint with pagination defaults for lists', async () => {
    const { calls, result } = run({ action: 'list_things' });
    const res = await result;
    expect(res.isError).toBeUndefined();
    expect(calls[0].url).toContain('/wp-json/fluent-crm/v2/things?');
    expect(calls[0].url).toContain('page=1');
    expect(calls[0].url).toContain('per_page=20');
    const structured = (res as { structuredContent: Record<string, unknown> }).structuredContent;
    expect(structured.ok).toBe(true);
    expect(structured.status).toBe(200);
    expect(structured.action).toBe('list_things');
  });

  it('does not inject pagination into non-list actions', async () => {
    const { calls } = run({ action: 'get_thing', id: 5 });
    await new Promise((r) => setTimeout(r, 0));
    expect(calls[0].url).toBe('https://example.com/wp-json/fluent-crm/v2/things/5');
  });

  it('substitutes id and path_params, URL-encoding values', async () => {
    const { calls, result } = run({ action: 'move_thing', id: 'a/b', path_params: { target: 9 }, body: { x: 1 } });
    await result;
    expect(calls[0].url).toContain('/things/a%2Fb/move/9');
    expect(calls[0].method).toBe('POST');
  });

  it('errors helpfully on missing path params without calling the API', async () => {
    const { calls, result } = run({ action: 'move_thing', id: 3 });
    const res = await result;
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('target');
    expect(calls.length).toBe(0);
  });

  it('refuses destructive actions without confirm and explains', async () => {
    const { calls, result } = run({ action: 'delete_thing', id: 3 });
    const res = await result;
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/confirm: true/);
    expect(res.content[0].text).toMatch(/nothing was changed/i);
    expect(calls.length).toBe(0);
  });

  it('executes destructive actions with confirm: true', async () => {
    const { calls, result } = run({ action: 'delete_thing', id: 3, confirm: true });
    const res = await result;
    expect(res.isError).toBeUndefined();
    expect(calls[0].method).toBe('DELETE');
    expect(calls[0].url).toContain('/things/3');
  });

  it('rejects unknown actions', async () => {
    const { result } = run({ action: 'explode' });
    const res = await result;
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('Unknown action');
  });

  it('converts API errors into isError results with the hint', async () => {
    const { result } = run({ action: 'get_thing', id: 1 }, [{ status: 401, body: { message: 'bad' } }]);
    const res = await result;
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('FLUENT_API_USERNAME');
  });

  it('builds a validating input schema (action enum, confirm only when destructive)', () => {
    const schema = z.object(buildInputShape(spec));
    expect(schema.safeParse({ action: 'list_things' }).success).toBe(true);
    expect(schema.safeParse({ action: 'nope' }).success).toBe(false);
    expect(schema.safeParse({ action: 'list_things', per_page: 1000 }).success).toBe(false);
    expect('confirm' in buildInputShape(spec)).toBe(true);
    const readOnlySpec: ToolSpec = { ...spec, actions: { list_things: spec.actions.list_things } };
    expect('confirm' in buildInputShape(readOnlySpec)).toBe(false);
  });

  it('derives annotations from the action set', () => {
    expect(annotationsFor(spec)).toMatchObject({ readOnlyHint: false, destructiveHint: true });
    const ro: ToolSpec = { ...spec, actions: { list_things: spec.actions.list_things } };
    expect(annotationsFor(ro)).toMatchObject({ readOnlyHint: true, destructiveHint: false });
  });

  it('renders compact action signatures', () => {
    const sig = actionSignatures(spec.actions);
    expect(sig).toContain('list_things');
    expect(sig).toContain('get_thing(id)');
    expect(sig).toContain('move_thing(id,target)');
    expect(sig).toContain('delete_thing(id)⚠');
  });

  it('classifies list actions', () => {
    expect(isListAction('list_orders')).toBe(true);
    expect(isListAction('search_products_by_name')).toBe(true);
    expect(isListAction('get_order')).toBe(false);
  });
});
