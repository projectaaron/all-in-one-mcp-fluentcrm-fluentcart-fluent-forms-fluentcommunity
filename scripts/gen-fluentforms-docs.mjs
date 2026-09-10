#!/usr/bin/env node
/* Generate docs/api-reference/fluentforms/endpoints.json (+ the overview md)
   for Fluent Forms.

   Fluent Forms' developer docs publish an *auto-extracted* endpoint reference
   (https://developers.fluentforms.com/api/endpoints/ — method, path,
   controller@action per route, generated from app/Http/Routes/api.php) but no
   OpenAPI specs, so gen-api-docs.mjs's spec pipeline does not apply. The OPS
   table below was derived from that reference plus the plugin source, and is
   checked against the live REST route index on every run: any drift — a live
   route missing from the table, or a table entry the site no longer serves —
   fails with the routes named, the same loud-on-drift contract the OpenAPI
   pipeline has.

   Run: node scripts/gen-fluentforms-docs.mjs [--site https://example.com]
   (defaults to FLUENT_SITE_URL; --offline trusts the table and skips the
   live check when no site is reachable.) */
import fs from 'node:fs';

const NAMESPACE = 'fluentform/v1';

/* [method, path, group, slug, summary] — path in template form ({form_id}).
   Groups mirror the docs' own grouping; `license` and `mcp` are live-only
   (Pro licensing, and the newer MCP-adapter settings the docs page predates). */
