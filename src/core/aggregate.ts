/** Server-side counting for list endpoints: `count_only` returns the total
 *  from one tiny page; `group_by` walks EVERY page of the filtered list and
 *  returns value → count, so a question like "why were 168 entries
 *  cancelled?" costs one tool call and a few hundred bytes instead of 168
 *  full records in the model's context. */

import type { FluentClient } from './http.js';
import { locateList, valueAt } from './shape.js';

/** Records per upstream page while aggregating. Conservative so plugins that
 *  build heavy rows (funnel entries carry the contact and its metrics) stay
 *  well inside the HTTP timeout. */
export const AGG_PAGE_SIZE = 100;
/** Hard ceiling on records read for one aggregation (100 pages) — keeps a
 *  call inside MCP client timeouts; past it the result says `truncated` and
 *  asks for a narrower filter. */
export const AGG_MAX_RECORDS = 10_000;
/** Pages fetched in parallel after the first one. */
const CONCURRENCY = 4;

export interface Aggregation {
  total: number;
  /** Present for group_by: value → count, largest first. */
  groups?: Record<string, number>;
  group_by?: string[];
  records_read?: number;
  pages_read: number;
  /** True when AGG_MAX_RECORDS stopped the walk early. */
  truncated?: boolean;
}

/** A group key for one value: missing / null are named, objects are JSON. */
function keyOf(value: unknown): string {
  if (value === undefined) return '(missing)';
  if (value === null || value === '') return value === null ? '(null)' : '(empty)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function sortGroups(counts: Map<string, number>): Record<string, number> {
  return Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

export interface PageFetcher {
  (page: number, perPage: number): Promise<unknown>;
}

/** Page fetcher bound to one GET endpoint with fixed filters. */
export function endpointFetcher(
  client: FluentClient,
  req: { path: string; query: Record<string, unknown>; siteRoot?: boolean }
): PageFetcher {
  return async (page, perPage) =>
    (await client.request({ method: 'GET', path: req.path, query: { ...req.query, page, per_page: perPage }, siteRoot: req.siteRoot })).data;
}

/** Walk every page of a list and hand each record to `visit`. Returns the
 *  counts the walk saw. Stops at `maxRecords`. */
export async function walkPages(
  fetchPage: PageFetcher,
  visit: (item: unknown) => void,
  opts: { perPage?: number; maxRecords?: number } = {}
): Promise<{ total?: number; recordsRead: number; pagesRead: number; truncated: boolean }> {
  const perPage = opts.perPage ?? AGG_PAGE_SIZE;
  const maxRecords = opts.maxRecords ?? AGG_MAX_RECORDS;
  let recordsRead = 0;
  let pagesRead = 0;

  const first = locateList(await fetchPage(1, perPage));
  pagesRead++;
  if (!first) return { recordsRead: 0, pagesRead, truncated: false };
  for (const item of first.items) visit(item);
  recordsRead += first.items.length;

  const total = first.pagination?.total;
  // The plugin may cap per_page below what was asked — trust what it did.
  const effective = first.pagination?.per_page && first.pagination.per_page > 0 ? first.pagination.per_page : perPage;
  const knownLast = first.pagination?.total_pages ?? (total !== undefined ? Math.ceil(total / effective) : undefined);
  const maxPages = Math.max(1, Math.ceil(maxRecords / effective));
  const lastPage = Math.min(knownLast ?? maxPages, maxPages);

  // Without pagination metadata a short page marks the end, so pages are
  // fetched one at a time; with it, a few run in parallel.
  // A short page ends a walk only when the paginator gave no page count.
  let exhausted = first.items.length === 0 || (knownLast !== undefined ? knownLast <= 1 : first.items.length < effective);
  let next = 2;
  while (!exhausted && next <= lastPage) {
    const batch: number[] = [];
    for (let i = 0; i < (knownLast === undefined ? 1 : CONCURRENCY) && next <= lastPage; i++) batch.push(next++);
    const pages = await Promise.all(batch.map((p) => fetchPage(p, perPage)));
    for (const raw of pages) {
      const items = locateList(raw)?.items ?? [];
      pagesRead++;
      for (const item of items) visit(item);
      recordsRead += items.length;
      if (items.length === 0 || (knownLast === undefined && items.length < effective)) exhausted = true;
    }
  }
  const truncated = !exhausted && next > lastPage && (knownLast === undefined || knownLast > maxPages);
  return { total, recordsRead, pagesRead, truncated };
}

/** count_only: one request for one record, total from the paginator. */
export async function countOnly(fetchPage: PageFetcher): Promise<Aggregation> {
  const list = locateList(await fetchPage(1, 1));
  if (list?.pagination?.total !== undefined) return { total: list.pagination.total, pages_read: 1 };
  // No paginator: count by walking.
  const walked = await walkPages(fetchPage, () => {});
  return { total: walked.recordsRead, pages_read: walked.pagesRead, ...(walked.truncated ? { truncated: true } : {}) };
}

/** group_by: value → count across every page. Several fields group by the
 *  combination, keyed "a | b". */
export async function groupBy(fetchPage: PageFetcher, fields: string[]): Promise<Aggregation> {
  const counts = new Map<string, number>();
  const walked = await walkPages(fetchPage, (item) => {
    const key = fields.map((f) => keyOf(valueAt(item, f))).join(' | ');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return {
    total: walked.total ?? walked.recordsRead,
    groups: sortGroups(counts),
    group_by: fields,
    records_read: walked.recordsRead,
    pages_read: walked.pagesRead,
    ...(walked.truncated ? { truncated: true } : {}),
  };
}
