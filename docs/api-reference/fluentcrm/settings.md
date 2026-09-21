# FluentCRM API — Settings

41 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/setting/complete-installation`

**POST Complete Installation Wizard**

Complete the initial FluentCRM setup wizard. Optionally installs Fluent Forms and FluentCart, shares an opt-in email, and enables essential data sharing.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- `install_fluentform` (string) _(enum: `yes`, `no`; default: `no`)_ — Whether to install and activate Fluent Forms plugin.
- `install_fluentcart` (string) _(enum: `yes`, `no`; default: `no`)_ — Whether to install and activate FluentCart plugin.
- `optin_email` (string) _(format: email)_ — Email address for opt-in communications. Must be a valid email.
- `share_essentials` (string) _(enum: `yes`, `no`; default: `no`)_ — Whether to share essential usage data.

Example:

```json
{
  "install_fluentform": "yes",
  "install_fluentcart": "no",
  "optin_email": "admin@example.com",
  "share_essentials": "yes"
}
```


**Responses**

- **200** — Installation wizard completed successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Installation has been completed"
}
```



---

## POST `/setting/rest-keys`

**POST Create REST API Key**

Create a new WordPress application password for REST API access. The target user must have FluentCRM access, and the requesting user must have the `manage_options` capability. The generated password is returned only once in the response.

<!-- fc:access -->

**Required capability:** `manage_options`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::createRestKey()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `api_name` (string) **required** — A descriptive name for the API key.
- `api_user_id` (integer) **required** — WordPress user ID to create the API key for. User must have FluentCRM access.

Example:

```json
{
  "api_name": "FluentCRM Integration",
  "api_user_id": 5
}
```


**Responses**

- **200** — API key created successfully. The password is returned only once.

  Schema (`application/json`):

  - `item` (object)
    - `uuid` (string) — Application password UUID.
    - `name` (string) — API key name.
    - `created` (integer) — Unix timestamp of creation.
    - `info` (object)
      - `api_password` (string) — The generated application password (shown only once, in chunked format).
      - `api_username` (string) — WordPress username for authentication.
  - `message` (string)

  Example:

```json
{
  "item": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "FluentCRM Integration",
    "created": 1705312200,
    "info": {
      "api_password": "ABCD efgh 1234 IJKL mnop 5678",
      "api_username": "jane_smith"
    }
  },
  "message": "API Key has been successfully created"
}
```


- **403** — User lacks permission or target user does not have FluentCRM access.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error.

  Schema (`application/json`):

  - `errors` (object)
    - _(object)_

---

## DELETE `/setting/rest-keys`

**DELETE REST API Key**

Delete a WordPress application password used for REST API access. Requires the `manage_options` capability. The target user must have FluentCRM access.

<!-- fc:access -->

**Required capability:** `manage_options`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::deleteRestKey()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user_id` | integer | yes | WordPress user ID who owns the API key. |
| `uuid` | string | yes | UUID of the application password to delete. |


**Responses**

- **200** — API key deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "API Key has been successfully deleted"
}
```


