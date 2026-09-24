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

function projectItem(item: unknown, fields: string[]): unknown {
  if (!isRec(item)) return item;
  const out: Rec = {};
  for (const f of fields) if (f in item) out[f] = item[f];
  // Never lose the identifier even if it wasn't requested.
  if (!('id' in out) && 'id' in item) out.id = item.id;
  return out;
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

  // Locate the record set: raw array, paginator at root, or the first
  // paginator/array one level down (Fluent APIs wrap: {orders: {data: []}}).
  let container: { items: unknown[]; replace: (items: unknown[]) => unknown; pagination?: Shaped['pagination'] } | undefined;

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
    const score = (rec: Rec) => ('id' in rec ? 1000 : 0) + wantProjection.filter((f) => f in rec).length;
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
