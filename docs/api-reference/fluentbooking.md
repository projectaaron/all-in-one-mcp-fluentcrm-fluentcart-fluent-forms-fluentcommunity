# FluentBooking REST API reference

**Generated** by `scripts/gen-fluentbooking-docs.mjs` — do not edit by hand.

Curated from the module pages of <https://developers.fluentbooking.com/rest-api/>
(no OpenAPI specs). Request bodies are documented per operation there; they
mirror what the FluentBooking admin sends, so read a record first
(`detail:"full"`) and mirror its shape.

- Base URL: `https://{website}/wp-json/fluent-booking/v2`
- Auth: WordPress Application Passwords over HTTP Basic (documented for
  admin, settings and server-to-server calls; capability-checked per route
  policy). See [`api-reference/auth.md`](../auth.md).
- Paths use real HTTP methods. (The admin UI sends PUT and DELETE as POST
  with `X-HTTP-Method-Override`; WordPress accepts either.)
- "schedules" are booked meetings; "availability" is working-hours
  schedules; "events" are event types (what people book).
- Pro (404 without FluentBooking Pro): event assignments, advanced and
  recurring settings, available slots and Pro availability, booking notes,
  team, spam protection and license settings, per-host and Zoom
  integrations, calendar integrations, SMS and webhooks, and payments
  (except reading an event's payment settings).

## calendars

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars` | List Calendars |
| POST | `/calendars` | Create Calendar |
| POST | `/calendars/check-slug` | Check a Calendar Slug Is Available |
| GET | `/calendars/location-fields` | Get Event Location Field Options |
| GET | `/calendars/{id}` | Get Calendar |
| POST | `/calendars/{id}` | Update Calendar |
| DELETE | `/calendars/{id}` | Delete Calendar |
| POST | `/calendars/{id}/events` | Create an Event Type in a Calendar |
| GET | `/calendars/{id}/event-schema` | Get the New Event Type Schema |
| POST | `/calendars/{id}/event-order` | Save the Order of a Calendar's Event Types |
| POST | `/calendars/{id}/clone-event/{event_id}` | Clone an Event Type (optionally into another calendar) |

## sharing

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/sharing-settings` | Get Calendar Sharing and Landing Page Settings |
| POST | `/calendars/{id}/sharing-settings` | Save Calendar Sharing and Landing Page Settings |

## events

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/events/{event_id}` | Get Event Type |
| PUT | `/calendars/{id}/events/{event_id}` | Patch Event Type (e.g. status) |
| DELETE | `/calendars/{id}/events/{event_id}` | Delete Event Type |
| GET | `/events/{event_id}` | Get Event Type by ID (no calendar needed) |

## event-settings

| Method | Path | Summary |
|---|---|---|
| POST | `/calendars/{id}/events/{event_id}/details` | Update Event Type Details (title, duration, status, location, description) |
| POST | `/calendars/{id}/events/{event_id}/limits` | Update Event Type Limits (buffers, slot interval, booking frequency and duration, timezone lock) |
| POST | `/calendars/{id}/events/{event_id}/assignments` | Update Event Type Host Assignments |
| POST | `/calendars/{id}/events/{event_id}/advanced-settings` | Update Event Type Advanced Settings |
| POST | `/calendars/{id}/events/{event_id}/recurring-settings` | Update Event Type Recurring Settings |

## booking-fields

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/events/{event_id}/booking-fields` | Get Event Type Booking Form Fields |
| POST | `/calendars/{id}/events/{event_id}/booking-fields` | Save Event Type Booking Form Fields |

## event-availability

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/events/{event_id}/availability` | Get Event Type Availability Settings |
| POST | `/calendars/{id}/events/{event_id}/availability` | Update Event Type Availability Settings |
| GET | `/calendars/{id}/events/{event_id}/event-available-slots` | Get Event Type Available Slots |
| POST | `/calendars/{id}/events/{event_id}/event-availability` | Update Event Type Availability (Pro schedule options) |

## event-notifications

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/events/{event_id}/email-notifications` | Get Event Type Email Notifications |
| POST | `/calendars/{id}/events/{event_id}/email-notifications` | Save Event Type Email Notifications |
| POST | `/calendars/{id}/events/{event_id}/email-notifications/clone` | Copy Email Notifications from Another Event Type |

## webhooks-sms

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/events/{event_id}/sms-notifications` | Get Event Type SMS Notifications |
| POST | `/calendars/{id}/events/{event_id}/sms-notifications` | Save Event Type SMS Notifications |
| POST | `/calendars/{id}/events/{event_id}/sms-notifications/clone` | Copy SMS Notifications from Another Event Type |
| GET | `/calendars/{id}/events/{event_id}/webhooks` | List Event Type Webhook Feeds |
| POST | `/calendars/{id}/events/{event_id}/webhooks` | Save an Event Type Webhook Feed |
| POST | `/calendars/{id}/events/{event_id}/webhooks/clone` | Copy Webhook Feeds from Another Event Type |
| DELETE | `/calendars/{id}/events/{event_id}/webhooks/{webhook_id}` | Delete an Event Type Webhook Feed |

## event-integrations

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/events/{event_id}/integrations` | List Event Type Integration Feeds |
| POST | `/calendars/{id}/events/{event_id}/integrations/clone` | Copy Integration Feeds from Another Event Type |
| GET | `/calendars/{id}/events/{event_id}/integrations/{integration_id}` | Get an Event Type Integration Feed |
| POST | `/calendars/{id}/events/{event_id}/integrations/{integration_id}` | Save an Event Type Integration Feed |
| DELETE | `/calendars/{id}/events/{event_id}/integrations/{integration_id}` | Delete an Event Type Integration Feed |
| GET | `/calendars/{id}/events/{event_id}/integrations/{integration_id}/merge-fields` | Get an Integration's Merge Fields |
| GET | `/calendars/{id}/events/{event_id}/integrations/{integration_id}/config-field-options` | Get an Integration's Config Field Options |
| POST | `/calendars/{id}/events/{event_id}/integrations/{integration_id}/crm-taxonomy` | Create a CRM Taxonomy for an Integration Feed |

## schedules

| Method | Path | Summary |
|---|---|---|
| GET | `/schedules` | List Bookings (booked meetings) |
| GET | `/schedules/export` | Export Bookings |
| GET | `/schedules/crm-contact-prefill` | Get FluentCRM Contact Prefill for a New Booking |
| GET | `/schedules/crm-contact-search` | Search FluentCRM Contacts |
| GET | `/schedules/{id}` | Get Booking |
| PUT | `/schedules/{id}` | Patch Booking |
| DELETE | `/schedules/{id}` | Delete Booking |
| GET | `/schedules/{id}/activities` | Get Booking Activity Log |
| GET | `/schedules/{id}/meta-info` | Get Booking Meta Info |
| GET | `/schedules/{id}/crm-contact` | Get the Booking's FluentCRM Contact |
| GET | `/schedules/{id}/crm-options` | Get FluentCRM Tag and List Options for a Booking |
| POST | `/schedules/{id}/crm-contact/tags` | Update the Booking Contact's FluentCRM Tags |
| POST | `/schedules/{id}/crm-contact/lists` | Update the Booking Contact's FluentCRM Lists |
| POST | `/schedules/{id}/send-confirmation-email` | Send the Booking Confirmation Email |
| GET | `/schedules/group-bookings/{group_id}/attendees` | List a Group Booking's Attendees |
| GET | `/schedules/{id}/notes` | List Booking Notes |
| POST | `/schedules/{id}/notes` | Add a Booking Note |
| PUT | `/schedules/{id}/notes/{note_id}` | Update a Booking Note |
| DELETE | `/schedules/{id}/notes/{note_id}` | Delete a Booking Note |

## bookings

| Method | Path | Summary |
|---|---|---|
| GET | `/bookings` | Get Bookings (Bookings module index) |
| GET | `/bookings/event/{event_id}` | Get an Event Type for Booking |
| GET | `/bookings/slots/{event_id}` | Get Open Slots for an Event Type |
| POST | `/bookings/create/{event_id}` | Create a Booking for an Event Type |
| GET | `/bookings/reschedule/{event_id}/{id}/slots` | Get Open Slots to Reschedule a Booking |
| POST | `/bookings/reschedule/{event_id}/{id}` | Reschedule a Booking |

## availability

| Method | Path | Summary |
|---|---|---|
| GET | `/availability` | List Availability Schedules |
| POST | `/availability` | Create Availability Schedule |
| GET | `/availability/{schedule_id}` | Get Availability Schedule |
| GET | `/availability/{schedule_id}/usages` | Get Availability Schedule Usages |
| POST | `/availability/{schedule_id}` | Update Availability Schedule |
| POST | `/availability/{schedule_id}/update-title` | Rename Availability Schedule |
| POST | `/availability/{schedule_id}/update-status` | Update an Availability Schedule's Default Status |
| POST | `/availability/{schedule_id}/clone` | Clone Availability Schedule |
| DELETE | `/availability/{schedule_id}` | Delete Availability Schedule |

## integrations

| Method | Path | Summary |
|---|---|---|
| GET | `/integrations` | List Global Integrations |
| POST | `/integrations` | Update Global Integration Settings |
| GET | `/integrations/{host_id}/settings` | Get a Host's Integration Settings |
| POST | `/integrations/{host_id}/settings` | Save a Host's Integration Settings |
| POST | `/integrations/{host_id}/disconnect` | Disconnect (revoke) a Host's Integration |
| GET | `/integrations/menu` | Get the Integrations Menu |
| GET | `/integrations/zoom/connected-users` | List Connected Zoom Accounts |
| POST | `/integrations/zoom/save-user-account` | Connect a Zoom Account |
| POST | `/integrations/zoom/disconnect` | Disconnect a Zoom Account |

## calendar-integrations

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/integrations/remote-calendars` | List a Calendar's Connected Remote Calendars (Google, Outlook, CalDAV) |
| POST | `/calendars/{id}/integrations/remote-calendars/patch-conflicts` | Patch Remote Calendar Conflict Settings |
| POST | `/calendars/{id}/integrations/remote-calendars/patch-settings` | Patch Remote Calendar Additional Settings |
| POST | `/calendars/{id}/integrations/remote-calendars/sync-settings` | Sync Remote Calendar Settings |
| POST | `/calendars/{id}/integrations/remote-calendars/disconnect-calendar` | Disconnect a Remote Calendar |
| POST | `/calendars/{id}/integrations/remote-calendars/cal-dav-auth` | Connect a CalDAV Calendar |
| GET | `/calendars/{id}/integrations/zoom-connection` | Get a Calendar's Zoom Connection |
| POST | `/calendars/{id}/integrations/zoom-connection/add` | Connect Zoom to a Calendar |
| POST | `/calendars/{id}/integrations/zoom-connection/disconnect` | Disconnect Zoom from a Calendar |
| GET | `/calendars/{id}/integrations/general_integration_feed` | Get a Calendar's General Integration Feed |
| POST | `/calendars/{id}/integrations/general_integration_feed/disconnect` | Disconnect a Calendar's General Integration Feed |

## payments

| Method | Path | Summary |
|---|---|---|
| GET | `/calendars/{id}/events/{event_id}/payment-settings` | Get Event Type Payment Settings |
| POST | `/calendars/{id}/events/{event_id}/payment-settings` | Update Event Type Payment Settings |
| PUT | `/schedules/{id}/transactions/{transaction_id}` | Update a Booking's Payment Transaction |
| GET | `/integrations/settings/payment-methods/all` | List Payment Methods |
| GET | `/integrations/settings/payment-methods` | Get Payment Method Settings |
| POST | `/integrations/settings/payment-methods` | Save Payment Method Settings |
| GET | `/integrations/settings/payment-methods/connect/info` | Get Payment Method Connection Info |
| POST | `/integrations/settings/payment-methods/disconnect` | Disconnect a Payment Method |
| GET | `/integrations/settings/payment-methods/currencies` | List Currencies |
| GET | `/integrations/options/woo-products` | List WooCommerce Products |

## settings

| Method | Path | Summary |
|---|---|---|
| GET | `/settings/general` | Get General Settings |
| POST | `/settings/general` | Save General Settings |
| POST | `/settings/payment` | Save Global Payment Settings |
| POST | `/settings/theme` | Save Theme Settings |
| GET | `/settings/menu` | Get the Settings Menu |
| GET | `/settings/global-modules` | Get Global Modules (feature switches) |
| POST | `/settings/global-modules` | Save Global Modules (feature switches) |
| GET | `/settings/pages` | List WordPress Pages |
| POST | `/settings/addons-settings` | Save Add-on Settings |
| POST | `/settings/install-plugin` | Install Plugin |
| POST | `/settings/optin` | Update Opt-in |
| GET | `/settings/mcp` | Get the Site-side MCP Settings |
| POST | `/settings/mcp` | Save the Site-side MCP Settings |
| POST | `/settings/mcp/install-adapter` | Install the MCP Adapter Plugin |
| GET | `/settings/team` | List Team Members |
| POST | `/settings/team` | Update a Team Member's Permissions |
| DELETE | `/settings/team/{id}` | Remove a Team Member |
| GET | `/settings/spam-protection` | Get Spam Protection Settings |
| POST | `/settings/spam-protection` | Save Spam Protection Settings |
| POST | `/settings/spam-protection/verify-keys` | Verify Spam Protection (captcha) Keys |
| GET | `/settings/license` | Get the Pro License Status |
| POST | `/settings/license` | Save the Pro License |
| DELETE | `/settings/license` | Deactivate the Pro License |

## admin

| Method | Path | Summary |
|---|---|---|
| GET | `/admin/remaining-hosts` | List Remaining Hosts |
| GET | `/admin/other-hosts` | List Other Hosts |
| GET | `/admin/all-hosts` | List All Hosts |

## reports

| Method | Path | Summary |
|---|---|---|
| GET | `/reports` | Get Booking Report Totals (startTime and endTime together) |
| GET | `/reports/graph-reports` | Get Booking Graph Data (date_range[]) |
| GET | `/reports/activities` | List the Latest 100 Booking Activities |