- **403** — User lacks permission or target user does not have FluentCRM access.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error or deletion failed.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/setting/abandon-cart`

**GET Abandon Cart Settings**

Retrieve abandoned cart feature settings, available e-commerce providers, and provider-specific options. Returns settings for configuring abandoned cart tracking and recovery automations.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Abandoned cart settings and provider information.

  Schema (`application/json`):

  - `settings` (object) — Current abandoned cart settings.
    - `enabled` (string) _(enum: `yes`, `no`)_ — Whether abandoned cart tracking is enabled.
  - `available_providers` (array<object>) — List of available e-commerce providers that support abandoned cart tracking.
    - `slug` (string) — Provider slug identifier.
    - `label` (string) — Human-readable provider name.
    - `settings_fields` (array<object>) — Provider-specific settings form fields.
      - _(object)_
  - `fluent_cartOptions` (object)
    - _(object)_

  Example:

```json
{
  "settings": {
    "enabled": "no"
  },
  "available_providers": [
    {
      "slug": "woocommerce",
      "label": "WooCommerce",
      "settings_fields": []
    }
  ]
}
```



---

## GET `/setting/auto_subscribe_settings`

**GET Auto Subscribe Settings**

Retrieve auto-subscribe settings for user registration, comments, user syncing, and role-based tagging. Optionally includes form field definitions. When WooCommerce is active, also returns checkout form subscribe settings.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Include additional data. Use `fields` to include form field definitions for the settings UI. |


**Responses**

- **200** — Auto-subscribe settings for all subscription sources.

  Schema (`application/json`):

  - `registration_setting` (object) — Settings for auto-subscribing users on WordPress registration.
    - _(object)_
  - `comment_settings` (object) — Settings for auto-subscribing users when they comment.
    - _(object)_
  - `user_syncing_settings` (object) — Settings for syncing existing WordPress users.
    - _(object)_
  - `role_based_tagging_settings` (object) — Settings for applying tags based on WordPress user roles.
    - _(object)_
  - `registration_fields` (object) — Form field definitions for registration settings (only when `with[]=fields`). Field definitions for the registration-form opt-in.
    - _(object)_
  - `comment_fields` (object) — Form field definitions for comment settings (only when `with[]=fields`). Field definitions for the comment-form opt-in.
    - _(object)_
  - `user_syncing_fields` (object) — Form field definitions for user syncing settings (only when `with[]=fields`). Field definitions for WordPress user syncing.
    - _(object)_
  - `role_based_tagging_settings_fields` (object) — Form field definitions for role-based tagging (only when `with[]=fields`). Field definitions for role-based tagging.
    - _(object)_
  - `woo_checkout_fields` (object) — WooCommerce checkout subscribe form fields (only when WooCommerce is active). Present **only** when WooCommerce is active.
    - _(object)_
  - `woo_checkout_settings` (object) — WooCommerce checkout subscribe settings (only when WooCommerce is active). Present **only** when WooCommerce is active.
    - _(object)_
  - `date_time_settings` (object) — Date and time formatting options used by the opt-in screens.
    - _(object)_
  - `fluent_cart_checkout_settings` (object) — FluentCart checkout opt-in configuration. Present **only** when FluentCart is active.
    - _(object)_
  - `fluent_cart_checkout_fields` (object) — Field definitions for the FluentCart checkout opt-in form. Present **only** when FluentCart is active.
    - _(object)_

  Example:

```json
{
  "registration_setting": {
    "status": "no",
    "target_list": "",
    "target_tags": []
  },
  "comment_settings": {
    "status": "no",
    "target_list": "",
    "target_tags": []
  },
  "user_syncing_settings": {
    "status": "no"
  },
  "role_based_tagging_settings": {}
}
```



---

## GET `/setting/bounce_configs`

**GET Bounce Handler Configurations**

Retrieve bounce handler webhook URLs and configuration for all supported email service providers (Amazon SES, Mailgun, PostMark, SendGrid, SparkPost, Elastic Email, etc.). Also returns FluentSMTP configuration status if the plugin is installed.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Bounce handler configurations for all supported providers.

  Schema (`application/json`):

  - `bounce_settings` (object) — Map of provider slugs to their bounce handler configurations.
    - _(object)_
  - `fluentsmtp_info` (any)

  Example:

```json
{
  "bounce_settings": {
    "ses": {
      "label": "Amazon SES",
      "webhook_url": "https://example.com/index.php?fluentcrm=1&route=bounce_handler&provider=ses&verify_key=fcrm_abc123",
      "doc_url": "https://fluentcrm.com/docs/bounce-handler-with-amazon-ses/",
      "input_title": "Amazon SES Bounce Handler URL",
      "input_info": "Please use this bounce handler url in your Amazon SES + SNS settings"
    },
    "mailgun": {
      "label": "Mailgun",
      "webhook_url": "https://example.com/wp-json/fluent-crm/v2/public/bounce_handler/mailgun/handle/fcrm_abc123",
      "doc_url": "https://fluentcrm.com/docs/bounce-handling-with-mailgun/",
      "input_title": "Mailgun Bounce Handler Webhook URL",
      "input_info": "Please paste this URL into your Mailgun's Webhook settings to enable Bounce Handling with FluentCRM"
    }
  },
  "fluentsmtp_info": {
    "configured": true,
    "verified_senders": [
      "hello@example.com"
    ],
    "config_url": "https://example.com/wp-admin/options-general.php?page=fluent-mail#/connections"
  }
}
```



---

## GET `/setting/compliance`

**GET Compliance Settings**

Retrieve GDPR and data compliance settings. Controls behaviors like anonymizing data on unsubscribe, deleting contacts when WordPress users are deleted, and other privacy-related configurations.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Compliance settings returned successfully.

  Schema (`application/json`):

  - `settings` (object) — Key-value pairs of compliance settings. Values are typically 'yes', 'no', or 'anonymous'.
    - _(object)_

  Example:

```json
{
  "settings": {
    "delete_contact_on_user": "no",
    "anonymize_ip": "no",
    "anonymize_on_unsubscribe": "no"
  }
}
```



---

## GET `/setting/cron_status`

**GET Cron Status**

Retrieve the status of FluentCRM scheduled cron events and server information. Shows the next run time, whether events are overdue, and server memory/execution limits.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Cron event statuses and server info.

  Schema (`application/json`):

  - `cron_events` (array<object>)
    - `hook` (string) — WordPress cron hook name.
    - `is_overdue` (boolean) — Whether the event has missed its scheduled run time.
    - `human_name` (string) — Human-readable name for the cron task.
    - `next_run` (string) — Human-readable time until next run (e.g., '2 mins').
    - `interval` (integer) — Interval in seconds between runs.
  - `server` (object)
    - `memory_limit` (string) — PHP memory limit (e.g., '256MB').
    - `usage_percent` (number) — Current memory usage as a percentage.
    - `max_execution_time` (string) — PHP max execution time in seconds.
    - `has_server_cron` (boolean) — Whether WP_CRON is disabled (indicating a server-side cron is configured).

  Example:

```json
{
  "cron_events": [
    {
      "hook": "fluentcrm_scheduled_every_minute_tasks",
      "is_overdue": false,
      "human_name": "Scheduled Email Sending Tasks",
      "next_run": "30 secs",
      "interval": 60
    },
    {
      "hook": "fluentcrm_scheduled_hourly_tasks",
      "is_overdue": false,
      "human_name": "Scheduled Email Processing",
      "next_run": "3 mins",
      "interval": 300
    },
    {
      "hook": "fluentcrm_scheduled_hourly_tasks",
      "is_overdue": false,
      "human_name": "Scheduled Automation Tasks",
      "next_run": "45 mins",
      "interval": 3600
    }
  ],
  "server": {
    "memory_limit": "256MB",
    "usage_percent": 32.5,
    "max_execution_time": "60 seconds",
    "has_server_cron": true
  }
}
```



---

## GET `/setting/double-optin`

**GET Double Opt-in Settings**

Retrieve the double opt-in email settings. Can return global settings or list-specific settings when a `list_id` is provided. Optionally includes form field definitions when `with[]=settings_fields` is specified.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `list_id` | integer | no | List ID to retrieve list-specific double opt-in settings. Omit for global settings. |
| `with[]` | array<string> | no | Include additional data. Use `settings_fields` to include form field definitions for the settings UI. |


**Responses**

- **200** — Double opt-in settings returned successfully.

  Schema (`application/json`):

  - `settings` (object)
    - `design_template` (string) — Email design template identifier.
    - `email_subject` (string) — Double opt-in email subject line.
    - `email_pre_header` (string) — Email pre-header text.
    - `email_body` (string) — HTML email body. Must contain `#activate_link#` or `{{crm.activate_button}}`.
    - `after_confirmation_type` (string) _(enum: `message`, `redirect`)_ — Action after subscriber confirms.
    - `after_confirm_message` (string) — Message shown after confirmation (when type is `message`).
    - `after_conf_redirect_url` (string) — Redirect URL after confirmation (when type is `redirect`).
    - `tag_based_redirect` (string) _(enum: `yes`, `no`)_ — Enable tag-based redirect after confirmation.
    - `tag_redirects` (array<object>) — Tag-to-URL redirect mappings.
      - `field_key` (array<integer>) — Tag IDs to match.
      - `field_value` (string) — Redirect URL when tags match.
  - `global_double_optin` (string) _(enum: `yes`, `no`)_ — Whether global double opt-in is enabled for this list (only returned when list_id is provided). Present when a list context is supplied; reflects that list's `global_double_optin` meta, defaulting to `yes`.
  - `settings_fields` (object) — Form field definitions for the settings UI (only when `with[]=settings_fields`). Field definitions for rendering the settings form.
    - _(object)_

  Example:

