# WP Social Ninja REST API reference

**Generated** by `scripts/gen-wpsocialninja-docs.mjs` — do not edit by hand.

WP Social Ninja (plugin slug `wp-social-reviews`, plus its Pro add-on) publishes
no developer docs site, so this inventory is captured from the live REST route
index (`GET /wp-json/wpsocialreviews/v2`) and curated here. Request/response body
shapes are not documented upstream: they mirror the payloads the wp-admin UI
sends, so when in doubt read a record first (`detail:"full"`) and mirror its shape.

- Base URL: `https://{website}/wp-json/wpsocialreviews/v2`
- Auth: WordPress Application Passwords over HTTP Basic (admin routes return
  standard `rest_forbidden` 401s to anonymous callers — capability-checked like
  the Fluent products; see [`api-reference/auth.md`](./api-reference/auth.md)).
- `/pro/…` routes require WP Social Ninja Pro to be active.

## reviews

| Method | Path | Summary |
|---|---|---|
| GET | `/reviews` | List Reviews |
| POST | `/reviews` | Create Review |
| DELETE | `/reviews` | Delete Reviews |
| PUT | `/reviews/{id}` | Update Review |
| POST | `/reviews/duplicate` | Duplicate Review |
| PUT | `/reviews/status-update` | Update Review Statuses |
| PUT | `/reviews/spam` | Mark Reviews as Spam |
| PUT | `/reviews/bulk-category` | Bulk Assign Review Category |
| GET | `/reviews/categories` | List Review Categories |
| PUT | `/reviews/categories/{id}` | Update Review Category |
| DELETE | `/reviews/categories/{id}` | Delete Review Category |

## testimonials

| Method | Path | Summary |
|---|---|---|
| GET | `/testimonials` | List Testimonials |
| POST | `/testimonials` | Create Testimonial |
| DELETE | `/testimonials` | Delete Testimonials |
| PUT | `/testimonials/{id}` | Update Testimonial |
| POST | `/testimonials/duplicate` | Duplicate Testimonial |
| PUT | `/testimonials/status-update` | Update Testimonial Statuses |
| PUT | `/testimonials/spam` | Mark Testimonials as Spam |
| PUT | `/testimonials/bulk-category` | Bulk Assign Testimonial Category |
| GET | `/testimonials/categories` | List Testimonial Categories |
| PUT | `/testimonials/categories/{id}` | Update Testimonial Category |
| DELETE | `/testimonials/categories/{id}` | Delete Testimonial Category |

## templates

| Method | Path | Summary |
|---|---|---|
| GET | `/templates` | List Templates |
| POST | `/templates` | Create Template |
| DELETE | `/templates` | Delete Templates |
| POST | `/templates/duplicate` | Duplicate Template |
| PUT | `/templates/title/{id}` | Update Template Title |
| GET | `/templates/meta/reviews/{id}` | Get Reviews Template Meta |
| PUT | `/templates/meta/reviews/{id}` | Update Reviews Template Meta |
| POST | `/templates/meta/reviews/{id}/edit` | Edit Reviews Template |
| POST | `/templates/meta/reviews/{id}/load-more` | Load More Template Reviews |
| GET | `/templates/meta/reviews/{id}/can-enable-ai-summary` | Can Enable AI Summary |
| GET | `/templates/meta/reviews/{id}/first-round/{isFirstRound}` | Get Reviews Template (First Round) |
| GET | `/templates/meta/feeds/{id}` | Get Feed Template Meta |
| PUT | `/templates/meta/feeds/{id}` | Update Feed Template Meta |
| POST | `/templates/meta/feeds/{id}/edit` | Edit Feed Template |

## platforms

| Method | Path | Summary |
|---|---|---|
| GET | `/platforms` | List Platforms |
| GET | `/platforms/enabled` | List Enabled Platforms |
| GET | `/platforms/get-statuses` | Get Platform Statuses |
| POST | `/platforms/update-statuses` | Update Platform Statuses |
| POST | `/platforms/addons` | Update Platform Addons |
| POST | `/platforms/subscribe` | Subscribe to Platform Updates |
| GET | `/platforms/dashboard-notices` | Get Dashboard Notices |
| POST | `/platforms/dashboard-notices` | Update Dashboard Notices |
| GET | `/platforms/reviews/configs` | Get Review Platform Configs |
| POST | `/platforms/reviews/configs` | Save Review Platform Config |
| DELETE | `/platforms/reviews/configs` | Delete Review Platform Config |
| POST | `/platforms/reviews/configs/prepare` | Prepare Review Platform Connect |
| POST | `/platforms/reviews/configs/consume` | Consume Review Platform Connect |
| POST | `/platforms/reviews/configs/manually-sync-reviews` | Manually Sync Platform Reviews |
| POST | `/platforms/reviews` | Fetch Platform Reviews |
| GET | `/platforms/feeds/configs` | Get Feed Platform Configs |
| POST | `/platforms/feeds/configs` | Save Feed Platform Config |
| DELETE | `/platforms/feeds/configs` | Delete Feed Platform Config |
| POST | `/platforms/feeds/configs/prepare` | Prepare Feed Platform Connect |
| POST | `/platforms/feeds/configs/consume` | Consume Feed Platform Connect |

## chat-widgets

