/** Response shaping: find the record set, project to summary fields or the
 *  caller's `fields`, extract pagination, build the one-line text summary. */

export interface Shaped {
  data: unknown;
  pagination?: { page?: number; per_page?: number; total?: number; total_pages?: number };
  itemCount?: number;
  /** True when summary-mode projection dropped fields. */
  summarized: boolean;
}

const MAX_STRING = 300;

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v);

/** Laravel-style paginator: { data: [...], total, current_page, per_page, last_page } */
function isPaginator(v: unknown): v is Rec & { data: unknown[] } {
  return isRec(v) && Array.isArray(v.data) && ('total' in v || 'current_page' in v || 'per_page' in v);
}

function paginationOf(p: Rec): Shaped['pagination'] {
  const num = (x: unknown) =>
    typeof x === 'number' ? x : typeof x === 'string' && x.trim() !== '' && Number.isFinite(Number(x)) ? Number(x) : undefined;
  return {
    page: num(p.current_page),
    per_page: num(p.per_page),
    total: num(p.total),
    total_pages: num(p.last_page),
  };
}

/** Keep only `paths` (each a list of key segments) of a value, preserving the
 *  nesting: {subscriber:{status,ip,…}} with [["subscriber","status"]] →
 *  {subscriber:{status}}. Arrays are projected element-wise, so
 *  "metrics.status" keeps [{status},…]. A path that names a whole key keeps
 *  that key's full value. */
function projectPaths(value: unknown, paths: string[][]): unknown {
  if (Array.isArray(value)) return value.map((v) => projectPaths(v, paths));
  if (!isRec(value)) return value;
  const byKey = new Map<string, string[][]>();
  for (const p of paths) {
    if (!(p[0] in value)) continue;
    const rest = byKey.get(p[0]) ?? [];
    rest.push(p.slice(1));
    byKey.set(p[0], rest);
  }
  const out: Rec = {};
  for (const [key, rests] of byKey) {
    out[key] = rests.some((r) => r.length === 0) ? value[key] : projectPaths(value[key], rests);
  }
  return out;
}

/** Split a field spec into path segments. A key that literally contains a
 *  dot (rare, but some plugin meta keys do) wins over the nested reading. */
function segmentsOf(item: Rec, field: string): string[] {
  return field in item || !field.includes('.') ? [field] : field.split('.').filter(Boolean);
}

/** First segment of a field spec — what a record must carry at its top
 *  level for the field to apply to it. */
export function rootOf(field: string): string {
  return field.split('.')[0];
}

export function projectItem(item: unknown, fields: string[]): unknown {
  if (!isRec(item)) return item;
  const out = projectPaths(item, fields.map((f) => segmentsOf(item, f))) as Rec;
  // Never lose the identifier even if it wasn't requested.
  if (!('id' in out) && 'id' in item) return { id: item.id, ...out };
  return out;
}

/** Read one field spec ("status", "subscriber.status") from a record.
 *  Undefined when any segment is missing; arrays are not traversed. */
export function valueAt(item: unknown, field: string): unknown {
  if (!isRec(item)) return undefined;
  if (field in item) return item[field];
  let cur: unknown = item;
  for (const seg of field.split('.')) {
    if (!isRec(cur) || !(seg in cur)) return undefined;
    cur = cur[seg];
  }
  return cur;
}

/** Truncate long strings; leave structure intact (fallback when no summary list). */
function prune(item: unknown, depth = 0): unknown {
  if (typeof item === 'string') return item.length > MAX_STRING ? item.slice(0, MAX_STRING) + `… [${item.length} chars]` : item;
  if (Array.isArray(item)) return depth > 3 ? `[${item.length} items]` : item.map((v) => prune(v, depth + 1));
  if (isRec(item)) {
    const out: Rec = {};
    for (const [k, v] of Object.entries(item)) out[k] = prune(v, depth + 1);
    return out;
  }
  return item;
}

/**
 * Shape a successful API response.
 * - `fields` (explicit) wins over summary projection.
 * - summary mode: project each record to `summaryFields` when provided, else
 *   prune (truncate long strings). full mode: passthrough.
 */