```json
{
  "settings": {
    "design_template": "simple",
    "email_subject": "Please Confirm Your Subscription",
    "email_pre_header": "",
    "email_body": "<h2>Please confirm your subscription</h2><p>Click the button below to confirm.</p>{{crm.activate_button|Confirm Subscription}}",
    "after_confirmation_type": "message",
    "after_confirm_message": "<h2>Subscription Confirmed!</h2><p>Thank you for subscribing.</p>",
    "after_conf_redirect_url": "",
    "tag_based_redirect": "no",
    "tag_redirects": [
      {
        "field_key": [],
        "field_value": ""
      }
    ]
  }
}
```



---

## GET `/setting/experiments/campaigns`

**GET Experiment Campaigns**

Retrieve all campaigns sorted by ID in descending order. Used in the experimental settings UI to allow selecting campaigns for experimental features.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — List of all campaigns.

  Schema (`application/json`):

  - `campaigns` (array<object>)
    - `id` (integer) — Campaign ID.
    - `title` (string) — Campaign title.
    - `status` (string) — Campaign status.
    - `type` (string) — Campaign type.
    - `slug` (string)
    - `template_id` (integer,null)
    - `email_subject` (string,null)
    - `email_pre_header` (string,null)
    - `email_body` (string,null)
    - `design_template` (string,null)
    - `scheduled_at` (string,null) _(format: date-time)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "campaigns": [
    {
      "id": 10,
      "title": "Welcome Campaign",
      "status": "sent",
      "type": "campaign",
      "slug": "welcome-campaign",
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 12:00:00"
    }
  ]
}
```



---

## GET `/setting/experiments`

**GET Experimental Settings**

Retrieve experimental feature flags and settings. These control optional features like the company module, event tracking, activity logging, and other features that may be in beta or require explicit opt-in.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Experimental settings returned successfully.

  Schema (`application/json`):

  - `settings` (object) — Key-value pairs of experimental feature settings.
    - _(object)_

  Example:

```json
{
  "settings": {
    "company_module": "no",
    "event_tracking": "no",
    "activity_log": "no",
    "abandoned_cart": "no"
  }
}
```



---

## GET `/setting/integrations`

**GET Deep Integration Providers**

Retrieve all available deep integration providers (e.g., WooCommerce, Easy Digital Downloads). Integration providers are registered via the `fluentcrm_deep_integration_providers` filter. Optionally includes field definitions for each provider's settings form.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Include additional data. Use `fields` to include settings form field definitions for each provider. |


**Responses**

- **200** — List of available deep integration providers.

  Schema (`application/json`):

  - `integrations` (array<object>) — Array of deep integration provider configurations.
    - _(object)_

  Example:

```json
{
  "integrations": []
}
```



---

## GET `/setting/old_logs`

**GET Old Log Details**

Get counts of old log records that would be deleted. Previews the number of email history logs, email clicks, email opens, system logs, and activity logs older than the specified number of days.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `days_before` | integer | yes | Number of days. Logs older than this will be counted. Minimum 7 days. |
| `selected_logs[]` | array<string> | yes | Types of logs to count. |


**Responses**

- **200** — Log counts returned successfully.

  Schema (`application/json`):

  - `log_counts` (array<object>)
    - `title` (string) — Human-readable label for the log type.
    - `count` (integer) — Number of log records older than the specified days.

  Example:

```json
{
  "log_counts": [
    {
      "title": "Email History Logs",
      "count": 15420
    },
    {
      "title": "Email clicks",
      "count": 8320
    },
    {
      "title": "Email Opens",
      "count": 12500
    },
    {
      "title": "System Logs",
      "count": 340
    },
    {
      "title": "Activity Logs",
      "count": 1200
    }
  ]
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `errors` (object)
    - _(object)_

---

## GET `/setting/rest-keys`

**GET REST API Keys**

Retrieve all REST API application passwords created through FluentCRM. Returns a list of FluentCRM managers (non-admin users with CRM access) and their associated API keys.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — REST API keys and eligible managers.

  Schema (`application/json`):

  - `managers` (array<object>) — Non-admin users with FluentCRM access who can be assigned API keys.
    - `id` (integer) — WordPress user ID.
    - `full_name` (string) — User's first and last name.
    - `email` (string) _(format: email)_
  - `rest_keys` (array<object>) — Users with existing FluentCRM REST API keys.
    - `id` (integer) — WordPress user ID.
    - `first_name` (string)
    - `last_name` (string)
    - `email` (string) _(format: email)_
    - `api_keys` (array<object>)
      - `uuid` (string) — Application password UUID.
      - `name` (string) — API key name.
      - `created` (string) _(format: date-time)_ — When the API key was created.
    - `manage_url` (string) — Admin URL to manage the user's application passwords.

  Example:

```json
{
  "managers": [
    {
      "id": 5,
      "full_name": "Jane - Smith",
      "email": "jane@example.com"
    }
  ],
  "rest_keys": [
    {
      "id": 5,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "api_keys": [
        {
          "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "FluentCRM API",
          "created": "2024-01-15 10:30:00"
        }
      ],
      "manage_url": "https://example.com/wp-admin/user-edit.php?user_id=5#application-passwords-section"
    }
  ]
}
```



---

## GET `/setting`

**GET Global Settings**

Retrieve global FluentCRM settings by providing an array of setting keys. Returns only the requested setting groups (e.g., `email_settings`, `business_settings`).

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `settings_keys[]` | array<string> | no | Array of setting group keys to retrieve. Common keys include `email_settings`, `business_settings`. |


**Responses**

- **200** — Requested settings groups returned as key-value pairs.

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "email_settings": {
    "from_name": "My Company",
    "from_email": "hello@example.com",
    "emails_per_second": 0,
    "email_footer": "<p>Company Address | {{crm.manage_subscription_url}}</p>"
  },
  "business_settings": {
    "business_name": "My Company",
    "business_address": "123 Main St"
  }
}
```



---

## GET `/setting/system-logs`

**GET System Logs**

Retrieve a paginated list of system logs ordered by most recent first. Supports searching by title or description.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search logs by title or description. |
| `per_page` | integer | no | Number of log entries per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated system logs.

  Schema (`application/json`):

  - `logs` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `next_page_url` (string,null)
    - `prev_page_url` (string,null)
    - `from` (integer)
    - `to` (integer)
    - `data` (array<object>)
      - `id` (integer)
      - `title` (string) — Log entry title.
      - `description` (string,null) — Detailed log description.
      - `status` (string,null) — Log status (e.g., 'error', 'info').
      - `created_at` (string) _(format: date-time)_
      - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "logs": {
    "total": 150,
    "per_page": 20,
    "current_page": 1,
    "last_page": 8,
    "next_page_url": "/wp-json/fluent-crm/v2/setting/system-logs?page=2",
    "prev_page_url": null,
    "from": 1,
    "to": 20,
    "data": [
      {
        "id": 150,
        "title": "Email sending failed",
        "description": "SMTP connection timeout for campaign #42",
        "status": "error",
        "created_at": "2024-03-01 14:30:00",
        "updated_at": "2024-03-01 14:30:00"
      }
    ]
  }
}
```



