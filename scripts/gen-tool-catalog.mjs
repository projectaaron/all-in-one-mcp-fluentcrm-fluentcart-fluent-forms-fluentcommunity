#!/usr/bin/env node
/* Render docs/TOOL_CATALOG.md from the live tool registry so the catalog can
   never drift from the real surface. Run after `npm run build`:
     node scripts/gen-tool-catalog.mjs */
import fs from 'node:fs';

if (!fs.existsSync('dist/products/index.js')) {
  console.error('dist/ missing — run `npm run build` first.');
  process.exit(1);
}
const { PRODUCTS } = await import('../dist/products/index.js');

function classify(actions) {
  const defs = Object.values(actions);
  const readOnly = defs.every((d) => d.method === 'GET' || d.method === 'HEAD');
  if (readOnly) return 'read';
  return defs.some((d) => d.destructive) ? 'read/write/delete' : 'read/write';
}

function exampleFor(name, actions) {
  const entries = Object.entries(actions);
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
  const args = { action };
  const params = [...def.path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  if (params.length) args.id = 123;
  for (const p of params.slice(1)) (args.path_params ??= {})[p] = 456;
  if (action.startsWith('list_')) args.per_page = 5;
  if (def.destructive) args.confirm = true;
  return JSON.stringify({ name, arguments: args });
}

let out = `# Tool catalog

Every tool this server exposes: name, what it does, read/write/delete
classification, action count, and one example call. **Generated** by
\`scripts/gen-tool-catalog.mjs\` from the live registry — regenerate after any
tool-surface change. Action-level signatures live in each tool's \`action\`
parameter description; full endpoint schemas live in
[\`docs/api-reference/\`](./api-reference/).

Destructive actions (marked ⚠ in the tool's action list) always require
\`confirm: true\` — without it the tool refuses and explains what would happen.

`;

let total = 1;
for (const product of PRODUCTS) {
  const tools = product.tools;
  total += tools.length;
  out += `## ${product.title} (\`${product.toolPrefix}_*\`, ${tools.length} tools, ${tools.reduce((n, t) => n + Object.keys(t.actions).length, 0)} endpoints)\n\n`;
  out += `| Tool | Class | Actions | Description |\n|------|-------|---------|-------------|\n`;
  for (const t of tools) {
    out += `| \`${t.name}\` | ${classify(t.actions)} | ${Object.keys(t.actions).length} | ${t.description} |\n`;
  }
  out += `\nExample calls:\n\n`;
  for (const t of tools) {
    out += `- \`${t.name}\`: \`${exampleFor(t.name, t.actions)}\`\n`;
  }
  out += '\n';
}

out += `## Server (1 tool)

| Tool | Class | Description |
|------|-------|-------------|
| \`verify_setup\` | read | Check site reachability, per-product credentials, plugin presence, and run one harmless read per configured product. |

Example: \`{"name": "verify_setup", "arguments": {}}\`

**Total: ${total} tools.**
`;

fs.writeFileSync('docs/TOOL_CATALOG.md', out);
console.log(`docs/TOOL_CATALOG.md written (${total} tools).`);
