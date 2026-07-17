#!/usr/bin/env node
/* Render docs/TOOL_MAP.md (the fast map: one line per tool, grouped by area)
   and docs/TOOL_CATALOG.md (area-level overview with examples) from the live
   registry, so neither can drift from the real surface. Also syncs
   manifest.json (version, built-in tool list). Run after `npm run build`:
     node scripts/gen-tool-catalog.mjs */
import fs from 'node:fs';

if (!fs.existsSync('dist/products/index.js')) {
  console.error('dist/ missing — run `npm run build` first.');
  process.exit(1);
}
const { PRODUCTS } = await import('../dist/products/index.js');
const { individualNamesFor } = await import('../dist/core/action-tools.js');
const { placeholdersOf, isListAction } = await import('../dist/core/tool-factory.js');

const SERVER_TOOLS = [
  { name: 'tool_map', params: [], destructive: false, paginated: false, summary: 'The fast map: no args = area overview; {"area": …} or {"search": …} to find the exact tool' },
  { name: 'verify_setup', params: [], destructive: false, paginated: false, summary: 'Check site reachability, per-product credentials, and plugin presence — run this first' },
  { name: 'wp_media_upload_from_url', params: ['source_url'], destructive: false, paginated: false, summary: 'Upload an image into the WordPress media library from a URL (server-side fetch)' },
  { name: 'wp_media_get', params: ['id'], destructive: false, paginated: false, summary: 'Get one media attachment' },
  { name: 'wp_media_list', params: [], destructive: false, paginated: true, summary: 'List or search the media library' },
];

function classify(actions) {
  const defs = Object.values(actions);
  const readOnly = defs.every((d) => d.method === 'GET' || d.method === 'HEAD');
  if (readOnly) return 'read';
  return defs.some((d) => d.destructive) ? 'read/write/delete' : 'read/write';
}

/** One example call per area, using a friendly read tool where possible. */
function exampleFor(spec, names) {
  const entries = Object.entries(spec.actions);
  // Prefer admin-context endpoints — /customer-profile/* and /checkout/* need
  // a customer browser session and would 401 under Application Passwords,
  // which makes for a misleading first example (auth.md documents this).
  const admin = (d) => !/^\/(customer-profile|checkout|user\/login)/.test(d.path);
  const pick =
    entries.find(([a, d]) => a.startsWith('list_') && admin(d)) ??
    entries.find(([, d]) => d.method === 'GET' && admin(d) && !d.path.includes('{')) ??
    entries.find(([, d]) => d.method === 'GET' && admin(d)) ??
    entries.find(([a]) => a.startsWith('list_')) ??
    entries.find(([, d]) => d.method === 'GET') ??
    entries[0];
  const [action, def] = pick;
  const args = {};
  for (const p of placeholdersOf(def.path)) args[p] = 123;
  if (action.startsWith('list_')) args.per_page = 5;
  if (def.destructive) args.confirm = true;
  return JSON.stringify({ name: names[action], arguments: args });
}

const toolLine = (t) =>
  `\`${t.name}${t.params.length ? `(${t.params.join(', ')})` : ''}\`${t.destructive ? ' ⚠' : ''} — ${t.summary}${t.paginated ? ' (paginated)' : ''}`;

const perProduct = PRODUCTS.map((product) => ({
  product,
  areas: product.tools.map((spec) => {
    const names = individualNamesFor(spec);
    return {
      spec,
      names,
      tools: Object.entries(spec.actions).map(([action, def]) => ({
        name: names[action],
        params: placeholdersOf(def.path),
        destructive: def.destructive,
        paginated: isListAction(action) && def.method === 'GET',
        summary: def.summary,
      })),
    };
  }),
}));

const productToolCount = perProduct.reduce((n, p) => n + p.areas.reduce((m, a) => m + a.tools.length, 0), 0);
const totalTools = productToolCount + SERVER_TOOLS.length;
const totalAreas = perProduct.reduce((n, p) => n + p.areas.length, 0) + 1;

/* ---------------------------- docs/TOOL_MAP.md ---------------------------- */

let map = `# Tool map

The fast map of this server: **every tool, one line each, grouped by area** —
${totalTools} tools in ${totalAreas} areas. **Generated** by
\`scripts/gen-tool-catalog.mjs\` from the live registry; regenerate after any
tool-surface change. Sessions get the same map at runtime from the
\`tool_map\` tool (no args = area overview, \`{"area": …}\` /
\`{"search": …}\` to drill down) and a summary in the MCP \`instructions\`.

**How to read a line:** \`name(required_params)\` ⚠ — what it does.
⚠ = hard to undo, requires \`confirm: true\` (without it the tool refuses and
explains). *(paginated)* = takes \`page\`/\`per_page\` (default 20) plus
\`query\` filters. Every tool returns a compact summary by default — pass
\`detail: "full"\` or \`fields: ["…"]\` for complete records. Full endpoint
schemas: [\`docs/api-reference/\`](./api-reference/).

## Areas

| Area | Tools | What it covers |
|------|-------|----------------|
`;
for (const { areas } of perProduct) {
  for (const a of areas) map += `| \`${a.spec.name}\` | ${a.tools.length} | ${a.spec.description} |\n`;
}
map += `| \`server\` | ${SERVER_TOOLS.length} | Built-in tools: this map, setup verification, and the WordPress media library. |\n`;

