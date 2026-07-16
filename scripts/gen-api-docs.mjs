#!/usr/bin/env node
/* Generate the full FluentCart REST API docs (request + response) from
   FluentCart's per-operation OpenAPI specs.

   Pipeline (all automatic — no hand-maintained list required):
     1. Discover every operation by scraping the rendered docs sidebar at
        https://dev.fluentcart.com/restapi/ for `operations/<group>/<slug>`
        links. New endpoints are picked up automatically; removed ones are
        flagged. scripts/api-operations.txt is kept in sync (it provides the
        preferred ordering and a fallback if discovery ever fails).
     2. Fetch each spec from
        https://dev.fluentcart.com/openapi/public/<group>/<slug>.json
        (the source the docs site itself renders, via its `OAOperation`
        component's `specUrl`).
     3. Write one markdown file per resource group to docs/api/ plus an index.

   See docs/api/MAINTAINING.md for the full method and how it was reverse-
   engineered. Run: node scripts/gen-api-docs.mjs   (network; Node 18+ for fetch) */
const fs = (await import('node:fs')).default;

const HOST = 'https://dev.fluentcart.com';
const BASE = `${HOST}/openapi/public`;
const DISCOVERY_URLS = [`${HOST}/restapi/orders`, `${HOST}/restapi/`];
const OPS_FILE = 'scripts/api-operations.txt';
const OUT_DIR = 'docs/api';
const CONCURRENCY = 12;
const UA = 'Mozilla/5.0 (FluentCart-docs-generator)';
fs.mkdirSync(OUT_DIR, { recursive: true });

// Discover every operation (group/slug) from the rendered docs sidebar.
async function discoverOps() {
  for (const url of DISCOVERY_URLS) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) continue;
      const html = await res.text();
      const set = new Set();
      const re = /operations\/([a-z0-9-]+)\/([a-z0-9-]+)/g;
      let m;
      while ((m = re.exec(html))) set.add(`${m[1]}/${m[2]}`);
      if (set.size > 50) return set;
    } catch { /* try next URL */ }
  }
  return null;
}

