#!/usr/bin/env node
/* Generate docs/api-reference/wpsocialninja/endpoints.json (+ the overview md)
   for WP Social Ninja.

   Unlike the Fluent products, WP Social Ninja publishes no OpenAPI docs site —
   the authoritative endpoint inventory is the live plugin's REST route index
   (`GET /wp-json/wpsocialreviews/v2`). This script fetches that index and
   checks it against the hand-curated OPS table below (groups, slugs and
   human summaries are editorial decisions the route index cannot supply).
   Any drift — a live route missing from the table, or a table entry the live
   site no longer serves — fails the run with the exact routes named, the same
   loud-on-drift behavior the OpenAPI pipeline has.

   Run: node scripts/gen-wpsocialninja-docs.mjs [--site https://example.com]
   (defaults to FLUENT_SITE_URL; add --offline to trust the table and skip
   the live check when no site is reachable.) */
import fs from 'node:fs';

const NAMESPACE = 'wpsocialreviews/v2';

/* [method, path, group, slug, summary] — path in template form ({id}).
   Summaries follow the docs convention: "<METHOD> <Title>". */
const OPS = [
  // ---- reviews (platform reviews shown in widgets)
  ['GET', '/reviews', 'reviews', 'list-reviews', 'GET List Reviews'],
  ['POST', '/reviews', 'reviews', 'create-review', 'POST Create Review'],
  ['DELETE', '/reviews', 'reviews', 'delete-reviews', 'DELETE Delete Reviews'],
  ['PUT', '/reviews/{id}', 'reviews', 'update-review', 'PUT Update Review'],
  ['POST', '/reviews/duplicate', 'reviews', 'duplicate-review', 'POST Duplicate Review'],
  ['PUT', '/reviews/status-update', 'reviews', 'update-review-statuses', 'PUT Update Review Statuses'],
  ['PUT', '/reviews/spam', 'reviews', 'mark-reviews-spam', 'PUT Mark Reviews as Spam'],
  ['PUT', '/reviews/bulk-category', 'reviews', 'bulk-assign-review-category', 'PUT Bulk Assign Review Category'],
  ['GET', '/reviews/categories', 'reviews', 'list-review-categories', 'GET List Review Categories'],
  ['PUT', '/reviews/categories/{id}', 'reviews', 'update-review-category', 'PUT Update Review Category'],
  ['DELETE', '/reviews/categories/{id}', 'reviews', 'delete-review-category', 'DELETE Delete Review Category'],

  // ---- testimonials (manually written reviews)
  ['GET', '/testimonials', 'testimonials', 'list-testimonials', 'GET List Testimonials'],
  ['POST', '/testimonials', 'testimonials', 'create-testimonial', 'POST Create Testimonial'],
  ['DELETE', '/testimonials', 'testimonials', 'delete-testimonials', 'DELETE Delete Testimonials'],
  ['PUT', '/testimonials/{id}', 'testimonials', 'update-testimonial', 'PUT Update Testimonial'],
  ['POST', '/testimonials/duplicate', 'testimonials', 'duplicate-testimonial', 'POST Duplicate Testimonial'],
  ['PUT', '/testimonials/status-update', 'testimonials', 'update-testimonial-statuses', 'PUT Update Testimonial Statuses'],
  ['PUT', '/testimonials/spam', 'testimonials', 'mark-testimonials-spam', 'PUT Mark Testimonials as Spam'],
  ['PUT', '/testimonials/bulk-category', 'testimonials', 'bulk-assign-testimonial-category', 'PUT Bulk Assign Testimonial Category'],
  ['GET', '/testimonials/categories', 'testimonials', 'list-testimonial-categories', 'GET List Testimonial Categories'],
  ['PUT', '/testimonials/categories/{id}', 'testimonials', 'update-testimonial-category', 'PUT Update Testimonial Category'],
  ['DELETE', '/testimonials/categories/{id}', 'testimonials', 'delete-testimonial-category', 'DELETE Delete Testimonial Category'],

  // ---- templates (the widget/feed templates rendered by shortcodes/blocks)
  ['GET', '/templates', 'templates', 'list-templates', 'GET List Templates'],
  ['POST', '/templates', 'templates', 'create-template', 'POST Create Template'],
  ['DELETE', '/templates', 'templates', 'delete-templates', 'DELETE Delete Templates'],
  ['POST', '/templates/duplicate', 'templates', 'duplicate-template', 'POST Duplicate Template'],
  ['PUT', '/templates/title/{id}', 'templates', 'update-template-title', 'PUT Update Template Title'],
  ['GET', '/templates/meta/reviews/{id}', 'templates', 'get-reviews-template', 'GET Get Reviews Template Meta'],
  ['PUT', '/templates/meta/reviews/{id}', 'templates', 'update-reviews-template', 'PUT Update Reviews Template Meta'],
  ['POST', '/templates/meta/reviews/{id}/edit', 'templates', 'edit-reviews-template', 'POST Edit Reviews Template'],
  ['POST', '/templates/meta/reviews/{id}/load-more', 'templates', 'load-more-template-reviews', 'POST Load More Template Reviews'],
  ['GET', '/templates/meta/reviews/{id}/can-enable-ai-summary', 'templates', 'can-enable-ai-summary', 'GET Can Enable AI Summary'],
  ['GET', '/templates/meta/reviews/{id}/first-round/{isFirstRound}', 'templates', 'get-reviews-template-first-round', 'GET Get Reviews Template (First Round)'],
  ['GET', '/templates/meta/feeds/{id}', 'templates', 'get-feed-template', 'GET Get Feed Template Meta'],
  ['PUT', '/templates/meta/feeds/{id}', 'templates', 'update-feed-template', 'PUT Update Feed Template Meta'],
  ['POST', '/templates/meta/feeds/{id}/edit', 'templates', 'edit-feed-template', 'POST Edit Feed Template'],

  // ---- platforms (connections to Google/Facebook/Instagram/… + sync)
  ['GET', '/platforms', 'platforms', 'list-platforms', 'GET List Platforms'],
  ['GET', '/platforms/enabled', 'platforms', 'list-enabled-platforms', 'GET List Enabled Platforms'],
  ['GET', '/platforms/get-statuses', 'platforms', 'get-platform-statuses', 'GET Get Platform Statuses'],
  ['POST', '/platforms/update-statuses', 'platforms', 'update-platform-statuses', 'POST Update Platform Statuses'],
  ['POST', '/platforms/addons', 'platforms', 'update-platform-addons', 'POST Update Platform Addons'],
  ['POST', '/platforms/subscribe', 'platforms', 'subscribe-platform-updates', 'POST Subscribe to Platform Updates'],
  ['GET', '/platforms/dashboard-notices', 'platforms', 'get-dashboard-notices', 'GET Get Dashboard Notices'],
  ['POST', '/platforms/dashboard-notices', 'platforms', 'update-dashboard-notices', 'POST Update Dashboard Notices'],
  ['GET', '/platforms/reviews/configs', 'platforms', 'get-review-platform-configs', 'GET Get Review Platform Configs'],
  ['POST', '/platforms/reviews/configs', 'platforms', 'save-review-platform-config', 'POST Save Review Platform Config'],
  ['DELETE', '/platforms/reviews/configs', 'platforms', 'delete-review-platform-config', 'DELETE Delete Review Platform Config'],
  ['POST', '/platforms/reviews/configs/prepare', 'platforms', 'prepare-review-platform-connect', 'POST Prepare Review Platform Connect'],
  ['POST', '/platforms/reviews/configs/consume', 'platforms', 'consume-review-platform-connect', 'POST Consume Review Platform Connect'],
  ['POST', '/platforms/reviews/configs/manually-sync-reviews', 'platforms', 'sync-platform-reviews', 'POST Manually Sync Platform Reviews'],
  ['POST', '/platforms/reviews', 'platforms', 'fetch-platform-reviews', 'POST Fetch Platform Reviews'],
  ['GET', '/platforms/feeds/configs', 'platforms', 'get-feed-platform-configs', 'GET Get Feed Platform Configs'],
  ['POST', '/platforms/feeds/configs', 'platforms', 'save-feed-platform-config', 'POST Save Feed Platform Config'],
  ['DELETE', '/platforms/feeds/configs', 'platforms', 'delete-feed-platform-config', 'DELETE Delete Feed Platform Config'],
  ['POST', '/platforms/feeds/configs/prepare', 'platforms', 'prepare-feed-platform-connect', 'POST Prepare Feed Platform Connect'],
  ['POST', '/platforms/feeds/configs/consume', 'platforms', 'consume-feed-platform-connect', 'POST Consume Feed Platform Connect'],

  // ---- chat widgets
  ['GET', '/chat-widgets', 'chat-widgets', 'list-chat-widgets', 'GET List Chat Widgets'],
  ['POST', '/chat-widgets', 'chat-widgets', 'create-chat-widget', 'POST Create Chat Widget'],
  ['PUT', '/chat-widgets', 'chat-widgets', 'update-chat-widget-statuses', 'PUT Update Chat Widget Statuses'],
  ['DELETE', '/chat-widgets', 'chat-widgets', 'delete-chat-widgets', 'DELETE Delete Chat Widgets'],
  ['POST', '/chat-widgets/duplicate', 'chat-widgets', 'duplicate-chat-widget', 'POST Duplicate Chat Widget'],
  ['GET', '/chat-widgets/meta/chats/{id}', 'chat-widgets', 'get-chat-widget', 'GET Get Chat Widget Meta'],
  ['PUT', '/chat-widgets/meta/chats/{id}', 'chat-widgets', 'update-chat-widget', 'PUT Update Chat Widget Meta'],
  ['DELETE', '/chat-widgets/meta/chats/{id}/edit', 'chat-widgets', 'reset-chat-widget', 'DELETE Reset Chat Widget Meta'],

  // ---- sales notifications
  ['GET', '/notifications', 'notifications', 'list-notifications', 'GET List Notifications'],
  ['POST', '/notifications', 'notifications', 'create-notification', 'POST Create Notification'],
  ['PUT', '/notifications', 'notifications', 'update-notification', 'PUT Update Notification'],
  ['DELETE', '/notifications', 'notifications', 'delete-notifications', 'DELETE Delete Notifications'],
  ['POST', '/notifications/duplicate', 'notifications', 'duplicate-notification', 'POST Duplicate Notification'],

  // ---- shoppable Instagram feeds
  ['GET', '/shoppable', 'shoppable', 'get-shoppable-feed', 'GET Get Shoppable Feed'],
  ['PUT', '/shoppable', 'shoppable', 'update-shoppable-feed', 'PUT Update Shoppable Feed'],
  ['DELETE', '/shoppable', 'shoppable', 'delete-shoppable-feed', 'DELETE Delete Shoppable Feed'],
  ['GET', '/shoppable/posts', 'shoppable', 'list-shoppable-posts', 'GET List Shoppable Posts'],
  ['PUT', '/shoppable/template-settings/{id}', 'shoppable', 'update-shoppable-template-settings', 'PUT Update Shoppable Template Settings'],

  // ---- global settings (incl. Social Ninja managers, licensing, resets)
  ['GET', '/settings', 'settings', 'get-settings', 'GET Get Global Settings'],
  ['PUT', '/settings', 'settings', 'save-settings', 'PUT Save Global Settings'],
  ['DELETE', '/settings', 'settings', 'delete-settings', 'DELETE Delete Global Settings'],
  ['GET', '/settings/advance-settings', 'settings', 'get-advanced-settings', 'GET Get Advanced Settings'],
  ['POST', '/settings/advance-settings', 'settings', 'save-advanced-settings', 'POST Save Advanced Settings'],
  ['GET', '/settings/translations', 'settings', 'get-translations', 'GET Get Translations'],
  ['POST', '/settings/translations', 'settings', 'save-translations', 'POST Save Translations'],
  ['GET', '/settings/license', 'settings', 'get-license', 'GET Get License'],
  ['POST', '/settings/license', 'settings', 'activate-license', 'POST Activate License'],
  ['DELETE', '/settings/license', 'settings', 'deactivate-license', 'DELETE Deactivate License'],
  ['DELETE', '/settings/twitter-card', 'settings', 'delete-twitter-card', 'DELETE Delete Twitter Card Connection'],
  ['DELETE', '/settings/reset-images', 'settings', 'reset-cached-images', 'DELETE Reset Cached Images'],
  ['DELETE', '/settings/reset-error-log', 'settings', 'reset-error-log', 'DELETE Reset Error Log'],
  ['DELETE', '/settings/delete-all-data', 'settings', 'delete-all-data', 'DELETE Delete All Plugin Data'],
  ['GET', '/pages/search', 'settings', 'search-pages', 'GET Search Site Pages'],
  ['GET', '/pro/settings/managers', 'settings', 'list-managers', 'GET List Managers'],
  ['POST', '/pro/settings/managers', 'settings', 'add-manager', 'POST Add Manager'],
  ['PUT', '/pro/settings/managers', 'settings', 'update-manager', 'PUT Update Manager'],
  ['DELETE', '/pro/settings/managers/{id}', 'settings', 'delete-manager', 'DELETE Delete Manager'],

  // ---- onboarding wizard
  ['GET', '/onboarding', 'onboarding', 'get-onboarding', 'GET Get Onboarding State'],
  ['POST', '/onboarding', 'onboarding', 'save-onboarding', 'POST Save Onboarding Step'],
  ['GET', '/onboarding/config', 'onboarding', 'get-onboarding-config', 'GET Get Onboarding Config'],
  ['POST', '/onboarding/skip', 'onboarding', 'skip-onboarding', 'POST Skip Onboarding'],

  // ---- review collection (pro): forms, custom sources, QR codes, imports
  ['GET', '/pro/review-forms', 'collection', 'list-review-forms', 'GET List Review Forms'],
  ['POST', '/pro/review-forms', 'collection', 'create-review-form', 'POST Create Review Form'],
  ['DELETE', '/pro/review-forms', 'collection', 'delete-review-forms', 'DELETE Delete Review Forms'],
  ['GET', '/pro/review-forms/{id}', 'collection', 'get-review-form', 'GET Get Review Form'],
  ['PUT', '/pro/review-forms/{id}', 'collection', 'update-review-form', 'PUT Update Review Form'],
  ['POST', '/pro/review-forms/{id}/duplicate', 'collection', 'duplicate-review-form', 'POST Duplicate Review Form'],
  ['PUT', '/pro/review-forms/status-update', 'collection', 'update-review-form-statuses', 'PUT Update Review Form Statuses'],
  ['GET', '/pro/custom-sources', 'collection', 'list-custom-sources', 'GET List Custom Sources'],
  ['POST', '/pro/custom-sources', 'collection', 'create-custom-source', 'POST Create Custom Source'],
  ['DELETE', '/pro/custom-sources', 'collection', 'delete-custom-sources', 'DELETE Delete Custom Sources'],
  ['GET', '/pro/custom-sources/{id}', 'collection', 'get-custom-source', 'GET Get Custom Source'],
  ['POST', '/pro/custom-sources/{id}/settings', 'collection', 'save-custom-source-settings', 'POST Save Custom Source Settings'],
  ['GET', '/pro/custom-sources/forms/templates', 'collection', 'list-custom-source-form-templates', 'GET List Custom Source Form Templates'],
  ['GET', '/pro/settings/get-reviews/qr-code', 'collection', 'list-qr-codes', 'GET List Get-Reviews QR Codes'],
  ['POST', '/pro/settings/get-reviews/qr-code', 'collection', 'create-qr-code', 'POST Create Get-Reviews QR Code'],
  ['PUT', '/pro/settings/get-reviews/qr-code/{id}', 'collection', 'update-qr-code', 'PUT Update Get-Reviews QR Code'],
  ['DELETE', '/pro/settings/get-reviews/qr-code/{id}', 'collection', 'delete-qr-code', 'DELETE Delete Get-Reviews QR Code'],
  ['GET', '/pro/settings/get-reviews/get-review-collection-platforms', 'collection', 'list-review-collection-platforms', 'GET List Review Collection Platforms'],
  ['GET', '/pro/settings/review-form-captcha', 'collection', 'get-review-form-captcha', 'GET Get Review Form Captcha'],
  ['POST', '/pro/settings/review-form-captcha', 'collection', 'save-review-form-captcha', 'POST Save Review Form Captcha'],
  ['DELETE', '/pro/settings/review-form-captcha', 'collection', 'delete-review-form-captcha', 'DELETE Delete Review Form Captcha'],
  ['GET', '/pro/settings/fluentcrm-review-tag', 'collection', 'get-fluentcrm-review-tag', 'GET Get FluentCRM Review Tag'],
  ['POST', '/pro/settings/fluentcrm-review-tag', 'collection', 'save-fluentcrm-review-tag', 'POST Save FluentCRM Review Tag'],
  ['POST', '/pro/settings/woocommerce/import-reviews', 'collection', 'import-woocommerce-reviews', 'POST Import WooCommerce Reviews'],
  ['POST', '/pro/settings/woocommerce/restart-import-reviews', 'collection', 'restart-woocommerce-import', 'POST Restart WooCommerce Review Import'],
  ['GET', '/pro/settings/woocommerce/import-progress', 'collection', 'get-woocommerce-import-progress', 'GET Get WooCommerce Import Progress'],
  ['POST', '/pro/settings/woocommerce/quick-setup', 'collection', 'quick-setup-woocommerce', 'POST Quick Setup WooCommerce Reviews'],
  ['POST', '/pro/settings/fluent-cart/quick-setup', 'collection', 'quick-setup-fluent-cart', 'POST Quick Setup FluentCart Reviews'],
  ['POST', '/pro/settings/fluent-cart/connect-all-products', 'collection', 'connect-fluent-cart-products', 'POST Connect All FluentCart Products'],
];

