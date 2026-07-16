#!/usr/bin/env node
/* Generate full REST API references for Fluent products (FluentCRM,
   FluentCart, …) from each product's per-operation OpenAPI specs.

   Both docs sites run the same VitePress + OpenAPI infrastructure, so one
   pipeline covers every product (all automatic — no hand-maintained list):
     1. Discover every operation by scraping the rendered docs sidebar for
        `operations/<group>/<slug>` links. New endpoints are picked up
        automatically; removed ones are flagged. scripts/<product>-operations.txt
        is kept in sync (preferred ordering + fallback if discovery fails).
     2. Fetch each spec from <host><specBase>/<group>/<slug>.json (the exact
        source the docs site itself renders via its OAOperation component).
     3. Write, per product:
          docs/api-reference/<product>/<group>.md   full per-endpoint docs
          docs/api-reference/<product>/endpoints.json  machine-readable inventory
          docs/api-reference/<product>.md           overview: auth + one table per group

   See docs/api-reference/MAINTAINING.md for the method and how it was
   reverse-engineered.

   Run: node scripts/gen-api-docs.mjs [fluentcrm|fluentcart ...]
   (no args = all products; network required; Node 18+ for fetch) */
const fs = (await import('node:fs')).default;

const CONCURRENCY = 12;
const UA = 'Mozilla/5.0 (fluentMCP-docs-generator)';

const PRODUCTS = {
  fluentcart: {
    title: 'FluentCart',
    host: 'https://dev.fluentcart.com',
    specBase: '/openapi/public',
    discoveryUrls: ['https://dev.fluentcart.com/restapi/orders', 'https://dev.fluentcart.com/restapi/'],
    docsUrl: 'https://dev.fluentcart.com/restapi/',
    namespace: 'fluent-cart/v2',
    opsFile: 'scripts/fluentcart-operations.txt',
    outDir: 'docs/api-reference/fluentcart',
    overviewFile: 'docs/api-reference/fluentcart.md',
    authNote: [
      '| Context | Used by | Auth |',
      '|---------|---------|------|',
      '| Admin | most endpoints | WordPress Application Passwords (HTTP Basic `username:application_password`) |',
      '| Customer Portal | `/customer-profile/*`, `/checkout/*`, `/user/login` | WordPress cookie + nonce (browser session — not usable with Application Passwords) |',
      '| Public | `/public/*` and license query endpoints | None |',
    ].join('\n'),
    groups: [
      ['orders', 'Orders'], ['products', 'Products'], ['customers', 'Customers'],
      ['coupons', 'Coupons'], ['subscriptions', 'Subscriptions'], ['tax', 'Tax'],
      ['shipping', 'Shipping'], ['settings', 'Settings'],
      ['email-notification', 'Email Notifications'], ['reports', 'Reports'],
      ['integration', 'Integrations'], ['files', 'Files'],
      ['labels-attributes', 'Labels & Attributes'], ['dashboard', 'Dashboard & Utilities'],
      ['public-shop', 'Public Shop'], ['checkout', 'Checkout'],
      ['customer-profile', 'Customer Profile'], ['licensing', 'Licensing (Pro)'],
      ['roles-permissions', 'Roles & Permissions (Pro)'], ['order-bumps', 'Order Bumps (Pro)'],
    ],
  },
  fluentcrm: {
    title: 'FluentCRM',
    host: 'https://developers.fluentcrm.com',
    specBase: '/openapi',
    discoveryUrls: ['https://developers.fluentcrm.com/rest-api/'],
    docsUrl: 'https://developers.fluentcrm.com/rest-api/',
    namespace: 'fluent-crm/v2',
    opsFile: 'scripts/fluentcrm-operations.txt',
    outDir: 'docs/api-reference/fluentcrm',
    overviewFile: 'docs/api-reference/fluentcrm.md',
    authNote: [
      '| Context | Used by | Auth |',
      '|---------|---------|------|',
      '| Admin | all endpoints except public bounce handlers | WordPress Application Passwords (HTTP Basic) — WP Admin → Users → Profile → Application Passwords. (Older FluentCRM versions offered a Settings → Rest API key page; it was removed as redundant with WP core Application Passwords.) |',
      '| Public | `public-bounce` handlers | Security key in URL (none/webhook-style) |',
    ].join('\n'),
    groups: [
      ['contacts', 'Contacts (Subscribers)'], ['lists', 'Lists'], ['tags', 'Tags'],
      ['dynamic-segments', 'Dynamic Segments'], ['custom-fields', 'Custom Fields'],
      ['companies', 'Companies'], ['campaigns', 'Campaigns'],
      ['campaigns-pro', 'Campaign Actions (Pro)'], ['recurring-campaigns', 'Recurring Campaigns (Pro)'],
      ['sequences', 'Email Sequences (Pro)'], ['funnels', 'Automations (Funnels)'],
      ['templates', 'Email Templates'], ['forms', 'Forms'],
      ['webhooks', 'Incoming Webhooks'], ['smart-links', 'Smart Links (Pro)'],
      ['sms', 'SMS (Pro)'], ['abandon-carts', 'Abandoned Carts (Pro)'],
      ['commerce-reports', 'Commerce Reports (Pro)'], ['reports', 'Reports'],
      ['import', 'Contact Import'], ['migrators', 'Migrators'],
      ['users', 'WordPress Users'], ['labels', 'Labels'], ['docs', 'Docs & Addons'],
      ['global-search', 'Global Search'], ['settings', 'Settings'],
      ['pro-settings', 'Pro Settings'], ['public-bounce', 'Public Bounce Handlers'],
    ],
  },
};