async function fetchSpec(op) {
  const url = `${BASE}/${op}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Fetch all specs with a small concurrency pool.
async function fetchAll(opList) {
  const specs = {};
  let i = 0, failed = [];
  async function worker() {
    while (i < opList.length) {
      const op = opList[i++];
      try { specs[op] = await fetchSpec(op); }
      catch (e) { failed.push(`${op}: ${e.message}`); }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (failed.length) console.error('WARNING: failed to fetch:\n' + failed.join('\n'));
  return specs;
}

const GROUPS = [
  ['orders', 'Orders'], ['products', 'Products'], ['customers', 'Customers'],
  ['coupons', 'Coupons'], ['subscriptions', 'Subscriptions'], ['tax', 'Tax'],
  ['shipping', 'Shipping'], ['settings', 'Settings'],
  ['email-notification', 'Email Notifications'], ['reports', 'Reports'],
  ['integration', 'Integrations'], ['files', 'Files'],
  ['labels-attributes', 'Labels & Attributes'], ['dashboard', 'Dashboard & Utilities'],
  ['public-shop', 'Public Shop'], ['checkout', 'Checkout'],
  ['customer-profile', 'Customer Profile'], ['licensing', 'Licensing'],
  ['roles-permissions', 'Roles & Permissions'], ['order-bumps', 'Order Bumps'],
];
const TITLES = Object.fromEntries(GROUPS);

// Resolve the operation list: prefer live discovery, fall back to the
// committed list. Preserve the committed ordering, append newly-found ops,
// flag removals, and keep scripts/api-operations.txt in sync.
const committed = fs.existsSync(OPS_FILE)
  ? fs.readFileSync(OPS_FILE, 'utf8').trim().split('\n').map((s) => s.trim()).filter(Boolean)
  : [];
const live = await discoverOps();
let ops;
if (live) {
  const committedSet = new Set(committed);
  const added = [...live].filter((o) => !committedSet.has(o)).sort();
  const removed = committed.filter((o) => !live.has(o));
  if (added.length) console.log(`Discovered ${added.length} new operation(s):\n  ${added.join('\n  ')}`);
  if (removed.length) console.log(`No longer present (${removed.length}) — dropped:\n  ${removed.join('\n  ')}`);
  const ordered = committed.filter((o) => live.has(o)); // keep curated order, minus removed
  const newByGroup = {};
  for (const o of added) { const g = o.slice(0, o.indexOf('/')); (newByGroup[g] = newByGroup[g] || []).push(o); }
  for (const [g] of GROUPS) if (newByGroup[g]) ordered.push(...newByGroup[g]); // known groups, in order
  for (const g of Object.keys(newByGroup)) if (!TITLES[g]) ordered.push(...newByGroup[g]); // any new group
  ops = [...new Set(ordered)];
  fs.writeFileSync(OPS_FILE, ops.join('\n') + '\n');
} else {
  console.log('Discovery failed; falling back to committed operation list.');
  ops = committed;
}

const SPECS = await fetchAll(ops);
const byGroup = {};
for (const op of ops) {
  const i = op.indexOf('/');
  const g = op.slice(0, i), s = op.slice(i + 1);
  (byGroup[g] = byGroup[g] || []).push(s);
}

const esc = (t) => String(t == null ? '' : t).replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|').trim();

function typeOf(sch) {
  if (!sch) return 'any';
  if (typeof sch === 'string') return sch;
  if (sch.$ref) return sch.$ref.split('/').pop();
  if (sch.enum && !sch.type) return 'enum';
  let t = sch.type || (sch.properties ? 'object' : 'any');
  if (t === 'array') return `array<${sch.items ? typeOf(sch.items) : 'any'}>`;
  return t;
}
function attrs(v) {
  if (!v || typeof v !== 'object') return '';
  const a = [];
  if (v.enum) a.push('enum: ' + v.enum.map((x) => '`' + x + '`').join(', '));
  if (v.format) a.push('format: ' + v.format);
  if (v.minimum != null) a.push('min: ' + v.minimum);
  if (v.maximum != null) a.push('max: ' + v.maximum);
  if (v.maxLength != null) a.push('maxLength: ' + v.maxLength);
  if (v.default != null) a.push('default: `' + v.default + '`');
  return a.length ? ` _(${a.join('; ')})_` : '';
}
function renderSchema(sch, depth, lines) {
  if (!sch || depth > 8) return;
  if (sch.$ref) { lines.push('  '.repeat(depth) + `- _$ref: ${sch.$ref.split('/').pop()}_`); return; }
  const props = sch.properties || (sch.type === 'object' ? {} : null);
  if (props) {
    const req = new Set(sch.required || []);
    const keys = Object.keys(props);
    if (!keys.length) lines.push('  '.repeat(depth) + '- _(object)_');
    for (const k of keys) {
      const v = props[k] || {};
      lines.push('  '.repeat(depth) + `- \`${k}\` (${typeOf(v)})${req.has(k) ? ' **required**' : ''}${attrs(v)}${v.description ? ' — ' + esc(v.description) : ''}`);
      if (v.properties || v.type === 'object') renderSchema(v, depth + 1, lines);
      else if (v.type === 'array' && v.items && (v.items.properties || v.items.type === 'object')) renderSchema(v.items, depth + 1, lines);
    }
  } else if (sch.type === 'array' && sch.items) {
    lines.push('  '.repeat(depth) + `- array of ${typeOf(sch.items)}${sch.items.description ? ' — ' + esc(sch.items.description) : ''}`);
    if (sch.items.properties || sch.items.type === 'object') renderSchema(sch.items, depth + 1, lines);
  } else if (sch.description) {
    lines.push('  '.repeat(depth) + `- ${esc(sch.description)}`);
  }
}
function paramTable(params, where) {
  const rows = params.filter((p) => p.in === where);
  if (!rows.length) return '';
  let out = `**${where === 'path' ? 'Path' : 'Query'} parameters**\n\n`;
  out += '| Name | Type | Required | Description |\n|------|------|----------|-------------|\n';
  for (const p of rows) {
    out += `| \`${p.name}\` | ${typeOf(p.schema)} | ${p.required ? 'yes' : 'no'} | ${esc(p.description) || (p.schema && typeof p.schema === 'object' ? attrs(p.schema).replace(/[_()]/g, '').trim() : '')} |\n`;
  }
  return out + '\n';
}
function pickExample(media) {
  if (!media) return undefined;
  if (media.examples && media.examples.default && 'value' in media.examples.default) return media.examples.default.value;
  if (media.example !== undefined) return media.example;
  if (media.schema && media.schema.example !== undefined) return media.schema.example;
  if (media.examples) { const k = Object.keys(media.examples)[0]; if (k && media.examples[k] && 'value' in media.examples[k]) return media.examples[k].value; }
  return undefined;
}
function jsonBlock(v) { return '```json\n' + JSON.stringify(v, null, 2) + '\n```\n\n'; }