const OPS = [
  // ---- forms
  ['GET', '/forms', 'forms', 'list-forms', 'GET List Forms'],
  ['POST', '/forms', 'forms', 'create-form', 'POST Create Form'],
  ['GET', '/forms/ping', 'forms', 'ping', 'GET Ping Forms API'],
  ['GET', '/forms/templates', 'forms', 'list-form-templates', 'GET List Form Templates'],
  ['GET', '/forms/{form_id}', 'forms', 'get-form', 'GET Get Form'],
  ['POST', '/forms/{form_id}', 'forms', 'update-form', 'POST Update Form'],
  ['DELETE', '/forms/{form_id}', 'forms', 'delete-form', 'DELETE Delete Form'],
  ['POST', '/forms/{form_id}/duplicate', 'forms', 'duplicate-form', 'POST Duplicate Form'],
  ['POST', '/forms/{form_id}/convert', 'forms', 'convert-form', 'POST Convert Form Type'],
  ['POST', '/forms/{form_id}/clearHistory', 'forms', 'clear-form-edit-history', 'POST Clear Form Edit History'],
  ['GET', '/forms/{form_id}/editHistory', 'forms', 'get-form-edit-history', 'GET Get Form Edit History'],
  ['GET', '/forms/{form_id}/fields', 'forms', 'get-form-fields', 'GET Get Form Fields'],
  ['GET', '/forms/{form_id}/findShortCodePage', 'forms', 'find-form-shortcode-page', 'GET Find Form Shortcode Page'],
  ['GET', '/forms/{form_id}/pages', 'forms', 'list-form-pages', 'GET List Pages Embedding the Form'],
  ['GET', '/forms/{form_id}/resources', 'forms', 'get-form-resources', 'GET Get Form Resources'],
  ['GET', '/forms/{form_id}/shortcodes', 'forms', 'get-form-shortcodes', 'GET Get Form Shortcodes'],

  // ---- analytics
  ['POST', '/analytics/{form_id}/reset', 'analytics', 'reset-form-analytics', 'POST Reset Form Analytics'],

  // ---- submissions (entries)
  ['GET', '/submissions', 'submissions', 'list-submissions', 'GET List Submissions'],
  ['GET', '/submissions/all', 'submissions', 'list-all-submissions', 'GET List All Submissions'],
  ['POST', '/submissions/bulk-actions', 'submissions', 'bulk-action-submissions', 'POST Bulk Action Submissions'],
  ['GET', '/submissions/print', 'submissions', 'print-submissions', 'GET Print Submissions'],
  ['GET', '/submissions/resources', 'submissions', 'get-submission-resources', 'GET Get Submission Resources'],
  ['GET', '/submissions/{entry_id}', 'submissions', 'get-submission', 'GET Get Submission'],
  ['DELETE', '/submissions/{entry_id}', 'submissions', 'delete-submission', 'DELETE Delete Submission'],
  ['POST', '/submissions/{entry_id}/is-favorite', 'submissions', 'toggle-submission-favorite', 'POST Toggle Submission Favorite'],
  ['GET', '/submissions/{entry_id}/logs', 'submissions', 'get-submission-logs', 'GET Get Submission Logs'],
  ['DELETE', '/submissions/{entry_id}/logs', 'submissions', 'delete-submission-logs', 'DELETE Delete Submission Logs'],
  ['GET', '/submissions/{entry_id}/notes', 'submissions', 'get-submission-notes', 'GET Get Submission Notes'],
  ['POST', '/submissions/{entry_id}/notes', 'submissions', 'create-submission-note', 'POST Create Submission Note'],
  ['POST', '/submissions/{entry_id}/status', 'submissions', 'update-submission-status', 'POST Update Submission Status'],
  ['GET', '/submissions/{entry_id}/submission-users', 'submissions', 'get-submission-users', 'GET Get Submission Users'],
  ['POST', '/submissions/{entry_id}/update-submission-user', 'submissions', 'update-submission-user', 'POST Update Submission User'],

  // ---- public form submission
  ['POST', '/form-submit', 'form-submit', 'submit-form', 'POST Submit a Form Entry'],

  // ---- per-form settings
  ['GET', '/settings/{form_id}', 'settings', 'get-form-settings', 'GET Get Form Settings'],
  ['POST', '/settings/{form_id}', 'settings', 'save-form-settings', 'POST Save Form Settings'],
  ['DELETE', '/settings/{form_id}', 'settings', 'delete-form-settings', 'DELETE Delete Form Settings'],
  ['GET', '/settings/{form_id}/general', 'settings', 'get-general-settings', 'GET Get General Form Settings'],
  ['POST', '/settings/{form_id}/general', 'settings', 'save-general-settings', 'POST Save General Form Settings'],
  ['GET', '/settings/{form_id}/customizer', 'settings', 'get-customizer-settings', 'GET Get Form Customizer Settings'],
  ['POST', '/settings/{form_id}/customizer', 'settings', 'save-customizer-settings', 'POST Save Form Customizer Settings'],
  ['POST', '/settings/{form_id}/entry-columns', 'settings', 'save-entry-columns', 'POST Save Entry Columns'],
  ['GET', '/settings/{form_id}/conversational-design', 'settings', 'get-conversational-design', 'GET Get Conversational Form Design'],
  ['POST', '/settings/{form_id}/store-conversational-design', 'settings', 'save-conversational-design', 'POST Save Conversational Form Design'],
  ['GET', '/settings/{form_id}/preset', 'settings', 'get-form-preset', 'GET Get Form Style Preset'],
  ['POST', '/settings/{form_id}/save-preset', 'settings', 'save-form-preset', 'POST Save Form Style Preset'],

  // ---- integrations
  ['GET', '/integrations', 'integrations', 'list-global-integrations', 'GET List Global Integrations'],
  ['POST', '/integrations', 'integrations', 'save-global-integration', 'POST Save Global Integration'],
  ['POST', '/integrations/update-status', 'integrations', 'update-integration-module-status', 'POST Update Integration Module Status'],
  ['GET', '/integrations/{form_id}', 'integrations', 'get-form-integration', 'GET Get Form Integration'],
  ['POST', '/integrations/{form_id}', 'integrations', 'save-form-integration', 'POST Save Form Integration'],
  ['DELETE', '/integrations/{form_id}', 'integrations', 'delete-form-integration', 'DELETE Delete Form Integration'],
  ['GET', '/integrations/{form_id}/form-integrations', 'integrations', 'list-form-integrations', 'GET List Form Integrations'],
  ['GET', '/integrations/{form_id}/integration-list-id', 'integrations', 'get-integration-list-component', 'GET Get Integration List Component'],

  // ---- reports (all reads; the POST is a filtered query, see operationOverrides)
  ['GET', '/report/api-logs', 'report', 'get-api-logs-report', 'GET Get API Logs Report'],
  ['GET', '/report/completion-rate', 'report', 'get-completion-rate', 'GET Get Form Completion Rate'],
  ['GET', '/report/country-heatmap', 'report', 'get-country-heatmap', 'GET Get Country Heatmap'],
  ['GET', '/report/form-stats', 'report', 'get-form-stats', 'GET Get Form Stats'],
  ['GET', '/report/forms/{form_id}', 'report', 'get-form-report', 'GET Get Form Report'],
  ['GET', '/report/heatmap-data', 'report', 'get-heatmap-data', 'GET Get Heatmap Data'],
  ['GET', '/report/net-revenue', 'report', 'get-net-revenue', 'GET Get Net Revenue'],
  ['GET', '/report/overview-chart', 'report', 'get-overview-chart', 'GET Get Overview Chart'],
  ['GET', '/report/payment-types', 'report', 'get-payment-types', 'GET Get Payment Types Report'],
  ['GET', '/report/revenue-chart', 'report', 'get-revenue-chart', 'GET Get Revenue Chart'],
  ['GET', '/report/select-forms', 'report', 'list-report-forms', 'GET List Forms for Reports'],
  ['GET', '/report/submissions-analysis', 'report', 'get-submissions-analysis', 'GET Get Submissions Analysis'],
  ['GET', '/report/subscriptions', 'report', 'get-subscriptions-report', 'GET Get Subscriptions Report'],
  ['GET', '/report/top-performing-forms', 'report', 'get-top-performing-forms', 'GET Get Top Performing Forms'],
  ['POST', '/report/submissions', 'report', 'query-submissions-report', 'POST Query Submissions Report'],

  // ---- global settings
  ['GET', '/global-settings', 'global-settings', 'get-global-settings', 'GET Get Global Settings'],
  ['POST', '/global-settings', 'global-settings', 'save-global-settings', 'POST Save Global Settings'],

  // ---- licensing (Pro; not present in the free plugin)
  ['GET', '/license', 'license', 'get-license', 'GET Get License Status'],
  ['POST', '/license', 'license', 'activate-license', 'POST Activate License'],
  ['DELETE', '/license', 'license', 'deactivate-license', 'DELETE Deactivate License'],

  // ---- managers & roles
  ['GET', '/managers', 'managers', 'list-managers', 'GET List Managers'],
  ['POST', '/managers', 'managers', 'add-manager', 'POST Add Manager'],
  ['DELETE', '/managers', 'managers', 'remove-manager', 'DELETE Remove Manager'],
  ['GET', '/managers/users', 'managers', 'list-manager-users', 'GET List Assignable Users'],
  ['GET', '/roles', 'roles', 'list-roles', 'GET List Roles and Capabilities'],
  ['POST', '/roles', 'roles', 'add-role-capability', 'POST Add Role Capability'],

  // ---- logs
  ['GET', '/logs', 'logs', 'list-logs', 'GET List Logs'],
  ['DELETE', '/logs', 'logs', 'delete-logs', 'DELETE Delete Logs'],
  ['GET', '/logs/filters', 'logs', 'get-log-filters', 'GET Get Log Filters'],

  // ---- misc utilities
  ['GET', '/global-search', 'global-search', 'global-search', 'GET Global Search'],
  ['POST', '/notice', 'notice', 'handle-admin-notice', 'POST Handle Admin Notice Action'],
  ['POST', '/suggested-plugins/check-plugin-statuses', 'suggested-plugins', 'check-plugin-statuses', 'POST Check Plugin Statuses'],
  ['POST', '/suggested-plugins/install-plugin', 'suggested-plugins', 'install-plugin', 'POST Install Plugin'],
  ['POST', '/suggested-plugins/activate-plugin', 'suggested-plugins', 'activate-plugin', 'POST Activate Plugin'],

  // ---- MCP adapter settings (Fluent Forms' own MCP integration)
  ['GET', '/mcp/status', 'mcp', 'get-mcp-status', 'GET Get MCP Adapter Status'],
  ['POST', '/mcp/toggle', 'mcp', 'toggle-mcp', 'POST Toggle MCP Adapter'],
  ['POST', '/mcp/install-adapter', 'mcp', 'install-mcp-adapter', 'POST Install MCP Adapter'],
  ['GET', '/mcp/config-snippets', 'mcp', 'get-mcp-config-snippets', 'GET Get MCP Config Snippets'],
];