| Method | Path | Summary |
|---|---|---|
| GET | `/chat-widgets` | List Chat Widgets |
| POST | `/chat-widgets` | Create Chat Widget |
| PUT | `/chat-widgets` | Update Chat Widget Statuses |
| DELETE | `/chat-widgets` | Delete Chat Widgets |
| POST | `/chat-widgets/duplicate` | Duplicate Chat Widget |
| GET | `/chat-widgets/meta/chats/{id}` | Get Chat Widget Meta |
| PUT | `/chat-widgets/meta/chats/{id}` | Update Chat Widget Meta |
| DELETE | `/chat-widgets/meta/chats/{id}/edit` | Reset Chat Widget Meta |

## notifications

| Method | Path | Summary |
|---|---|---|
| GET | `/notifications` | List Notifications |
| POST | `/notifications` | Create Notification |
| PUT | `/notifications` | Update Notification |
| DELETE | `/notifications` | Delete Notifications |
| POST | `/notifications/duplicate` | Duplicate Notification |

## shoppable

| Method | Path | Summary |
|---|---|---|
| GET | `/shoppable` | Get Shoppable Feed |
| PUT | `/shoppable` | Update Shoppable Feed |
| DELETE | `/shoppable` | Delete Shoppable Feed |
| GET | `/shoppable/posts` | List Shoppable Posts |
| PUT | `/shoppable/template-settings/{id}` | Update Shoppable Template Settings |

## settings

| Method | Path | Summary |
|---|---|---|
| GET | `/settings` | Get Global Settings |
| PUT | `/settings` | Save Global Settings |
| DELETE | `/settings` | Delete Global Settings |
| GET | `/settings/advance-settings` | Get Advanced Settings |
| POST | `/settings/advance-settings` | Save Advanced Settings |
| GET | `/settings/translations` | Get Translations |
| POST | `/settings/translations` | Save Translations |
| GET | `/settings/license` | Get License |
| POST | `/settings/license` | Activate License |
| DELETE | `/settings/license` | Deactivate License |
| DELETE | `/settings/twitter-card` | Delete Twitter Card Connection |
| DELETE | `/settings/reset-images` | Reset Cached Images |
| DELETE | `/settings/reset-error-log` | Reset Error Log |
| DELETE | `/settings/delete-all-data` | Delete All Plugin Data |
| GET | `/pages/search` | Search Site Pages |
| GET | `/pro/settings/managers` | List Managers |
| POST | `/pro/settings/managers` | Add Manager |
| PUT | `/pro/settings/managers` | Update Manager |
| DELETE | `/pro/settings/managers/{id}` | Delete Manager |

## onboarding

| Method | Path | Summary |
|---|---|---|
| GET | `/onboarding` | Get Onboarding State |
| POST | `/onboarding` | Save Onboarding Step |
| GET | `/onboarding/config` | Get Onboarding Config |
| POST | `/onboarding/skip` | Skip Onboarding |

## collection

| Method | Path | Summary |
|---|---|---|
| GET | `/pro/review-forms` | List Review Forms |
| POST | `/pro/review-forms` | Create Review Form |
| DELETE | `/pro/review-forms` | Delete Review Forms |
| GET | `/pro/review-forms/{id}` | Get Review Form |
| PUT | `/pro/review-forms/{id}` | Update Review Form |
| POST | `/pro/review-forms/{id}/duplicate` | Duplicate Review Form |
| PUT | `/pro/review-forms/status-update` | Update Review Form Statuses |
| GET | `/pro/custom-sources` | List Custom Sources |
| POST | `/pro/custom-sources` | Create Custom Source |
| DELETE | `/pro/custom-sources` | Delete Custom Sources |
| GET | `/pro/custom-sources/{id}` | Get Custom Source |
| POST | `/pro/custom-sources/{id}/settings` | Save Custom Source Settings |
| GET | `/pro/custom-sources/forms/templates` | List Custom Source Form Templates |
| GET | `/pro/settings/get-reviews/qr-code` | List Get-Reviews QR Codes |
| POST | `/pro/settings/get-reviews/qr-code` | Create Get-Reviews QR Code |
| PUT | `/pro/settings/get-reviews/qr-code/{id}` | Update Get-Reviews QR Code |
| DELETE | `/pro/settings/get-reviews/qr-code/{id}` | Delete Get-Reviews QR Code |
| GET | `/pro/settings/get-reviews/get-review-collection-platforms` | List Review Collection Platforms |
| GET | `/pro/settings/review-form-captcha` | Get Review Form Captcha |
| POST | `/pro/settings/review-form-captcha` | Save Review Form Captcha |
| DELETE | `/pro/settings/review-form-captcha` | Delete Review Form Captcha |
| GET | `/pro/settings/fluentcrm-review-tag` | Get FluentCRM Review Tag |
| POST | `/pro/settings/fluentcrm-review-tag` | Save FluentCRM Review Tag |
| POST | `/pro/settings/woocommerce/import-reviews` | Import WooCommerce Reviews |
| POST | `/pro/settings/woocommerce/restart-import-reviews` | Restart WooCommerce Review Import |
| GET | `/pro/settings/woocommerce/import-progress` | Get WooCommerce Import Progress |
| POST | `/pro/settings/woocommerce/quick-setup` | Quick Setup WooCommerce Reviews |
| POST | `/pro/settings/fluent-cart/quick-setup` | Quick Setup FluentCart Reviews |
| POST | `/pro/settings/fluent-cart/connect-all-products` | Connect All FluentCart Products |