---

## POST `/setting/install-fluent-boards`

**POST Install Fluent Boards Plugin**

Install and activate the Fluent Boards plugin from the WordPress plugin repository. If already installed but inactive, it will be activated.

<!-- fc:access -->

**Required capability:** `install_plugins`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::handleFluentBoardsInstall()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Plugin installed and activated successfully.

  Schema (`application/json`):

  - `is_installed` (boolean) — Whether the plugin is now installed and active.
  - `message` (string)

  Example:

```json
{
  "is_installed": true,
  "message": "Fluent Boards has been installed and activated"
}
```



---

## POST `/setting/install-fluent-booking`

**POST Install Fluent Booking Plugin**

Install and activate the Fluent Booking plugin from the WordPress plugin repository. If already installed but inactive, it will be activated.

<!-- fc:access -->

**Required capability:** `install_plugins`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::handleFluentBookingInstall()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Plugin installed and activated successfully.

  Schema (`application/json`):

  - `is_installed` (boolean) — Whether the plugin is now installed and active.
  - `message` (string)

  Example:

```json
{
  "is_installed": true,
  "message": "Fluent Booking has been installed and activated"
}
```



---

## POST `/setting/install-fluent-cart`

**POST Install FluentCart Plugin**

Install and activate the FluentCart plugin from the WordPress plugin repository. If already installed but inactive, it will be activated.

