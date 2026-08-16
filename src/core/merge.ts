/** Merge-mode writes. Update endpoints in the Fluent plugins behave as full
 *  replaces: fields omitted from the body are cleared, not preserved — and the
 *  API reports 200 either way. This module makes partial updates safe:
 *  deep-merge the supplied body onto the current record (read via the paired
 *  GET on the same path), diff the record before/after the write, and surface
 *  every change — intended or not — back to the caller. */

import type { EndpointDef, ToolSpec } from './types.js';

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v);

/** Paths that churn on every write — reported in `changed`, never warned about. */
const VOLATILE_PATH = /(^|\.)(updated_at|created_at)$/;

/** Cap diff values so a full email body doesn't flood the response. */
const MAX_DIFF_VALUE = 160;

/** Recursive merge: `patch` wins; plain objects merge key-by-key; arrays,
 *  scalars and null replace wholesale (null is an explicit "clear this"). */
export function deepMerge(base: unknown, patch: unknown): unknown {
  if (!isRec(base) || !isRec(patch)) return patch;
  const out: Rec = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = k in base ? deepMerge(base[k], v) : v;
  }
  return out;
}

/** Dotted leaf paths of a value (arrays and scalars are leaves). */
export function leafPaths(value: unknown, prefix = ''): string[] {
  if (!isRec(value)) return prefix ? [prefix] : [];
  const keys = Object.keys(value);
  if (!keys.length) return prefix ? [prefix] : [];
  return keys.flatMap((k) => leafPaths(value[k], prefix ? `${prefix}.${k}` : k));
}

export function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split('.')) {
    if (!isRec(cur)) return undefined;
    cur = cur[part];
  }
  return cur;
}

/** Loose equality across the API's habit of returning numbers as strings. */
function looseEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a === 'object' || typeof b === 'object') return JSON.stringify(a) === JSON.stringify(b);
  return String(a) === String(b);
}

function display(v: unknown): unknown {
  if (typeof v === 'string') return v.length > MAX_DIFF_VALUE ? v.slice(0, MAX_DIFF_VALUE) + `… [${v.length} chars]` : v;
  if (v !== null && typeof v === 'object') {
    const json = JSON.stringify(v);
    return json.length > MAX_DIFF_VALUE ? json.slice(0, MAX_DIFF_VALUE) + `… [${json.length} chars]` : v;
  }
  return v;
}

export type Diff = Record<string, { from: unknown; to: unknown }>;

/** Leaf-level diff of two records (dotted paths, values truncated for display). */
export function diffRecords(before: unknown, after: unknown): Diff {
  const out: Diff = {};
  walk(before, after, '');
  return out;

  function walk(a: unknown, b: unknown, prefix: string) {
    if (isRec(a) && isRec(b)) {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
        walk(a[k], b[k], prefix ? `${prefix}.${k}` : k);
      }
      return;
    }
    if (!looseEqual(a, b)) out[prefix || '(root)'] = { from: display(a), to: display(b) };
  }
}

/** How the supplied body relates to the paired GET's response shape. */
export type MergeStrategy =
  | 'record' //   GET returns the record itself; body = deepMerge(record, supplied)
  | 'wrapped' //  both nest under wrapper keys ({email:{...}}); merge per supplied key
  | 'unwrapped' //flat body vs wrapped GET ({sequence:{...}}); body = deepMerge(inner, supplied)
  | 'none'; //    shapes don't line up — body sent as supplied (verification still runs)

export interface MergedBody {
  body: Rec;
  strategy: MergeStrategy;
  /** The pre-write state in body shape, for dry-run diffs. */
  base?: Rec;
  /** Maps a supplied-body path to the same field's path in the GET response. */
  toRecordPath: (suppliedPath: string) => string;
}

/** Hydrate a partial body from the current record (the paired GET's raw
 *  response). Never invents shape: when the supplied body doesn't line up
 *  with the record, it is passed through untouched (strategy "none"). */