export function shapeResponse(
  raw: unknown,
  opts: { detail: 'summary' | 'full'; fields?: string[]; summaryFields?: string[] }
): Shaped {
  const wantProjection = opts.fields?.length ? opts.fields : opts.detail === 'summary' ? opts.summaryFields : undefined;
  const container = locateList(raw);

  if (opts.detail === 'full' && !opts.fields?.length) {
    return { data: raw, pagination: container?.pagination, itemCount: container?.items.length, summarized: false };
  }

  if (container) {
    const items = wantProjection
      ? container.items.map((i) => prune(projectItem(i, wantProjection)))
      : container.items.map((i) => prune(i));
    return {
      data: container.replace(items),
      pagination: container.pagination,
      itemCount: container.items.length,
      summarized: true,
    };
  }

  // Single object (get/create/update responses). Fluent APIs usually wrap the
  // record one level down ({subscriber: {...}}, {order: {...}}) — project the
  // record, not the wrapper, and never project down to an empty object.
  if (wantProjection && isRec(raw)) {
    // Pick the object that best looks like the record: an id wins, then the
    // most projection fields. The top level wins ties, but a wrapper like
    // {status:"success", data:{id,…}} must not be projected down to {status}.
    const score = (rec: Rec) => ('id' in rec ? 1000 : 0) + wantProjection.filter((f) => f in rec || rootOf(f) in rec).length;
    let bestKey: string | undefined;
    let best = score(raw);
    for (const [key, value] of Object.entries(raw)) {
      if (isRec(value) && score(value) > best) {
        best = score(value);
        bestKey = key;
      }
    }
    if (best > 0) {
      return bestKey === undefined
        ? { data: prune(projectItem(raw, wantProjection)), summarized: true }
        : { data: { [bestKey]: prune(projectItem(raw[bestKey], wantProjection)) }, summarized: true };
    }
    // No projection field matches anywhere — pruning beats returning {}.
  }
  return { data: prune(raw), summarized: true };
}

export interface ListContainer {
  items: unknown[];
  replace: (items: unknown[]) => unknown;
  pagination?: Shaped['pagination'];
}

/** Locate the record set in a response: a raw array, a paginator at the
 *  root, or the first paginator/array one level down (Fluent APIs wrap:
 *  {orders: {data: []}}). Undefined for single-record responses. */
export function locateList(raw: unknown): ListContainer | undefined {
  let container: ListContainer | undefined;

  if (Array.isArray(raw)) {
    container = { items: raw, replace: (items) => items };
  } else if (isPaginator(raw)) {
    // Summary mode drops the Laravel paginator boilerplate (links[], page
    // URLs, from/to) — the clean `pagination` field carries the numbers.
    container = { items: raw.data, replace: (items) => ({ data: items }), pagination: paginationOf(raw) };
  } else if (isRec(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      if (isPaginator(value)) {
        container = {
          items: value.data,
          replace: (items) => ({ ...raw, [key]: { data: items } }),
          pagination: paginationOf(value),
        };
        break;
      }
    }
    // A single record (top-level id, or a wrapped record with an id beside
    // the array) is not a list: {order:{…}, activities:[…]} is one order.
    const isSingleRecord = 'id' in raw || Object.values(raw).some((v) => isRec(v) && 'id' in v);
    if (!container && !isSingleRecord) {
      for (const [key, value] of Object.entries(raw)) {
        if (Array.isArray(value) && value.length && isRec(value[0])) {
          container = { items: value, replace: (items) => ({ ...raw, [key]: items }) };
          break;
        }
      }
    }
  }

  return container;
}

/** One-line human text summary for the text content block. */
export function textSummary(label: string, status: number, shaped: Shaped): string {
  let line = `${label} → HTTP ${status}`;
  if (shaped.itemCount !== undefined) {
    line += ` — ${shaped.itemCount} item${shaped.itemCount === 1 ? '' : 's'}`;
    const p = shaped.pagination;
    if (p?.page) line += ` (page ${p.page}${p.total_pages ? `/${p.total_pages}` : ''}${p.total !== undefined ? `, total ${p.total}` : ''})`;
  } else if (isRec(shaped.data)) {
    let d = shaped.data as Rec;
    // Look through a single-key wrapper ({order: {...}}) for the identifiers.
    const keys = Object.keys(d);
    if (keys.length === 1 && isRec(d[keys[0]])) d = d[keys[0]] as Rec;
    const ident = ['id', 'uuid', 'email', 'title', 'name'].filter((k) => k in d).map((k) => `${k}=${String(d[k])}`);
    if (ident.length) line += ` — ${ident.slice(0, 2).join(', ')}`;
  }
  if (shaped.summarized) line += ' [summary — use detail:"full" or fields:[...] for more]';
  return line;
}