function renderOp(spec) {
  const pths = spec.paths || {};
  const pathKey = Object.keys(pths)[0];
  if (!pathKey) return null;
  const methods = pths[pathKey];
  const method = Object.keys(methods)[0];
  const op = methods[method];
  const out = [];
  out.push(`## ${method.toUpperCase()} \`${pathKey}\``);
  out.push('');
  if (op.summary) out.push(`**${esc(op.summary)}**`); out.push('');
  if (op.description) { out.push(op.description.trim()); out.push(''); }
  // auth
  const sec = op.security || spec.security || [];
  const secNames = [...new Set(sec.flatMap((s) => Object.keys(s)))];
  out.push(`**Auth:** ${secNames.length ? secNames.join(', ') : 'None (public)'}`);
  out.push('');
  const params = op.parameters || [];
  const pt = paramTable(params, 'path'); if (pt) out.push(pt);
  const qt = paramTable(params, 'query'); if (qt) out.push(qt);
  // request body
  if (op.requestBody && op.requestBody.content) {
    for (const [ct, media] of Object.entries(op.requestBody.content)) {
      out.push(`**Request body** (\`${ct}\`${op.requestBody.required ? ', required' : ''})`);
      out.push('');
      const lines = [];
      renderSchema(media.schema, 0, lines);
      if (lines.length) { out.push(lines.join('\n')); out.push(''); }
      const ex = pickExample(media);
      if (ex !== undefined) { out.push('Example:'); out.push(''); out.push(jsonBlock(ex)); }
    }
  }
  // responses
  if (op.responses) {
    out.push('**Responses**');
    out.push('');
    for (const code of Object.keys(op.responses)) {
      const r = op.responses[code] || {};
      out.push(`- **${code}** — ${esc(r.description) || ''}`);
      if (r.content) {
        for (const [ct, media] of Object.entries(r.content)) {
          const lines = [];
          renderSchema(media.schema, 1, lines);
          if (lines.length) { out.push(''); out.push(`  Schema (\`${ct}\`):`); out.push(''); out.push(lines.join('\n')); }
          const ex = pickExample(media);
          if (ex !== undefined) { out.push(''); out.push('  Example:'); out.push(''); out.push(jsonBlock(ex)); }
        }
      }
    }
    out.push('');
  }
  out.push('---');
  out.push('');
  return { method: method.toUpperCase(), path: pathKey, summary: op.summary || '', md: out.join('\n') };
}

let grandTotal = 0;
const indexRows = [];
let server = '';
for (const [g, slugs] of Object.entries(byGroup)) {
  const title = TITLES[g] || g;
  const parts = [];
  let count = 0;
  for (const slug of slugs) {
    const spec = SPECS[`${g}/${slug}`];
    if (!spec) { console.error('MISSING', `${g}/${slug}`); continue; }
    if (!server && spec.servers && spec.servers[0]) server = spec.servers[0].url;
    const r = renderOp(spec);
    if (r) { parts.push(r.md); count++; }
  }
  grandTotal += count;
  const header = `# FluentCart API — ${title}\n\n` +
    `${count} endpoint${count === 1 ? '' : 's'}. Base URL: \`${server}\`. ` +
    `See the [API index](./README.md) for auth and the full group list.\n\n` +
    `_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._\n\n---\n\n`;
  fs.writeFileSync(`${OUT_DIR}/${g}.md`, header + parts.join('\n'));
  indexRows.push([title, count, `${g}.md`]);
}

// index
let idx = `# FluentCart REST API — Full Reference\n\n`;
idx += `Complete per-endpoint reference (request parameters, request body schemas, ` +
  `responses, and examples) generated from FluentCart's OpenAPI specs at ` +
  `<https://dev.fluentcart.com/>.\n\n`;
idx += `**Base URL:** \`${server}\` (namespace \`fluent-cart/v2\`)\n\n`;
idx += `**Total endpoints:** ${grandTotal}\n\n`;
idx += `## Authentication\n\n` +
  `| Context | Used by | Auth |\n|---------|---------|------|\n` +
  `| Admin | most endpoints | WordPress Application Passwords (HTTP Basic \`username:application_password\`) |\n` +
  `| Customer Portal | \`/customer-profile/*\`, \`/checkout/*\`, \`/user/login\` | WordPress cookie + nonce |\n` +
  `| Public | \`/public/*\` and license query endpoints | None |\n\n`;
idx += `> For a compact one-line-per-endpoint overview, see ` +
  `[\`../fluentcart-api-reference.md\`](../fluentcart-api-reference.md#rest-api).\n\n`;
idx += `## Resource groups\n\n| Group | Endpoints | Docs |\n|-------|-----------|------|\n`;
for (const [t, c, f] of indexRows) idx += `| ${t} | ${c} | [${f}](./${f}) |\n`;
idx += `\n> These files are generated. To refresh, run \`node scripts/gen-api-docs.mjs\` — ` +
  `see [MAINTAINING.md](./MAINTAINING.md) for how it works.\n`;
idx += `\n_Generated by \`scripts/gen-api-docs.mjs\` from the per-operation OpenAPI specs._\n`;
fs.writeFileSync(`${OUT_DIR}/README.md`, idx);

console.log('Generated', grandTotal, 'endpoints across', indexRows.length, 'groups into', OUT_DIR);