const args = process.argv.slice(2);
const offline = args.includes('--offline');
const siteArg = args.indexOf('--site');
const site = siteArg >= 0 ? args[siteArg + 1] : process.env.FLUENT_SITE_URL;

const key = (m, p) => `${m} ${p}`;
const table = new Map(OPS.map(([m, p]) => [key(m, p), true]));
{
  const dupes = OPS.length - table.size;
  if (dupes) throw new Error(`OPS table has ${dupes} duplicate method+path entries`);
  const slugs = new Set(OPS.map(([, , g, s]) => `${g}/${s}`));
  if (slugs.size !== OPS.length) throw new Error('OPS table has duplicate group/slug pairs');
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
    // (?P<id>[0-9]+) / (?P<id>[^\s(?!/)]+) → {id}; bracket expressions may
    // contain ')' so they must be consumed atomically.
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
const outDir = 'docs/api-reference/wpsocialninja';
fs.mkdirSync(outDir, { recursive: true });

const existing = fs.existsSync(`${outDir}/endpoints.json`)
  ? JSON.parse(fs.readFileSync(`${outDir}/endpoints.json`, 'utf8'))
  : undefined;

const inventory = {
  product: 'wpsocialninja',
  source: 'live REST route index (GET /wp-json/wpsocialreviews/v2) — WP Social Ninja publishes no OpenAPI docs site',
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
  '# WP Social Ninja REST API reference',
  '',
  `**Generated** by \`scripts/gen-wpsocialninja-docs.mjs\` — do not edit by hand.`,
  '',
  'WP Social Ninja (plugin slug `wp-social-reviews`, plus its Pro add-on) publishes',
  'no developer docs site, so this inventory is captured from the live REST route',
  `index (\`GET /wp-json/${NAMESPACE}\`) and curated here. Request/response body`,
  'shapes are not documented upstream: they mirror the payloads the wp-admin UI',
  'sends, so when in doubt read a record first (`detail:"full"`) and mirror its shape.',
  '',
  `- Base URL: \`https://{website}/wp-json/${NAMESPACE}\``,
  '- Auth: WordPress Application Passwords over HTTP Basic (admin routes return',
  '  standard `rest_forbidden` 401s to anonymous callers — capability-checked like',
  '  the Fluent products; see [`api-reference/auth.md`](./api-reference/auth.md)).',
  '- `/pro/…` routes require WP Social Ninja Pro to be active.',
  '',
];
for (const g of groups) {
  lines.push(`## ${g}`, '', '| Method | Path | Summary |', '|---|---|---|');
  for (const [method, path, group, , summary] of OPS) {
    if (group === g) lines.push(`| ${method} | \`${path}\` | ${summary.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/, '')} |`);
  }
  lines.push('');
}
fs.writeFileSync('docs/api-reference/wpsocialninja.md', lines.join('\n'));
console.log('docs/api-reference/wpsocialninja.md written');