<!-- fc:access -->

**Required capability:** `install_plugins`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::handleFluentCartInstall()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Plugin installed and activated successfully.

  Schema (`application/json`):

  - `is_installed` (boolean) — Whether the plugin is now installed and active.
  - `message` (string)

  Example:

```json
{
  "is_installed": true,
  "message": "FluentCart has been installed and activated"
}
```



---

## POST `/setting/install-fluent-community`

**POST Install Fluent Community Plugin**

Install and activate the Fluent Community plugin from the WordPress plugin repository. If already installed but inactive, it will be activated.

<!-- fc:access -->

**Required capability:** `install_plugins`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::handleFluentCommunityInstall()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Plugin installed and activated successfully.

  Schema (`application/json`):

  - `is_installed` (boolean) — Whether the plugin is now installed and active.
  - `message` (string)

  Example:

```json
{
  "is_installed": true,
  "message": "Fluent Community has been installed and activated"
}
```



---

## POST `/setting/install-fluentform`

**POST Install Fluent Forms Plugin**

Install and activate the Fluent Forms plugin from the WordPress plugin repository. If already installed but inactive, it will be activated.

<!-- fc:access -->

**Required capability:** `install_plugins`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::handleFluentFormInstall()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Plugin installed and activated successfully.

  Schema (`application/json`):

  - `is_installed` (boolean) — Whether the plugin is now installed and active.
  - `message` (string)
  - `ff_config` (object) — Fluent Forms configuration details.
    - `is_installed` (boolean)
    - `create_form_link` (string) — Admin URL to create a new form.

  Example:

```json
{
  "is_installed": true,
  "message": "Fluent Forms has been installed and activated",
  "ff_config": {
    "is_installed": true,
    "create_form_link": "https://example.com/wp-admin/admin.php?page=fluent_forms#add=1"
  }
}
```



---

## POST `/setting/install-fluentsmtp`

**POST Install FluentSMTP Plugin**

Install and activate the FluentSMTP plugin from the WordPress plugin repository. Requires the `install_plugins` capability. If already installed but inactive, it will be activated.

<!-- fc:access -->

**Required capability:** `install_plugins`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::handleFluentSmtpInstall()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Plugin installed and activated successfully.

  Schema (`application/json`):

  - `is_installed` (boolean) — Whether the plugin is now installed and active.
  - `config_url` (string) — Admin URL to configure FluentSMTP.
  - `message` (string)

  Example:

```json
{
  "is_installed": true,
  "config_url": "https://example.com/wp-admin/options-general.php?page=fluent-mail#/",
  "message": "FluentSMTP plugin has been installed and activated successfully"
}
```


- **403** — User does not have permission to install plugins.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry! you do not have permission to install plugin"
}
```



---

## POST `/setting/install-fluent-support`

**POST Install Fluent Support Plugin**

Install and activate the Fluent Support plugin from the WordPress plugin repository. Requires the `install_plugins` capability. If already installed but inactive, it will be activated.

<!-- fc:access -->

**Required capability:** `install_plugins`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::handleFluentSupportInstall()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Plugin installed and activated successfully.

  Schema (`application/json`):

  - `is_installed` (boolean) — Whether the plugin is now installed and active.
  - `message` (string)

  Example:

```json
{
  "is_installed": true,
  "message": "Fluent Support plugin has been installed and activated successfully"
}
```


- **403** — User does not have permission to install plugins.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry! you do not have permission to install plugin"
}
```



---

## DELETE `/setting/old_logs`

**DELETE Remove Old Logs**

Delete old log records older than the specified number of days. Deletes in chunks of 10,000 records per type. Returns a `has_more` flag indicating whether additional records remain and the operation should be repeated.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `days_before` | integer | yes | Number of days. Logs older than this will be deleted. Minimum 7 days. |
| `selected_logs[]` | array<string> | yes | Types of logs to delete. |


**Responses**

- **200** — Logs deleted successfully.

  Schema (`application/json`):

  - `message` (string)
  - `has_more` (boolean) — True if more records remain to be deleted. Repeat the request to delete the next chunk.

  Example:

```json
{
  "message": "Logs older than 30 days have been deleted successfully",
  "has_more": true
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `errors` (object)
    - _(object)_

---

## POST `/setting/reset_db`

**POST Reset Database**

Drop and recreate all FluentCRM database tables. This is a destructive operation that deletes all CRM data including contacts, campaigns, funnels, and logs. Requires the `manage_options` capability and the `FLUENTCRM_IS_DEV_FEATURES` constant to be defined as true in wp-config.php.

<!-- fc:access -->

**Required capability:** `manage_options`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::resetDB()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Database tables reset successfully.

  Schema (`application/json`):

  - `message` (string)
  - `tables` (array<string>) — List of database tables that were reset.

  Example:

```json
{
  "message": "All FluentCRM Database Tables have been reset",
  "tables": [
    "fc_campaign_emails",
    "fc_campaigns",
    "fc_campaign_url_metrics",
    "fc_funnel_metrics",
    "fc_funnels",
    "fc_funnel_sequences",
    "fc_funnel_subscribers",
    "fc_lists",
    "fc_meta",
    "fc_subscriber_meta",
    "fc_subscriber_notes",
    "fc_subscriber_pivot",
    "fc_subscribers",
    "fc_tags",
    "fc_url_stores"
  ]
}
```


- **403** — Insufficient permissions or development mode not enabled.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Development mode is not activated. So you cannot use this feature. You can define \"FLUENTCRM_IS_DEV_FEATURES\" in your wp-config to enable this feature"
}
```