for (const { product, areas } of perProduct) {
  map += `\n## ${product.title} (\`${product.toolPrefix}_*\`)\n`;
  for (const a of areas) {
    map += `\n### ${a.spec.name} — ${a.spec.description}${a.spec.note ? ` ${a.spec.note}` : ''}\n\n`;
    for (const t of a.tools) map += `- ${toolLine(t)}\n`;
  }
}
map += `\n## Server built-ins\n\n`;
for (const t of SERVER_TOOLS) map += `- ${toolLine(t)}\n`;

fs.writeFileSync('docs/TOOL_MAP.md', map);
console.log(`docs/TOOL_MAP.md written (${totalTools} tools, ${totalAreas} areas).`);

/* -------------------------- docs/TOOL_CATALOG.md -------------------------- */

let out = `# Tool catalog

Area-level view of the tool surface: what each area covers, its
read/write/delete classification, and one example call. **Generated** by
\`scripts/gen-tool-catalog.mjs\` from the live registry — regenerate after any
tool-surface change. The per-tool list (one line per tool) is
[\`docs/TOOL_MAP.md\`](./TOOL_MAP.md); full endpoint schemas live in
[\`docs/api-reference/\`](./api-reference/).

Tools are **individualized**: each does exactly one operation and is named
\`<area>_<operation>\` (e.g. \`crm_contacts_list\`, \`cart_orders_refund\`).
Destructive tools (⚠ in the map) always require \`confirm: true\` — without it
the tool refuses and explains what would happen. Set
\`FLUENT_TOOL_MODE=grouped\` to serve the legacy one-tool-per-area surface
instead (an \`action\` parameter selects the operation).

`;

for (const { product, areas } of perProduct) {
  const endpointCount = areas.reduce((n, a) => n + a.tools.length, 0);
  out += `## ${product.title} (\`${product.toolPrefix}_*\`, ${areas.length} areas, ${endpointCount} tools)\n\n`;
  out += `| Area | Class | Tools | Description |\n|------|-------|-------|-------------|\n`;
  for (const a of areas) {
    out += `| \`${a.spec.name}\` | ${classify(a.spec.actions)} | ${a.tools.length} | ${a.spec.description} |\n`;
  }
  out += `\nExample calls:\n\n`;
  for (const a of areas) {
    out += `- \`${a.spec.name}\`: \`${exampleFor(a.spec, a.names)}\`\n`;
  }
  out += '\n';
}

out += `## Server built-ins (${SERVER_TOOLS.length} tools)

| Tool | Class | Description |
|------|-------|-------------|
| \`tool_map\` | read | The fast map — call it first when unsure which tool to use. |
| \`verify_setup\` | read | Check site reachability, per-product credentials, plugin presence, and run one harmless read per configured product. |
| \`wp_media_upload_from_url\` | write | Upload an image into the WordPress media library from a URL (server-side fetch — ideal for migrating product photos from another platform's CDN). |
| \`wp_media_get\` | read | Get one media attachment by ID. |
| \`wp_media_list\` | read | List or search the media library. |

Examples: \`{"name": "verify_setup", "arguments": {}}\` ·
\`{"name": "tool_map", "arguments": {"search": "refund"}}\` ·
\`{"name": "wp_media_upload_from_url", "arguments": {"source_url": "https://cdn.example.com/photo.jpg", "alt_text": "Product photo"}}\`

**Total: ${totalTools} tools** (\`FLUENT_TOOL_MODE=grouped\` serves ${perProduct.reduce((n, p) => n + p.areas.length, 0) + 3} instead).
`;

fs.writeFileSync('docs/TOOL_CATALOG.md', out);
console.log(`docs/TOOL_CATALOG.md written (${totalAreas} areas).`);

/* ------------------------------ manifest.json ----------------------------- */

// Keep the extension manifest's version in sync with package.json and its
// informational tool list to the always-present built-ins — the ~700
// product tools are generated at runtime per configuration
// (tools_generated: true covers them).
if (fs.existsSync('manifest.json')) {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  manifest.version = pkg.version;
  manifest.tools = SERVER_TOOLS.map((t) => ({ name: t.name, description: t.summary }));
  fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(`manifest.json synced (version ${manifest.version}, ${manifest.tools.length} built-in tools listed).`);
}
