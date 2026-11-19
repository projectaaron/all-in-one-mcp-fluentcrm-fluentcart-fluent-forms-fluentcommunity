#!/usr/bin/env node
/* Generate docs/api-reference/fluentbooking/endpoints.json (+ overview md)
   for FluentBooking.

   FluentBooking documents its REST API at
   https://developers.fluentbooking.com/rest-api/ as hand-written module pages
   (no OpenAPI specs), so the inventory is curated here from those pages:
   groups follow the docs' modules, summaries their operation titles, paths
   exactly as documented (free + Pro, 2.6.0). The docs' Payments page lists
   GET payment-settings twice (core and Pro handler of one route); it is one
   operation here. With a site, the table is checked against the live REST
   route index (GET /wp-json/fluent-booking/v2) — an unmapped live route or a
   stale table entry fails the run with the routes named, the same
   loud-on-drift contract the other generators have.

   Run: node scripts/gen-fluentbooking-docs.mjs [--site https://example.com]
   (defaults to FLUENT_SITE_URL; --offline skips the live check.) */
import fs from 'node:fs';

const NAMESPACE = 'fluent-booking/v2';

/* [method, path, group, slug, summary]. Groups follow the docs' modules;
   the tool map folds them into 9 areas. */
const OPS = [
  // ---- calendars (CalendarPolicy)
  ['GET', '/calendars', 'calendars', 'list-calendars', 'GET List Calendars'],
  ['POST', '/calendars', 'calendars', 'create-calendar', 'POST Create Calendar'],
  ['POST', '/calendars/check-slug', 'calendars', 'check-calendar-slug', 'POST Check a Calendar Slug Is Available'],
  ['GET', '/calendars/location-fields', 'calendars', 'get-location-fields', 'GET Get Event Location Field Options'],
  ['GET', '/calendars/{id}', 'calendars', 'get-calendar', 'GET Get Calendar'],
  ['POST', '/calendars/{id}', 'calendars', 'update-calendar', 'POST Update Calendar'],
  ['DELETE', '/calendars/{id}', 'calendars', 'delete-calendar', 'DELETE Delete Calendar'],
  ['POST', '/calendars/{id}/events', 'calendars', 'create-event', 'POST Create an Event Type in a Calendar'],
  ['GET', '/calendars/{id}/event-schema', 'calendars', 'get-event-schema', 'GET Get the New Event Type Schema'],
  ['POST', '/calendars/{id}/event-order', 'calendars', 'save-event-order', 'POST Save the Order of a Calendar\'s Event Types'],
  ['POST', '/calendars/{id}/clone-event/{event_id}', 'calendars', 'clone-event', 'POST Clone an Event Type (optionally into another calendar)'],

  // ---- sharing (landing page)
  ['GET', '/calendars/{id}/sharing-settings', 'sharing', 'get-sharing-settings', 'GET Get Calendar Sharing and Landing Page Settings'],
  ['POST', '/calendars/{id}/sharing-settings', 'sharing', 'save-sharing-settings', 'POST Save Calendar Sharing and Landing Page Settings'],

  // ---- events (event types)
  ['GET', '/calendars/{id}/events/{event_id}', 'events', 'get-event', 'GET Get Event Type'],
  ['PUT', '/calendars/{id}/events/{event_id}', 'events', 'patch-event', 'PUT Patch Event Type (e.g. status)'],
  ['DELETE', '/calendars/{id}/events/{event_id}', 'events', 'delete-event', 'DELETE Delete Event Type'],
  ['GET', '/events/{event_id}', 'events', 'find-event', 'GET Get Event Type by ID (no calendar needed)'],

  // ---- event-settings
  ['POST', '/calendars/{id}/events/{event_id}/details', 'event-settings', 'update-event-details', 'POST Update Event Type Details (title, duration, status, location, description)'],
  ['POST', '/calendars/{id}/events/{event_id}/limits', 'event-settings', 'update-event-limits', 'POST Update Event Type Limits (buffers, slot interval, booking frequency and duration, timezone lock)'],
  ['POST', '/calendars/{id}/events/{event_id}/assignments', 'event-settings', 'update-event-assignments', 'POST Update Event Type Host Assignments'],
  ['POST', '/calendars/{id}/events/{event_id}/advanced-settings', 'event-settings', 'update-event-advanced-settings', 'POST Update Event Type Advanced Settings'],
  ['POST', '/calendars/{id}/events/{event_id}/recurring-settings', 'event-settings', 'update-event-recurring-settings', 'POST Update Event Type Recurring Settings'],

  // ---- booking-fields
  ['GET', '/calendars/{id}/events/{event_id}/booking-fields', 'booking-fields', 'get-event-booking-fields', 'GET Get Event Type Booking Form Fields'],
  ['POST', '/calendars/{id}/events/{event_id}/booking-fields', 'booking-fields', 'save-event-booking-fields', 'POST Save Event Type Booking Form Fields'],

  // ---- event-availability
  ['GET', '/calendars/{id}/events/{event_id}/availability', 'event-availability', 'get-event-availability', 'GET Get Event Type Availability Settings'],
  ['POST', '/calendars/{id}/events/{event_id}/availability', 'event-availability', 'update-event-availability', 'POST Update Event Type Availability Settings'],
  ['GET', '/calendars/{id}/events/{event_id}/event-available-slots', 'event-availability', 'get-event-available-slots', 'GET Get Event Type Available Slots'],
  ['POST', '/calendars/{id}/events/{event_id}/event-availability', 'event-availability', 'update-event-schedule-availability', 'POST Update Event Type Availability (Pro schedule options)'],

  // ---- event-notifications (email)
  ['GET', '/calendars/{id}/events/{event_id}/email-notifications', 'event-notifications', 'get-email-notifications', 'GET Get Event Type Email Notifications'],
  ['POST', '/calendars/{id}/events/{event_id}/email-notifications', 'event-notifications', 'save-email-notifications', 'POST Save Event Type Email Notifications'],
  ['POST', '/calendars/{id}/events/{event_id}/email-notifications/clone', 'event-notifications', 'clone-email-notifications', 'POST Copy Email Notifications from Another Event Type'],

  // ---- webhooks-sms (Pro)
  ['GET', '/calendars/{id}/events/{event_id}/sms-notifications', 'webhooks-sms', 'get-sms-notifications', 'GET Get Event Type SMS Notifications'],
  ['POST', '/calendars/{id}/events/{event_id}/sms-notifications', 'webhooks-sms', 'save-sms-notifications', 'POST Save Event Type SMS Notifications'],
  ['POST', '/calendars/{id}/events/{event_id}/sms-notifications/clone', 'webhooks-sms', 'clone-sms-notifications', 'POST Copy SMS Notifications from Another Event Type'],
  ['GET', '/calendars/{id}/events/{event_id}/webhooks', 'webhooks-sms', 'list-webhooks', 'GET List Event Type Webhook Feeds'],
  ['POST', '/calendars/{id}/events/{event_id}/webhooks', 'webhooks-sms', 'save-webhook', 'POST Save an Event Type Webhook Feed'],
  ['POST', '/calendars/{id}/events/{event_id}/webhooks/clone', 'webhooks-sms', 'clone-webhooks', 'POST Copy Webhook Feeds from Another Event Type'],
  ['DELETE', '/calendars/{id}/events/{event_id}/webhooks/{webhook_id}', 'webhooks-sms', 'delete-webhook', 'DELETE Delete an Event Type Webhook Feed'],

  // ---- event-integrations (per-event integration feeds)
  ['GET', '/calendars/{id}/events/{event_id}/integrations', 'event-integrations', 'list-integration-feeds', 'GET List Event Type Integration Feeds'],
  ['POST', '/calendars/{id}/events/{event_id}/integrations/clone', 'event-integrations', 'clone-integration-feeds', 'POST Copy Integration Feeds from Another Event Type'],
  ['GET', '/calendars/{id}/events/{event_id}/integrations/{integration_id}', 'event-integrations', 'get-integration-feed', 'GET Get an Event Type Integration Feed'],
  ['POST', '/calendars/{id}/events/{event_id}/integrations/{integration_id}', 'event-integrations', 'save-integration-feed', 'POST Save an Event Type Integration Feed'],
  ['DELETE', '/calendars/{id}/events/{event_id}/integrations/{integration_id}', 'event-integrations', 'delete-integration-feed', 'DELETE Delete an Event Type Integration Feed'],
  ['GET', '/calendars/{id}/events/{event_id}/integrations/{integration_id}/merge-fields', 'event-integrations', 'get-integration-merge-fields', 'GET Get an Integration\'s Merge Fields'],
  ['GET', '/calendars/{id}/events/{event_id}/integrations/{integration_id}/config-field-options', 'event-integrations', 'get-integration-field-options', 'GET Get an Integration\'s Config Field Options'],
  ['POST', '/calendars/{id}/events/{event_id}/integrations/{integration_id}/crm-taxonomy', 'event-integrations', 'create-crm-taxonomy', 'POST Create a CRM Taxonomy for an Integration Feed'],

  // ---- schedules (booked meetings; MeetingPolicy)
  ['GET', '/schedules', 'schedules', 'list-bookings', 'GET List Bookings (booked meetings)'],
  ['GET', '/schedules/export', 'schedules', 'export-bookings', 'GET Export Bookings'],
  ['GET', '/schedules/crm-contact-prefill', 'schedules', 'get-crm-contact-prefill', 'GET Get FluentCRM Contact Prefill for a New Booking'],
  ['GET', '/schedules/crm-contact-search', 'schedules', 'search-crm-contacts', 'GET Search FluentCRM Contacts'],
  ['GET', '/schedules/{id}', 'schedules', 'get-booking', 'GET Get Booking'],
  ['PUT', '/schedules/{id}', 'schedules', 'update-booking', 'PUT Patch Booking'],
  ['DELETE', '/schedules/{id}', 'schedules', 'delete-booking', 'DELETE Delete Booking'],
  ['GET', '/schedules/{id}/activities', 'schedules', 'get-booking-activities', 'GET Get Booking Activity Log'],
  ['GET', '/schedules/{id}/meta-info', 'schedules', 'get-booking-meta-info', 'GET Get Booking Meta Info'],
  ['GET', '/schedules/{id}/crm-contact', 'schedules', 'get-booking-crm-contact', 'GET Get the Booking\'s FluentCRM Contact'],
  ['GET', '/schedules/{id}/crm-options', 'schedules', 'get-booking-crm-options', 'GET Get FluentCRM Tag and List Options for a Booking'],
  ['POST', '/schedules/{id}/crm-contact/tags', 'schedules', 'update-booking-crm-tags', 'POST Update the Booking Contact\'s FluentCRM Tags'],
  ['POST', '/schedules/{id}/crm-contact/lists', 'schedules', 'update-booking-crm-lists', 'POST Update the Booking Contact\'s FluentCRM Lists'],
  ['POST', '/schedules/{id}/send-confirmation-email', 'schedules', 'send-confirmation-email', 'POST Send the Booking Confirmation Email'],
  ['GET', '/schedules/group-bookings/{group_id}/attendees', 'schedules', 'list-group-attendees', 'GET List a Group Booking\'s Attendees'],
  ['GET', '/schedules/{id}/notes', 'schedules', 'list-booking-notes', 'GET List Booking Notes'],
  ['POST', '/schedules/{id}/notes', 'schedules', 'add-booking-note', 'POST Add a Booking Note'],
  ['PUT', '/schedules/{id}/notes/{note_id}', 'schedules', 'update-booking-note', 'PUT Update a Booking Note'],
  ['DELETE', '/schedules/{id}/notes/{note_id}', 'schedules', 'delete-booking-note', 'DELETE Delete a Booking Note'],

  // ---- bookings (create and reschedule as an admin; CalendarEventPolicy)
  ['GET', '/bookings', 'bookings', 'get-bookings-index', 'GET Get Bookings (Bookings module index)'],
  ['GET', '/bookings/event/{event_id}', 'bookings', 'get-bookable-event', 'GET Get an Event Type for Booking'],
  ['GET', '/bookings/slots/{event_id}', 'bookings', 'get-event-slots', 'GET Get Open Slots for an Event Type'],
  ['POST', '/bookings/create/{event_id}', 'bookings', 'create-booking', 'POST Create a Booking for an Event Type'],
  ['GET', '/bookings/reschedule/{event_id}/{id}/slots', 'bookings', 'get-reschedule-slots', 'GET Get Open Slots to Reschedule a Booking'],
  ['POST', '/bookings/reschedule/{event_id}/{id}', 'bookings', 'reschedule-booking', 'POST Reschedule a Booking'],

  // ---- availability (schedules of working hours; AvailabilityPolicy)
  ['GET', '/availability', 'availability', 'list-availability-schedules', 'GET List Availability Schedules'],
  ['POST', '/availability', 'availability', 'create-availability-schedule', 'POST Create Availability Schedule'],
  ['GET', '/availability/{schedule_id}', 'availability', 'get-availability-schedule', 'GET Get Availability Schedule'],
  ['GET', '/availability/{schedule_id}/usages', 'availability', 'get-availability-schedule-usages', 'GET Get Availability Schedule Usages'],
  ['POST', '/availability/{schedule_id}', 'availability', 'update-availability-schedule', 'POST Update Availability Schedule'],
  ['POST', '/availability/{schedule_id}/update-title', 'availability', 'update-availability-schedule-title', 'POST Rename Availability Schedule'],
  ['POST', '/availability/{schedule_id}/update-status', 'availability', 'update-availability-schedule-default', 'POST Update an Availability Schedule\'s Default Status'],
  ['POST', '/availability/{schedule_id}/clone', 'availability', 'clone-availability-schedule', 'POST Clone Availability Schedule'],
  ['DELETE', '/availability/{schedule_id}', 'availability', 'delete-availability-schedule', 'DELETE Delete Availability Schedule'],

  // ---- integrations (global connections) and calendar-integrations (per calendar; Pro)
  ['GET', '/integrations', 'integrations', 'list-integrations', 'GET List Global Integrations'],
  ['POST', '/integrations', 'integrations', 'save-integration', 'POST Update Global Integration Settings'],
  ['GET', '/integrations/{host_id}/settings', 'integrations', 'get-host-integration-settings', 'GET Get a Host\'s Integration Settings'],
  ['POST', '/integrations/{host_id}/settings', 'integrations', 'save-host-integration-settings', 'POST Save a Host\'s Integration Settings'],
  ['POST', '/integrations/{host_id}/disconnect', 'integrations', 'disconnect-host-integration', 'POST Disconnect (revoke) a Host\'s Integration'],
  ['GET', '/integrations/menu', 'integrations', 'get-integrations-menu', 'GET Get the Integrations Menu'],
  ['GET', '/integrations/zoom/connected-users', 'integrations', 'list-zoom-users', 'GET List Connected Zoom Accounts'],
  ['POST', '/integrations/zoom/save-user-account', 'integrations', 'save-zoom-account', 'POST Connect a Zoom Account'],
  ['POST', '/integrations/zoom/disconnect', 'integrations', 'disconnect-zoom-account', 'POST Disconnect a Zoom Account'],
  ['GET', '/calendars/{id}/integrations/remote-calendars', 'calendar-integrations', 'list-remote-calendars', 'GET List a Calendar\'s Connected Remote Calendars (Google, Outlook, CalDAV)'],
  ['POST', '/calendars/{id}/integrations/remote-calendars/patch-conflicts', 'calendar-integrations', 'update-remote-calendar-conflicts', 'POST Patch Remote Calendar Conflict Settings'],
  ['POST', '/calendars/{id}/integrations/remote-calendars/patch-settings', 'calendar-integrations', 'update-remote-calendar-settings', 'POST Patch Remote Calendar Additional Settings'],
  ['POST', '/calendars/{id}/integrations/remote-calendars/sync-settings', 'calendar-integrations', 'update-remote-calendar-sync', 'POST Sync Remote Calendar Settings'],
  ['POST', '/calendars/{id}/integrations/remote-calendars/disconnect-calendar', 'calendar-integrations', 'disconnect-remote-calendar', 'POST Disconnect a Remote Calendar'],
  ['POST', '/calendars/{id}/integrations/remote-calendars/cal-dav-auth', 'calendar-integrations', 'add-caldav-credential', 'POST Connect a CalDAV Calendar'],
  ['GET', '/calendars/{id}/integrations/zoom-connection', 'calendar-integrations', 'get-calendar-zoom-connection', 'GET Get a Calendar\'s Zoom Connection'],
  ['POST', '/calendars/{id}/integrations/zoom-connection/add', 'calendar-integrations', 'add-calendar-zoom-connection', 'POST Connect Zoom to a Calendar'],
  ['POST', '/calendars/{id}/integrations/zoom-connection/disconnect', 'calendar-integrations', 'disconnect-calendar-zoom-connection', 'POST Disconnect Zoom from a Calendar'],
  ['GET', '/calendars/{id}/integrations/general_integration_feed', 'calendar-integrations', 'get-calendar-integration-feed', 'GET Get a Calendar\'s General Integration Feed'],
  ['POST', '/calendars/{id}/integrations/general_integration_feed/disconnect', 'calendar-integrations', 'disconnect-calendar-integration-feed', 'POST Disconnect a Calendar\'s General Integration Feed'],

  // ---- payments (Pro, apart from reading an event's payment settings)
  ['GET', '/calendars/{id}/events/{event_id}/payment-settings', 'payments', 'get-event-payment-settings', 'GET Get Event Type Payment Settings'],
  ['POST', '/calendars/{id}/events/{event_id}/payment-settings', 'payments', 'update-event-payment-settings', 'POST Update Event Type Payment Settings'],
  ['PUT', '/schedules/{id}/transactions/{transaction_id}', 'payments', 'update-booking-transaction', 'PUT Update a Booking\'s Payment Transaction'],
  ['GET', '/integrations/settings/payment-methods/all', 'payments', 'list-payment-methods', 'GET List Payment Methods'],
  ['GET', '/integrations/settings/payment-methods', 'payments', 'get-payment-method-settings', 'GET Get Payment Method Settings'],
  ['POST', '/integrations/settings/payment-methods', 'payments', 'save-payment-method-settings', 'POST Save Payment Method Settings'],
  ['GET', '/integrations/settings/payment-methods/connect/info', 'payments', 'get-payment-connect-info', 'GET Get Payment Method Connection Info'],
  ['POST', '/integrations/settings/payment-methods/disconnect', 'payments', 'disconnect-payment-method', 'POST Disconnect a Payment Method'],
  ['GET', '/integrations/settings/payment-methods/currencies', 'payments', 'list-currencies', 'GET List Currencies'],
  ['GET', '/integrations/options/woo-products', 'payments', 'list-woo-products', 'GET List WooCommerce Products'],

  // ---- settings (SettingsPolicy, PlatformPolicy, SuperAdminPolicy)
  ['GET', '/settings/general', 'settings', 'get-general-settings', 'GET Get General Settings'],
  ['POST', '/settings/general', 'settings', 'save-general-settings', 'POST Save General Settings'],
  ['POST', '/settings/payment', 'settings', 'save-payment-settings', 'POST Save Global Payment Settings'],
  ['POST', '/settings/theme', 'settings', 'save-theme-settings', 'POST Save Theme Settings'],
  ['GET', '/settings/menu', 'settings', 'get-settings-menu', 'GET Get the Settings Menu'],
  ['GET', '/settings/global-modules', 'settings', 'get-global-modules', 'GET Get Global Modules (feature switches)'],
  ['POST', '/settings/global-modules', 'settings', 'save-global-modules', 'POST Save Global Modules (feature switches)'],
  ['GET', '/settings/pages', 'settings', 'list-pages', 'GET List WordPress Pages'],
  ['POST', '/settings/addons-settings', 'settings', 'save-addons-settings', 'POST Save Add-on Settings'],
  ['POST', '/settings/install-plugin', 'settings', 'install-plugin', 'POST Install Plugin'],
  ['POST', '/settings/optin', 'settings', 'save-optin', 'POST Update Opt-in'],
  ['GET', '/settings/mcp', 'settings', 'get-mcp-settings', 'GET Get the Site-side MCP Settings'],
  ['POST', '/settings/mcp', 'settings', 'save-mcp-settings', 'POST Save the Site-side MCP Settings'],
  ['POST', '/settings/mcp/install-adapter', 'settings', 'install-mcp-adapter', 'POST Install the MCP Adapter Plugin'],
  ['GET', '/settings/team', 'settings', 'list-team-members', 'GET List Team Members'],
  ['POST', '/settings/team', 'settings', 'update-team-member', 'POST Update a Team Member\'s Permissions'],
  ['DELETE', '/settings/team/{id}', 'settings', 'delete-team-member', 'DELETE Remove a Team Member'],
  ['GET', '/settings/spam-protection', 'settings', 'get-spam-protection', 'GET Get Spam Protection Settings'],
  ['POST', '/settings/spam-protection', 'settings', 'save-spam-protection', 'POST Save Spam Protection Settings'],
  ['POST', '/settings/spam-protection/verify-keys', 'settings', 'verify-spam-protection-keys', 'POST Verify Spam Protection (captcha) Keys'],
  ['GET', '/settings/license', 'settings', 'get-license', 'GET Get the Pro License Status'],
  ['POST', '/settings/license', 'settings', 'save-license', 'POST Save the Pro License'],
  ['DELETE', '/settings/license', 'settings', 'deactivate-license', 'DELETE Deactivate the Pro License'],

  // ---- admin (hosts; AdminPolicy)
  ['GET', '/admin/remaining-hosts', 'admin', 'list-remaining-hosts', 'GET List Remaining Hosts'],
  ['GET', '/admin/other-hosts', 'admin', 'list-other-hosts', 'GET List Other Hosts'],
  ['GET', '/admin/all-hosts', 'admin', 'list-all-hosts', 'GET List All Hosts'],

  // ---- reports (read-only)
  ['GET', '/reports', 'reports', 'get-reports', 'GET Get Booking Report Totals (startTime and endTime together)'],
  ['GET', '/reports/graph-reports', 'reports', 'get-graph-reports', 'GET Get Booking Graph Data (date_range[])'],
  ['GET', '/reports/activities', 'reports', 'list-activities', 'GET List the Latest 100 Booking Activities'],
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
    if (!rel) continue;
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
const outDir = 'docs/api-reference/fluentbooking';
fs.mkdirSync(outDir, { recursive: true });
const existing = fs.existsSync(`${outDir}/endpoints.json`)
  ? JSON.parse(fs.readFileSync(`${outDir}/endpoints.json`, 'utf8'))
  : undefined;

const inventory = {
  product: 'fluentbooking',
  source: 'https://developers.fluentbooking.com/rest-api/ module pages (free + Pro, FluentBooking 2.6.0), checked against the live REST route index when run with a site',
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
const unchanged =
  existing && JSON.stringify({ ...existing, scraped: '' }) === JSON.stringify({ ...inventory, scraped: '' });
if (unchanged) {
  console.log(`${outDir}/endpoints.json unchanged (${OPS.length} operations) — not restamped`);
} else {
  fs.writeFileSync(`${outDir}/endpoints.json`, JSON.stringify(inventory, null, 2) + '\n');
  console.log(`${outDir}/endpoints.json written (${OPS.length} operations)`);
}

const groups = [...new Set(OPS.map(([, , g]) => g))];
const lines = [
  '# FluentBooking REST API reference',
  '',
  '**Generated** by `scripts/gen-fluentbooking-docs.mjs` — do not edit by hand.',
  '',
  'Curated from the module pages of <https://developers.fluentbooking.com/rest-api/>',
  '(no OpenAPI specs). Request bodies are documented per operation there; they',
  'mirror what the FluentBooking admin sends, so read a record first',
  '(`detail:"full"`) and mirror its shape.',
  '',
  `- Base URL: \`https://{website}/wp-json/${NAMESPACE}\``,
  '- Auth: WordPress Application Passwords over HTTP Basic (documented for',
  '  admin, settings and server-to-server calls; capability-checked per route',
  '  policy). See [`api-reference/auth.md`](../auth.md).',
  '- Paths use real HTTP methods. (The admin UI sends PUT and DELETE as POST',
  '  with `X-HTTP-Method-Override`; WordPress accepts either.)',
  '- "schedules" are booked meetings; "availability" is working-hours',
  '  schedules; "events" are event types (what people book).',
  '- Pro (404 without FluentBooking Pro): event assignments, advanced and',
  '  recurring settings, available slots and Pro availability, booking notes,',
  '  team, spam protection and license settings, per-host and Zoom',
  '  integrations, calendar integrations, SMS and webhooks, and payments',
  '  (except reading an event\'s payment settings).',
  '',
];
for (const g of groups) {
  lines.push(`## ${g}`, '', '| Method | Path | Summary |', '|---|---|---|');
  for (const [method, path, group, , summary] of OPS) {
    if (group === g) lines.push(`| ${method} | \`${path}\` | ${summary.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/, '')} |`);
  }
  lines.push('');
}
fs.writeFileSync('docs/api-reference/fluentbooking.md', lines.join('\n'));
console.log('docs/api-reference/fluentbooking.md written');