const args = process.argv.slice(2);
const offline = args.includes('--offline');
const siteArg = args.indexOf('--site');
const site = siteArg >= 0 ? args[siteArg + 1] : process.env.FLUENT_SITE_URL;

const key = (m, p) => `${m} ${p}`;
const table = new Map(OPS.map(([m, p]) => [key(m, p), true]));
if (OPS.length !== table.size) throw new Error('OPS table has duplicate method+path entries');
if (new Set(OPS.map(([, , g, s]) => `${g}/${s}`)).size !== OPS.length) {
  throw new Error('OPS table has duplicate group/slug pairs');
}

// Live check: the route index is the source of truth; drift fails the run.
if (!offline) {
  if (!site) {
    console.error('No site to check against — pass --site https://… or set FLUENT_SITE_URL (or use --offline).');
    process.exit(1);
  }
  const res = await fetch(`${site.replace(/\/+$/, '')}/wp-json/${NAMESPACE}`);
  if (!res.ok) throw new Error(`route index fetch failed: HTTP ${res.status}`);
  const index = await res.json();
  const live = new Set();
  for (const [routePath, route] of Object.entries(index.routes ?? {})) {
    const rel = routePath.replace(`/${NAMESPACE}`, '');
    if (!rel) continue; // the namespace root
    // (?P<form_id>[^\s(?!/)]+) → {form_id}; bracket expressions may contain
    // ')' so they must be consumed atomically.
    const template = rel.replace(/\(\?P<(\w+)>(?:\[[^\]]*\]|[^)])*\)/g, '{$1}');
    for (const ep of route.endpoints ?? []) {
      for (const method of ep.methods ?? []) live.add(key(method, template));
    }
  }
  const missing = [...live].filter((k) => !table.has(k));
  const stale = [...table.keys()].filter((k) => !live.has(k));
  if (missing.length || stale.length) {
    for (const k of missing) console.error(`LIVE ROUTE NOT IN TABLE: ${k}`);
    for (const k of stale) console.error(`TABLE ENTRY NOT SERVED LIVE: ${k}`);
    console.error(`\n${missing.length} unmapped live route(s), ${stale.length} stale table entr(ies) — update OPS in this script.`);
    process.exit(1);
  }
  console.log(`live check ok — ${live.size} operations match the table`);
}