---

## DELETE `/setting/system-logs/reset`

**DELETE Reset System Logs**

Delete **every** system log row. There is no date filter and no confirmation step — the whole table is emptied.

Only system logs are affected. Contact notes and email activity live in the same `fc_subscriber_notes` table but carry a different status discriminator, so they are untouched.

Export first with `GET /setting/system-logs/export` if you need a copy.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — All system logs deleted.

  Schema (`application/json`):

  - `message` (string) — Confirmation message.

  Example:

```json
{
  "message": "All logs have been deleted"
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Validation failed — the response message names the offending field.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/setting/run_cron`

**POST Run Cron Event**

Manually trigger a specific FluentCRM cron event. Useful for debugging or when cron jobs are not running on schedule.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `hook` (string) **required** _(enum: `fluentcrm_scheduled_every_minute_tasks`, `fluentcrm_scheduled_hourly_tasks`, `fluentcrm_scheduled_five_minute_tasks`)_ — The WordPress cron hook name to run.

Example:

```json
{
  "hook": "fluentcrm_scheduled_every_minute_tasks"
}
```


**Responses**

- **200** — Cron event executed successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Selected CRON Event successfully ran"
}
```


- **422** — Invalid hook name provided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "The provided hook name is not valid"
}
```



---

## POST `/setting/abandon-cart`

**POST Save Abandon Cart Settings**

Save abandoned cart feature settings. When enabling the feature (`enabled: yes`), the abandoned cart database table is automatically created via migration. Also updates the experimental settings to reflect the abandoned cart status.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required** — Abandoned cart settings. Only known setting keys (matching existing settings) are accepted.
  - `enabled` (string) _(enum: `yes`, `no`)_ — Enable or disable abandoned cart tracking.

Example:

```json
{
  "settings": {
    "enabled": "yes"
  }
}
```


**Responses**

- **200** — Settings saved successfully.

  Schema (`application/json`):

  - `message` (string)
  - `reload` (boolean) — True if the enabled status changed, indicating the UI should reload.
  - `settings` (object) — The saved settings.
    - _(object)_

  Example:

```json
{
  "message": "Settings has been saved successfully",
  "reload": true,
  "settings": {
    "enabled": "yes"
  }
}
```


- **422** — Validation error from a filter hook.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/setting/auto_subscribe_settings`

**POST Save Auto Subscribe Settings**

Save auto-subscribe settings for user registration, comments, and user syncing. Saves role-based tagging settings when FluentCRM Pro is active. Saves WooCommerce checkout settings when both WooCommerce and FluentCRM Pro are active.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `registration_setting` (object) — Settings for auto-subscribing users on WordPress registration.
  - _(object)_
- `comment_settings` (object) — Settings for auto-subscribing users when they comment.
  - _(object)_
- `user_syncing_settings` (object) — Settings for syncing existing WordPress users.
  - _(object)_
- `role_based_tagging_settings` (object) — Settings for applying tags based on WordPress user roles (requires FluentCRM Pro).
  - _(object)_
- `woo_checkout_settings` (object) — WooCommerce checkout subscribe settings (requires WooCommerce and FluentCRM Pro).
  - _(object)_
- `date_time_settings` (object)
  - _(object)_
- `fluent_cart_checkout_settings` (object)
  - _(object)_

Example:

```json
{
  "registration_setting": {
    "status": "yes",
    "target_list": "1",
    "target_tags": [
      1,
      2
    ]
  },
  "comment_settings": {
    "status": "no"
  },
  "user_syncing_settings": {
    "status": "no"
  }
}
```


**Responses**

- **200** — Auto-subscribe settings saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Settings has been updated"
}
```



---

## PUT `/setting/double-optin`

**PUT Save Double Opt-in Settings**

Save the double opt-in email settings. Can save global settings or list-specific settings when a `list_id` is provided. The email body must contain an activation link (`#activate_link#` or `{{crm.activate_button}}`).

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `list_id` (integer) — List ID for list-specific double opt-in settings. Omit for global settings.
- `global_double_optin` (string) _(enum: `yes`, `no`)_ — Whether to use global double opt-in for this list (only when list_id is provided).
- `settings` (object)
  - `design_template` (string) — Email design template identifier.
  - `email_subject` (string) **required** — Double opt-in email subject line.
  - `email_pre_header` (string) — Email pre-header text.
  - `email_body` (string) **required** — HTML email body. Must contain `#activate_link#` or `{{crm.activate_button}}`.
  - `after_confirmation_type` (string) _(enum: `message`, `redirect`)_
  - `after_confirm_message` (string) **required** — Message shown after confirmation.
  - `after_conf_redirect_url` (string) — Redirect URL after confirmation.
  - `tag_based_redirect` (string) _(enum: `yes`, `no`)_
  - `tag_redirects` (array<object>)
    - `field_key` (array<integer>)
    - `field_value` (string)

Example:

```json
{
  "settings": {
    "design_template": "simple",
    "email_subject": "Please Confirm Your Subscription",
    "email_body": "<h2>Confirm</h2>{{crm.activate_button|Confirm Subscription}}",
    "after_confirmation_type": "message",
    "after_confirm_message": "<h2>Thank you!</h2>"
  }
}
```