export function buildMergedBody(baseRaw: unknown, supplied: Rec): MergedBody {
  const identity = (p: string) => p;
  if (!isRec(baseRaw)) return { body: supplied, strategy: 'none', toRecordPath: identity };

  // GET returned the record itself (has an id at the top level).
  if ('id' in baseRaw) {
    return { body: deepMerge(baseRaw, supplied) as Rec, strategy: 'record', base: baseRaw, toRecordPath: identity };
  }

  // Wrapper-shaped GET ({email: {...}}) with a matching wrapped body.
  const suppliedKeys = Object.keys(supplied);
  if (suppliedKeys.some((k) => isRec(supplied[k]) && isRec(baseRaw[k]))) {
    const body: Rec = {};
    const base: Rec = {};
    for (const k of suppliedKeys) {
      body[k] = isRec(supplied[k]) && isRec(baseRaw[k]) ? deepMerge(baseRaw[k], supplied[k]) : supplied[k];
      if (k in baseRaw) base[k] = baseRaw[k];
    }
    return { body, strategy: 'wrapped', base, toRecordPath: identity };
  }

  // Flat body against a wrapper-shaped GET: find the inner record that
  // carries the supplied fields and hydrate from it.
  for (const [wrapper, inner] of Object.entries(baseRaw)) {
    if (isRec(inner) && suppliedKeys.some((k) => k in inner)) {
      return {
        body: deepMerge(inner, supplied) as Rec,
        strategy: 'unwrapped',
        base: inner,
        toRecordPath: (p) => `${wrapper}.${p}`,
      };
    }
  }
  return { body: supplied, strategy: 'none', toRecordPath: identity };
}

export interface Verification {
  changed: Diff;
  warnings: string[];
  /** True when the endpoint provably ignored the entire body (see #4). */
  rejected: boolean;
}

/** Compare the record before and after a write against what the caller asked
 *  for. `suppliedBody` is the caller's original partial body (not the merged
 *  one) — anything that changed outside it gets a warning, as does any
 *  supplied field whose final value isn't what was sent. */
export function verifyWrite(
  beforeRaw: unknown,
  afterRaw: unknown,
  suppliedBody: Rec,
  toRecordPath: (p: string) => string
): Verification {
  const changed = diffRecords(beforeRaw, afterRaw);
  const warnings: string[] = [];

  const suppliedLeaves = leafPaths(suppliedBody).map((p) => ({ supplied: p, record: toRecordPath(p) }));
  const suppliedRecordPaths = suppliedLeaves.map((l) => l.record);

  for (const [path, delta] of Object.entries(changed)) {
    if (VOLATILE_PATH.test(path)) continue;
    const intended = suppliedRecordPaths.some((s) => path === s || path.startsWith(`${s}.`) || s.startsWith(`${path}.`));
    if (!intended) {
      warnings.push(
        `${path}: ${JSON.stringify(delta.from)} -> ${JSON.stringify(delta.to)} (field was not in your request body)`
      );
    }
  }

  let verifiable = 0;
  let landed = 0;
  for (const { supplied, record } of suppliedLeaves) {
    const want = getPath(suppliedBody, supplied);
    const got = getPath(afterRaw, record);
    if (got === undefined && !(isRec(afterRaw) && record.split('.')[0] in afterRaw)) continue; // not echoed by the API — unverifiable
    verifiable++;
    if (looseEqual(want, got)) {
      landed++;
    } else {
      warnings.push(`${record}: you sent ${JSON.stringify(display(want))} but the record now has ${JSON.stringify(display(got))}`);
    }
  }

  const rejected = verifiable > 0 && landed === 0 && Object.keys(changed).length === 0;
  return { changed, warnings, rejected };
}

/** Memoized paired-GET lookup: a PUT/PATCH action merges/verifies against the
 *  GET action registered on the identical path in the same spec. */
const PAIR_CACHE = new WeakMap<ToolSpec, Map<string, EndpointDef | undefined>>();

export function pairedReadFor(spec: ToolSpec, action: string): EndpointDef | undefined {
  let perSpec = PAIR_CACHE.get(spec);
  if (perSpec?.has(action)) return perSpec.get(action);
  const def = spec.actions[action];
  let found: EndpointDef | undefined;
  if (def && (def.method === 'PUT' || def.method === 'PATCH')) {
    found = Object.values(spec.actions).find((d) => d.method === 'GET' && d.path === def.path && !d.destructive);
  }
  if (!perSpec) {
    perSpec = new Map();
    PAIR_CACHE.set(spec, perSpec);
  }
  perSpec.set(action, found);
  return found;
}

/** Locate the record's updated_at for the if_unmodified_since precondition —
 *  top level first, then one wrapper level down. */
export function recordUpdatedAt(raw: unknown): string | undefined {
  if (!isRec(raw)) return undefined;
  if (typeof raw.updated_at === 'string') return raw.updated_at;
  for (const v of Object.values(raw)) {
    if (isRec(v) && typeof v.updated_at === 'string') return v.updated_at;
  }
  return undefined;
}
