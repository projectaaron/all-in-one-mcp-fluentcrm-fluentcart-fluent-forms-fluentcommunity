/** Path-parameter safety. Tool calls fill `{placeholder}` segments of an
 *  endpoint template with caller-supplied values, and the admin lock and the
 *  destructive confirm gate are keyed on the TOOL that was called. So a value
 *  must never be able to steer the request to a different endpoint:
 *
 *  - `.` / `..` survive encodeURIComponent and are then collapsed by URL
 *    parsing (`/sequences/../subscribers` → `/subscribers`), which let an
 *    unlocked tool reach the locked audience-wide contact delete.
 *  - A value equal to a sibling route's literal segment (`order_id:
 *    "do-bulk-action"` → `POST /orders/do-bulk-action`) reaches that sibling's
 *    endpoint without its confirm gate.
 *  - WordPress honours `?_method=DELETE` as an HTTP method override, so a
 *    caller-supplied query key could turn a harmless POST into a DELETE.
 *
 *  Every check here refuses rather than rewrites, so the caller sees why. */

const PLACEHOLDER_SEGMENT = /^\{([^}]+)\}$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/** Why a path-parameter value is unsafe, or undefined when it is fine.
 *  Dots inside a value (`jane.doe`, `v1.2`) are fine — only whole-segment
 *  `.` / `..` are special to URL parsing. */
export function unsafePathValue(value: unknown): string | undefined {
  const raw = String(value);
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* not percent-encoded — check the raw value only */
  }
  for (const v of [raw, decoded]) {
    if (v === '.' || v === '..') return 'a "." or ".." segment would redirect the request to a different endpoint';
    if (/[\\/]/.test(v)) return 'it contains a slash, which would change the endpoint path';
    if (CONTROL_CHARS.test(v)) return 'it contains control characters';
  }
  return undefined;
}

/** A route another tool of the same product serves, for collision checks. */
export interface RouteRef {
  method: string;
  path: string;
  siteRoot?: boolean;
  /** The individual tool name that serves this route (for the error text). */
  tool?: string;
}

/** Return the sibling route this concrete call would actually hit, when one
 *  of the caller's values equals another route's literal segment at the same
 *  position. Only same-method routes count: WordPress picks the first route
 *  whose pattern AND method match, so a same-shape route with a different
 *  method can't capture the request. Two templates that are both parametric
 *  at the same positions don't collide (no literal-vs-value overlap). */
export function siblingRouteFor(
  own: { method: string; path: string; siteRoot?: boolean },
  concretePath: string,
  routes: readonly RouteRef[]
): RouteRef | undefined {
  const mine = own.path.split('/');
  const concrete = concretePath.split('/');
  if (mine.length !== concrete.length) return undefined;
  for (const route of routes) {
    if (route.method !== own.method || !!route.siteRoot !== !!own.siteRoot || route.path === own.path) continue;
    const other = route.path.split('/');
    if (other.length !== mine.length) continue;
    let matches = true;
    let valueHitsLiteral = false;
    for (let i = 0; i < other.length; i++) {
      const otherIsParam = PLACEHOLDER_SEGMENT.test(other[i]);
      if (!otherIsParam && other[i] !== concrete[i]) {
        matches = false;
        break;
      }
      if (!otherIsParam && PLACEHOLDER_SEGMENT.test(mine[i])) valueHitsLiteral = true;
    }
    if (matches && valueHitsLiteral) return route;
  }
  return undefined;
}

/** The query key that would override the HTTP method, if any. PHP turns
 *  spaces and dots in parameter names into underscores (`.method` arrives
 *  as `_method`) and treats `_method[]` as the same variable, so the check
 *  normalizes the same way and ignores case to stay conservative. */
export function methodOverrideKey(query: Record<string, unknown> | undefined): string | undefined {
  if (!query) return undefined;
  for (const key of Object.keys(query)) {
    const base = key.split('[')[0].replace(/[ .]/g, '_').toLowerCase();
    if (base === '_method') return key;
  }
  return undefined;
}

export const METHOD_OVERRIDE_REFUSAL =
  'the "_method" query parameter is not allowed — WordPress treats it as an HTTP method override, which would bypass this tool\'s safety gates';