**Responses**

- **200** — Double opt-in settings saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Double Opt-in settings has been updated"
}
```


- **422** — Validation error. Required fields missing or email body lacks activation link.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## POST `/setting/integrations`

**POST Save Integration Settings**

Save settings for a deep integration provider or trigger a sync operation. The `action` field determines whether to save settings or trigger a data sync. Provider-specific processing is handled via the `fluentcrm_deep_integration_save_{provider}` or `fluentcrm_deep_integration_sync_{provider}` filters.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `provider` (string) **required** — The integration provider slug (e.g., `woocommerce`, `edd`).
- `action` (string) _(enum: `sync`, `save`)_ — Action to perform. Use `sync` to trigger data synchronization, or omit/use any other value to save settings.

Example:

```json
{
  "provider": "woocommerce",
  "action": "save",
  "settings": {
    "enabled": true
  }
}
```


**Responses**

- **200** — Integration settings saved or sync triggered successfully. Response varies by provider.

  Schema (`application/json`):

  - _(object)_
- **422** — Provider not found or returned an error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry, the provided provider does not exist"
}
```



---

## PUT `/setting`

**PUT Save Global Settings**

Save global FluentCRM settings. Merges the provided settings object with existing settings. When saving `email_settings`, the `email_footer` must contain `##crm.manage_subscription_url##` or `##crm.unsubscribe_url##` for compliance.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) — Key-value pairs of settings to update. Each key represents a settings group (e.g., `email_settings`, `business_settings`).
  - _(object)_
- `email_footer` (object)
  - `footer_content` (string) — Markup appended to the bottom of every outgoing email.

Example:

```json
{
  "settings": {
    "email_settings": {
      "from_name": "My Company",
      "from_email": "hello@example.com",
      "email_footer": "<p>Company Address | {{crm.manage_subscription_url}}</p>"
    }
  }
}
```


**Responses**

- **200** — Settings saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Settings Updated"
}
```


- **422** — Validation error when email_footer lacks required compliance URLs.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "##crm.manage_subscription_url## or ##crm.unsubscribe_url## string is required for compliance. Please include unsubscription or manage subscription link"
}
```



---

## DELETE `/setting/test`

**DELETE Test Request Resolver**

Test endpoint to verify REST API connectivity and authentication via DELETE method. Returns a validation message and echoes back all request parameters.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `any_param` | string | no | Any query parameters will be echoed back in the response. |


**Responses**

- **200** — Test request successful. Returns validation message and echoed parameters.

  Schema (`application/json`):

  - `message` (string)
  - `params` (object)
    - _(object)_

  Example:

```json
{
  "message": "Valid",
  "params": {}
}
```



---

## GET `/setting/test`

**GET Test Request Resolver**

Test endpoint to verify REST API connectivity and authentication. Returns a validation message and echoes back all request parameters. Useful for debugging API access.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `any_param` | string | no | Any query parameters will be echoed back in the response. |


**Responses**

- **200** — Test request successful. Returns validation message and echoed parameters.

  Schema (`application/json`):

  - `message` (string)
  - `params` (object) — All request parameters echoed back.
    - _(object)_

  Example:

```json
{
  "message": "Valid",
  "params": {
    "any_param": "test_value"
  }
}
```



---

## POST `/setting/test`

**POST Test Request Resolver**

Test endpoint to verify REST API connectivity and authentication via POST method. Returns a validation message and echoes back all request parameters.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- _(object)_

**Responses**

- **200** — Test request successful. Returns validation message and echoed parameters.

  Schema (`application/json`):

  - `message` (string)
  - `params` (object)
    - _(object)_

  Example:

```json
{
  "message": "Valid",
  "params": {}
}
```



---

## PUT `/setting/test`

**PUT Test Request Resolver**

Test endpoint to verify REST API connectivity and authentication via PUT method. Returns a validation message and echoes back all request parameters.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- _(object)_

**Responses**

- **200** — Test request successful. Returns validation message and echoed parameters.

  Schema (`application/json`):

  - `message` (string)
  - `params` (object)
    - _(object)_

  Example:

```json
{
  "message": "Valid",
  "params": {}
}
```



---

## POST `/setting/compliance`

**POST Update Compliance Settings**

Update GDPR and data compliance settings. Only accepts known compliance setting keys. Values must be `yes`, `no`, or `anonymous`; invalid values are cleared to empty strings.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- _(object)_

Example:

```json
{
  "delete_contact_on_user": "no",
  "anonymize_ip": "yes",
  "anonymize_on_unsubscribe": "anonymous"
}
```


**Responses**

- **200** — Compliance settings updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `settings` (object) — The updated compliance settings.
    - _(object)_

  Example:

```json
{
  "message": "Settings has been successfully updated",
  "settings": {
    "delete_contact_on_user": "no",
    "anonymize_ip": "yes",
    "anonymize_on_unsubscribe": "anonymous"
  }
}
```



---

## POST `/setting/experiments`

**POST Update Experimental Settings**