const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const today = new Date().toISOString().slice(0, 10);
const outDir = 'docs/api-reference/fluentforms';
fs.mkdirSync(outDir, { recursive: true });

const existing = fs.existsSync(`${outDir}/endpoints.json`)
  ? JSON.parse(fs.readFileSync(`${outDir}/endpoints.json`, 'utf8'))
  : undefined;

const inventory = {
  product: 'fluentforms',
  source:
    'https://developers.fluentforms.com/api/endpoints/ (auto-extracted route reference) reconciled against the live REST route index (GET /wp-json/fluentform/v1)',
  scraped: today,
  baseUrl: `https://{website}/wp-json/${NAMESPACE}`,
  namespace: NAMESPACE,
  count: OPS.length,
  endpoints: OPS.map(([method, path, group, slug, summary]) => ({
    group,
    slug,
    operationId: camel(slug),
    method,
    path,
    summary,
    security: ['ApplicationPasswords'],
    deprecated: false,
  })),
};

// Don't restamp when only the date would move (same rule as gen-api-docs).
const unchanged =
  existing && JSON.stringify({ ...existing, scraped: '' }) === JSON.stringify({ ...inventory, scraped: '' });
if (unchanged) {
  console.log(`${outDir}/endpoints.json unchanged (${OPS.length} operations) — not restamped`);
} else {
  fs.writeFileSync(`${outDir}/endpoints.json`, JSON.stringify(inventory, null, 2) + '\n');
  console.log(`${outDir}/endpoints.json written (${OPS.length} operations)`);
}

// Overview markdown: one table per group.
const groups = [...new Set(OPS.map(([, , g]) => g))];
const lines = [
  '# Fluent Forms REST API reference',
  '',
  '**Generated** by `scripts/gen-fluentforms-docs.mjs` — do not edit by hand.',
  '',
  "Fluent Forms publishes an auto-extracted route reference at",
  '<https://developers.fluentforms.com/api/endpoints/> but no OpenAPI specs, so this',
  'inventory is curated from that reference plus the plugin source and reconciled',
  `against the live route index (\`GET /wp-json/${NAMESPACE}\`) on every run.`,
  'Request/response body shapes are not published upstream: they mirror what the',
  'wp-admin UI sends, so read a record first (`detail:"full"`) and mirror its shape.',
  '',
  `- Base URL: \`https://{website}/wp-json/${NAMESPACE}\``,
  '- Auth: WordPress Application Passwords over HTTP Basic. The docs pages show an',
  '  `X-WP-Nonce` header because that is what the admin UI (cookie-authenticated)',
  '  must send; the route policies themselves are pure capability checks',
  '  (`Acl::hasPermission()` → `current_user_can()`), and `Acl::verifyNonce()`',
  '  returns early unless `wp_doing_ajax()`, so no nonce applies to REST calls.',
  '  See [`api-reference/auth.md`](../auth.md).',
  '- `PUT`/`PATCH`/`DELETE` are served natively; the docs mention an',
  '  `X-HTTP-Method-Override` header only as a fallback for restrictive hosts.',
  '- `license` requires Fluent Forms Pro. `POST /form-submit` is the public',
  '  submission endpoint — it creates a real entry and fires notifications,',
  '  integrations and payment processing.',
  '',
];
for (const g of groups) {
  lines.push(`## ${g}`, '', '| Method | Path | Summary |', '|---|---|---|');
  for (const [method, path, group, , summary] of OPS) {
    if (group === g) lines.push(`| ${method} | \`${path}\` | ${summary.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/, '')} |`);
  }
  lines.push('');
}
fs.writeFileSync('docs/api-reference/fluentforms.md', lines.join('\n'));
console.log('docs/api-reference/fluentforms.md written');