// ---------------------------------------------------------------- discovery

async function discoverOps(product) {
  for (const url of product.discoveryUrls) {
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

async function fetchSpec(product, op) {
  const url = `${product.host}${product.specBase}/${op}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchAll(product, opList) {
  const specs = {};
  let i = 0, failed = [];
  async function worker() {
    while (i < opList.length) {
      const op = opList[i++];
      try { specs[op] = await fetchSpec(product, op); }
      catch (e) { failed.push(`${op}: ${e.message}`); }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (failed.length) console.error('WARNING: failed to fetch:\n' + failed.join('\n'));
  return specs;
}

// Resolve the operation list: prefer live discovery, fall back to the
// committed list. Preserve committed ordering, append newly-found ops,
// flag removals, keep the ops file in sync.
function reconcileOps(product, live) {
  const committed = fs.existsSync(product.opsFile)
    ? fs.readFileSync(product.opsFile, 'utf8').trim().split('\n').map((s) => s.trim()).filter(Boolean)
    : [];
  if (!live) {
    console.log(`[${product.title}] Discovery failed; falling back to committed operation list.`);
    return committed;
  }
  const titles = Object.fromEntries(product.groups);
  const committedSet = new Set(committed);
  const added = [...live].filter((o) => !committedSet.has(o)).sort();
  const removed = committed.filter((o) => !live.has(o));
  if (added.length) console.log(`[${product.title}] ${added.length} new operation(s):\n  ${added.join('\n  ')}`);
  if (removed.length) console.log(`[${product.title}] no longer present (${removed.length}) — dropped:\n  ${removed.join('\n  ')}`);
  const ordered = committed.filter((o) => live.has(o));
  const newByGroup = {};
  for (const o of added) { const g = o.slice(0, o.indexOf('/')); (newByGroup[g] = newByGroup[g] || []).push(o); }
  for (const [g] of product.groups) if (newByGroup[g]) ordered.push(...newByGroup[g]);
  for (const g of Object.keys(newByGroup)) if (!titles[g]) ordered.push(...newByGroup[g]);
  const ops = [...new Set(ordered)];
  fs.writeFileSync(product.opsFile, ops.join('\n') + '\n');
  return ops;
}

// ---------------------------------------------------------------- rendering

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
  const sec = op.security || spec.security || [];
  const secNames = [...new Set(sec.flatMap((s) => Object.keys(s)))];
  out.push(`**Auth:** ${secNames.length ? secNames.join(', ') : 'None (public)'}`);
  out.push('');
  const params = op.parameters || [];
  const pt = paramTable(params, 'path'); if (pt) out.push(pt);
  const qt = paramTable(params, 'query'); if (qt) out.push(qt);
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
  return {
    method: method.toUpperCase(),
    path: pathKey,
    summary: op.summary || '',
    operationId: op.operationId || '',
    security: secNames,
    deprecated: !!op.deprecated,
    md: out.join('\n'),
  };
}

// ---------------------------------------------------------------- per product

async function generate(productKey) {
  const product = PRODUCTS[productKey];
  fs.mkdirSync(product.outDir, { recursive: true });

  const live = await discoverOps(product);
  const ops = reconcileOps(product, live);
  if (!ops.length) {
    console.error(`[${product.title}] no operations known — aborting this product.`);
    return;
  }
  const specs = await fetchAll(product, ops);

  const titles = Object.fromEntries(product.groups);
  const byGroup = {};
  for (const op of ops) {
    const i = op.indexOf('/');
    const g = op.slice(0, i), s = op.slice(i + 1);
    (byGroup[g] = byGroup[g] || []).push(s);
  }

  const today = new Date().toISOString().slice(0, 10);
  let server = '';
  let grandTotal = 0;
  const indexRows = [];
  const inventory = [];
  const overviewSections = [];

  for (const [g, slugs] of Object.entries(byGroup)) {
    const title = titles[g] || g;
    const parts = [];
    const rows = [];
    let count = 0;
    for (const slug of slugs) {
      const spec = specs[`${g}/${slug}`];
      if (!spec) { console.error('MISSING', `${g}/${slug}`); continue; }
      if (!server && spec.servers && spec.servers[0]) server = spec.servers[0].url;
      const r = renderOp(spec);
      if (!r) continue;
      parts.push(r.md);
      count++;
      rows.push(`| ${r.method} | \`${r.path}\` | ${esc(r.summary)}${r.deprecated ? ' _(deprecated)_' : ''} |`);
      inventory.push({
        group: g, slug, operationId: r.operationId, method: r.method,
        path: r.path, summary: r.summary, security: r.security, deprecated: r.deprecated,
      });
    }
    grandTotal += count;
    const header = `# ${product.title} API — ${title}\n\n` +
      `${count} endpoint${count === 1 ? '' : 's'}. Base URL: \`${server}\`. ` +
      `See the [${product.title} overview](../${productKey}.md) for auth and the full group list.\n\n` +
      `_Generated from the ${product.title} OpenAPI specs (${product.host.replace('https://', '')})._\n\n---\n\n`;
    fs.writeFileSync(`${product.outDir}/${g}.md`, header + parts.join('\n'));
    indexRows.push([title, count, `${g}.md`]);
    overviewSections.push(
      `### ${title}\n\nFull schemas: [\`${productKey}/${g}.md\`](./${productKey}/${g}.md)\n\n` +
      `| Method | Path | Summary |\n|--------|------|---------|\n${rows.join('\n')}\n`
    );
  }

  // machine-readable inventory (drives the tool-coverage test)
  fs.writeFileSync(
    `${product.outDir}/endpoints.json`,
    JSON.stringify({ product: productKey, source: product.docsUrl, scraped: today, baseUrl: server, namespace: product.namespace, count: grandTotal, endpoints: inventory }, null, 2) + '\n'
  );

  // overview file: one table per group
  let ov = `# ${product.title} REST API — Reference\n\n`;
  ov += `> **Source:** <${product.docsUrl}> · **Scraped:** ${today} · **Endpoints:** ${grandTotal} across ${indexRows.length} groups\n`;
  ov += `> Regenerate with \`node scripts/gen-api-docs.mjs ${productKey}\` — see [MAINTAINING.md](./MAINTAINING.md).\n\n`;
  ov += `**Base URL:** \`${server}\` (namespace \`${product.namespace}\`)\n\n`;
  ov += `## Authentication\n\n${product.authNote}\n\n`;
  ov += `Credential setup for all products: [auth.md](./auth.md).\n\n`;
  ov += `## Groups\n\n| Group | Endpoints | Full schemas |\n|-------|-----------|------|\n`;
  for (const [t, c, f] of indexRows) ov += `| ${t} | ${c} | [${f}](./${productKey}/${f}) |\n`;
  ov += `\n## Endpoints by group\n\n${overviewSections.join('\n')}\n`;
  ov += `_Generated by \`scripts/gen-api-docs.mjs\` from the per-operation OpenAPI specs; endpoints marked (Pro) require the product's Pro version._\n`;
  fs.writeFileSync(product.overviewFile, ov);

  // Remove docs for groups that no longer exist upstream. endpoints.json and
  // group files are the only things living in outDir.
  const keep = new Set(Object.keys(byGroup).map((g) => `${g}.md`));
  for (const f of fs.readdirSync(product.outDir)) {
    if (f.endsWith('.md') && !keep.has(f)) {
      fs.unlinkSync(`${product.outDir}/${f}`);
      console.log(`[${product.title}] removed stale group doc:`, f);
    }
  }

  console.log(`[${product.title}] generated ${grandTotal} endpoints across ${indexRows.length} groups into ${product.outDir}`);
}

const requested = process.argv.slice(2);
const keys = requested.length ? requested : Object.keys(PRODUCTS);
for (const key of keys) {
  if (!PRODUCTS[key]) { console.error(`Unknown product '${key}'. Known: ${Object.keys(PRODUCTS).join(', ')}`); process.exit(1); }
}
for (const key of keys) await generate(key);