Update experimental feature flags. Enabling certain features (company_module, event_tracking, activity_log) automatically runs their database migrations to create required tables. Only known setting keys are accepted.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `company_module` (string) _(enum: `yes`, `no`)_ — Enable the Companies module. Runs company table migration when enabled.
- `event_tracking` (string) _(enum: `yes`, `no`)_ — Enable subscriber event tracking. Runs event tracking table migration when enabled.
- `activity_log` (string) _(enum: `yes`, `no`)_ — Enable activity logging. Runs activity log table migration when enabled.
- `campaign_ids` (array<integer>) — Campaign IDs for experimental features.
- `frontend_portal` (string) _(enum: `yes`, `no`)_ — Enable the front-end contact portal.

Example:

```json
{
  "company_module": "yes",
  "event_tracking": "yes",
  "activity_log": "no"
}
```


**Responses**

- **200** — Experimental settings updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Settings has been updated"
}
```



---

## GET `/setting/system-logs/export`

**GET Export System Logs (CSV)**

Stream the system log as a CSV download.

::: warning
This endpoint does **not** return JSON. It sets CSV download headers, streams rows directly to the output buffer, and calls `exit` — so ordinary REST clients that expect a JSON envelope will not work. Treat it as a file download.
:::

Rows are streamed in chunks by descending id rather than buffered in memory, so the export works on log tables too large to load at once, and it stops early if the client disconnects.

The file opens with a UTF-8 BOM for spreadsheet compatibility, and every cell is escaped so a value beginning with `=`, `+`, `-`, or `@` cannot execute as a formula.

Columns are `ID`, `Date & Time`, `Title`, `Description`, with HTML stripped from the description. The filename encodes the range, e.g. `fluent-crm-system-logs-last-30-days-2026-08-04-113000.csv`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `range` | string | no | `all` for everything, or a number of days to look back. Unrecognised values fall back to `all`. |
| `search` | string | no | Case-insensitive substring match against the log title or description. |


**Responses**

- **200** — A CSV file. Sent with download headers, not a JSON body.

  Example:

```json
"ID,Date & Time,Title,Description\n282,2025-04-22 19:51:02,Running Scheduler -> cron,Handler::handle\n"
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_

---

## GET `/setting/db-index-health`

**GET Database Index Health**

Report whether each index FluentCRM considers critical is present on the database.

Missing indexes do not break correctness, but they turn the sending queue and segmentation queries into table scans, so this is the first thing to check when a large site reports slow sending.

By default the answer comes from a cached snapshot. Pass `fresh=1` to run `SHOW INDEX` against the live database instead — slower, but authoritative. The cache is also bypassed automatically when it predates a newly introduced critical index.

Anything reporting `status: "no"` can be fixed with `POST /setting/db-index-health/repair`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fresh` | string | no | Send `1` to bypass the cached snapshot and query the live database. |


**Responses**

- **200** — Index health for every critical index.

  Schema (`application/json`):

  - `indexes` (array<DbIndexHealth>)

  Example:

```json
{
  "indexes": [
    {
      "type": "unique",
      "table": "fc_subscriber_pivot",
      "title": "Subscriber Tags / Lists Relationship Uniqueness",
      "columns": [
        {
          "name": "subscriber_id"
        },
        {
          "name": "object_id"
        },
        {
          "name": "object_type",
          "sub_part": 50
        }
      ],
      "cleanup": "subscriber_pivot",
      "name": "subscriber_object_type_unique",
      "status": "yes"
    },
    {
      "type": "index",
      "table": "fc_campaign_emails",
      "title": "Campaign Emails Sending Index",
      "columns": [
        {
          "name": "campaign_id"
        },
        {
          "name": "status"
        }
      ],
      "name": "fc_cam_cid_status",
      "status": "yes"
    }
  ]
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/setting/db-index-health/repair`

**POST Repair Database Indexes**

Add any missing critical indexes.

The work runs **inline**, not in the background, so on a large site the request can take a while. The `ALTER`s are idempotent and prefer a non-blocking online build.

Three of the outcomes are 200 responses and only one of them means work was done — check the flags before reporting success:

| Condition | Response |
|---|---|
| Nothing was broken | 200, “All database indexes are healthy.” No `repaired` key. |
| Another repair is in flight | 200 with `pending: true`. Deliberately **not** an error — a second tab is already doing the work. |
| Repair succeeded | 200 with `repaired` listing the index names that were added. |
| Repair failed | 422 with `failed`, usually insufficient database privileges. |

A five-minute transient lock prevents concurrent admin tabs from stacking overlapping `ALTER` statements on the same tables.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Repair finished, was unnecessary, or is already running.

  Schema (`application/json`):

  - `message` (string) — Outcome description.
  - `pending` (boolean) — Present and true only when another repair already holds the lock.
  - `repaired` (array<string>) — Index names that were added. Present only when a repair actually ran.
  - `indexes` (array<DbIndexHealth>) — Index health after the attempt.

  Example:

```json
{
  "message": "Database indexes repaired successfully.",
  "repaired": [
    "fc_cam_cid_status"
  ],
  "indexes": [
    {
      "type": "index",
      "table": "fc_campaign_emails",
      "title": "Campaign Emails Sending Index",
      "columns": [
        {
          "name": "campaign_id"
        },
        {
          "name": "status"
        }
      ],
      "name": "fc_cam_cid_status",
      "status": "yes"
    }
  ]
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — One or more indexes could not be created. The response carries `failed` and the current `indexes` health.

  Schema (`application/json`):

  - _$ref: Error_

---
