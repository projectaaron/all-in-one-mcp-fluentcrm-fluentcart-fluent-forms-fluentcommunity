# FluentCart API — Integrations

12 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/integration/feed/chained`

**POST Chained Data Request**

Handle chained/dependent data requests for integration feeds. Used when selecting a value in one feed field needs to dynamically load options for another field. The behavior is entirely handled by the integration provider through the `fluent_cart/integration/chained_{route}` hook.

**Required permission:** `integrations/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `route` (string) **required** — The chained route identifier, determines which integration provider handles the request

Example:

```json
{
  "route": "fluent-crm",
  "list_id": "2"
}
```


**Responses**

- **200** — Successful response. The response format depends on the integration provider handling the chained route.

  Schema (`application/json`):

  - `options` (array<object>)
    - `id` (string)
    - `label` (string)

  Example:

```json
{
  "options": [
    {
      "id": "1",
      "label": "Option A"
    },
    {
      "id": "2",
      "label": "Option B"
    }
  ]
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## POST `/integration/global-feeds/change-status/{integration_id}`

**POST Change Feed Status**

Toggle a global integration feed on or off without modifying its configuration.

**Required permission:** `integrations/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `integration_id` | integer | yes | The feed ID to update |


**Request body** (`application/json`, required)

- `status` (string) **required** _(enum: `yes`, `no`)_ — New status: `yes` (enable) or `no` (disable)

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message
  - `meta` (object) — Updated feed metadata
    - _(object)_

  Example:

```json
{
  "message": "Integration status updated successfully.",
  "meta": {
    "name": "Add to customers list",
    "enabled": "yes",
    "list_id": "2",
    "merge_fields": {
      "first_name": "{customer.first_name}",
      "last_name": "{customer.last_name}",
      "email": "{customer.email}"
    }
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## DELETE `/integration/global-feeds/{integration_id}`

**DELETE Feed**

Permanently delete a global integration feed.

**Required permission:** `integrations/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `integration_id` | integer | yes | The feed ID to delete |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message
  - `id` (integer) — The deleted feed ID

  Example:

```json
{
  "message": "Integration has been deleted successfully.",
  "id": 42
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/delete`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## GET `/integration/feed/dynamic_options`

**GET Dynamic Options**

Fetch dynamic select options for integration feed fields. Supports WordPress post type searches and provider-specific dynamic option lookups. Used by the feed editor to populate dropdown fields asynchronously.

**Required permission:** `integrations/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `option_key` | string | yes | The type of options to fetch (e.g., `post_type` for WordPress posts, or a provider-specific key) |
| `sub_option_key` | string | no | Required when `option_key` is `post_type`. Specifies the post type slug (e.g., `post`, `page`, `fluent-products`) |
| `search` | string | no | Search term to filter results |
| `values` | array<string> | no | Array of pre-selected IDs to ensure they are included in the response |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `options` (array<DynamicOption>)

  Example:

```json
{
  "options": [
    {
      "id": "123",
      "title": "Example Product"
    },
    {
      "id": "456",
      "title": "Another Product"
    }
  ]
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```



---

## GET `/integration/feed/lists`

**GET Feed Merge Fields (Lists)**

Retrieve the merge fields (field mapping options) for a specific integration provider and list. Called when a user selects a target list in the feed editor to load the available mapping fields.

**Required permission:** `integrations/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `integration_name` | string | yes | The integration provider key (e.g., `fluent-crm`) |
| `list_id` | string | no | The target list ID to fetch merge fields for |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `merge_fields` (array<MergeField>)

  Example:

```json
{
  "merge_fields": [
    {
      "key": "email",
      "label": "Email",
      "type": "text",
      "required": true
    },
    {
      "key": "first_name",
      "label": "First Name",
      "type": "text",
      "required": false
    },
    {
      "key": "last_name",
      "label": "Last Name",
      "type": "text",
      "required": false
    }
  ]
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```



---

## GET `/integration/global-feeds/settings`

**GET Feed Settings**

Retrieve the settings form schema, saved values, and available shortcodes for a specific integration feed. Used to populate the feed editor when creating or editing a global feed.

**Required permission:** `integrations/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `integration_name` | string | yes | The integration provider key (e.g., `fluent-crm`, `webhook`) |
| `integration_id` | integer | no | The feed ID to load existing settings for editing. Omit to get defaults for a new feed. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `settings` (object) — Current feed settings values (defaults for new, saved values for existing)
    - _(object)_
  - `settings_fields` (object) — Form schema defining the feed editor fields
    - `fields` (array<FeedSettingsField>)
  - `shortcodes` (object) — Available shortcodes for dynamic field mapping, grouped by category.
    - `data` (array<ShortcodeGroup>)
  - `inputs` (object) — Checkout input fields available for mapping, keyed by shortcode. Serializes as an empty array `[]` when no checkout fields are configured.
    - _(object)_
  - `merge_fields` (boolean) — `false` by default. When the selected integration list has custom merge fields, this becomes an object mapping merge field keys to labels.

  Example:

```json
{
  "settings": {
    "enabled": "yes",
    "list_name": "",
    "name": "",
    "list_ids": [],
    "tag_ids": [],
    "tag_ids_selection_type": "simple",
    "double_opt_in": "yes",
    "note": ""
  },
  "settings_fields": {
    "fields": [
      {
        "key": "name",
        "label": "Feed Title",
        "required": true,
        "placeholder": "Name",
        "component": "text",
        "inline_tip": "Name of this feed, it will be used to identify this feed in the list of feeds"
      },
      {
        "key": "list_ids",
        "label": "Add to Lists",
        "placeholder": "Select FluentCRM Lists",
        "inline_tip": "Select the FluentCRM Lists you would like to add your contact to.",
        "component": "select",
        "is_multiple": true,
        "required": false,
        "options": {
          "1": "Newsletter Subscribers",
          "2": "Customers",
          "3": "VIP Customers"
        }
      }
    ],
    "button_require_list": false,
    "integration_title": "FluentCRM"
  },
  "shortcodes": {
    "data": [
      {
        "key": "customer",
        "title": "Customer",
        "shortcodes": {
          "{{order.billing.full_name}}": "Full Name",
          "{{order.billing.email}}": "Email",
          "{{order.billing.city}}": "City",
          "{{order.billing.country}}": "Country"
        }
      },
      {
        "key": "order",
        "title": "Order",
        "shortcodes": {
          "{{order.id}}": "Order ID",
          "{{order.invoice_no}}": "Order Number",
          "{{order.total_amount}}": "Order Total Amount",
          "{{order.currency}}": "Order Currency"
        }
      }
    ]
  },
  "inputs": [],
  "merge_fields": false
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```



---

## GET `/integration/global-feeds`

**GET List Global Integration Feeds**

Retrieve all configured global integration feeds along with the list of available integrations that support global scope.

**Required permission:** `integrations/view`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `feeds` (array<GlobalFeed>)
  - `available_integrations` (object) — Available integrations that support global scope
    - _(object)_
  - `all_module_config_url` (string) _(format: uri)_ — URL to the integrations admin page

  Example:

```json
{
  "feeds": [
    {
      "id": 42,
      "name": "Add to FluentCRM list",
      "enabled": "yes",
      "provider": "fluent-crm",
      "feed": {
        "name": "Add to FluentCRM list",
        "enabled": "yes",
        "list_id": "2",
        "list_name": "Customers",
        "merge_fields": {
          "first_name": "{customer.first_name}",
          "last_name": "{customer.last_name}",
          "email": "{customer.email}"
        },
        "conditionals": {
          "conditions": [
            {
              "field": "payment_status",
              "operator": "is",
              "value": "paid"
            }
          ],
          "status": false,
          "type": "all"
        }
      },
      "scope": "global"
    }
  ],
  "available_integrations": {
    "fluent-crm": {
      "title": "FluentCRM",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/fluentcrm.svg",
      "enabled": true,
      "scopes": [
        "global",
        "product"
      ],
      "description": "The most powerful email marketing automation plugin for WordPress."
    }
  },
  "all_module_config_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/integrations"
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```



---

## GET `/integration/global-settings`

**GET Global Integration Settings**

Retrieve global configuration settings for a specific integration provider. Used to get API key configuration, authentication fields, and current saved values.

**Required permission:** `integrations/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `settings_key` | string | yes | The integration provider key (e.g., `fluent-crm`, `webhook`) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `integration` (object) — Current saved integration settings values
    - _(object)_
  - `settings` (object) — Form schema defining the settings fields
    - `fields` (array<SettingsField>)
    - `save_button_text` (string)
    - `valid_message` (string)
    - `invalid_message` (string)

  Example:

```json
{
  "integration": {
    "api_key": "••••••••",
    "api_url": "https://example.com",
    "status": true
  },
  "settings": {
    "fields": [
      {
        "key": "api_key",
        "label": "API Key",
        "type": "password",
        "required": true
      }
    ],
    "save_button_text": "Save Settings",
    "valid_message": "Your API Key is valid",
    "invalid_message": "Your API Key is not valid"
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```



---

## POST `/integration/feed/install-plugin`

**POST Install and Activate Add-on Plugin**

Install and activate a supported integration plugin from the WordPress.org repository. Only whitelisted plugins can be installed through this endpoint.

**Required permission:** `integrations/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `addon` (string) **required** _(enum: `fluent-crm`, `fluent-smtp`, `fluent-community`, `fluent-security`, `fluentform`, `fluent-support`)_ — The plugin slug to install

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message
  - `redirect` (string) _(format: uri)_ — URL to redirect after installation

  Example:

```json
{
  "message": "Addon installation started successfully.",
  "redirect": "https://example.com/wp-admin/admin.php?page=fluent-cart#/integrations"
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Addon cannot be installed

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "This addon cannot be installed at this time"
}
```



---

## GET `/integration/addons`

**GET List Available Add-ons**

Retrieve the list of all available integration add-ons, including their installation status and metadata.

**Required permission:** `integrations/view`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `addons` (object) — Object of add-ons keyed by add-on identifier
    - _(object)_

  Example:

```json
{
  "addons": {
    "fluent-crm": {
      "installable": "fluent-crm",
      "enabled": true,
      "title": "FluentCRM",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/fluentcrm.svg",
      "categories": [
        "crm",
        "core",
        "marketing"
      ],
      "description": "The most powerful email marketing automation plugin for WordPress."
    },
    "fluent-smtp": {
      "installable": "fluent-smtp",
      "enabled": false,
      "title": "FluentSMTP",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/fluent-smtp.svg",
      "categories": [
        "core",
        "marketing"
      ],
      "description": "A free WordPress SMTP plugin to send emails via multiple providers."
    },
    "fluent-community": {
      "installable": "fluent-community",
      "enabled": false,
      "title": "FluentCommunity",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/fluent-community.svg",
      "categories": [
        "core",
        "community",
        "lms"
      ],
      "description": "Build a community, membership site, or online forum with FluentCart + FluentCommunity integration. Engage your customers and users right from your WordPress dashboard."
    },
    "fluent-security": {
      "installable": "fluent-security",
      "enabled": false,
      "title": "FluentAuth",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/fluent-auth.svg",
      "categories": [
        "core"
      ],
      "description": "Customize WordPress emails, customized login & signup forms with enhanced security and social logins. Enhance your site security with FluentCart + FluentSecurity integration."
    },
    "fluentform": {
      "installable": "fluentform",
      "enabled": false,
      "title": "Fluent Forms",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/fluent-form.svg",
      "categories": [
        "core",
        "marketing"
      ],
      "description": "Create advanced forms and surveys with an easy-to-use drag & drop form builder."
    },
    "fluent-support": {
      "installable": "fluent-support",
      "enabled": false,
      "title": "FluentSupport",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/fluent-support.svg",
      "categories": [
        "core",
        "marketing"
      ],
      "description": "A powerful helpdesk and customer support plugin for WordPress. Manage customer support tickets directly from your WordPress dashboard with FluentCart + FluentSupport integration."
    },
    "webhook": {
      "title": "Webhook",
      "description": "Send data anywhere via webhook",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/webhook.svg",
      "enabled": true,
      "is_pro": true,
      "is_pro_active": true,
      "categories": [
        "core"
      ]
    },
    "wp_user": {
      "title": "WP User Create/Update",
      "description": "Create / Update WP User with Custom Roles on order events",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/wp_user.svg",
      "enabled": true,
      "is_pro": true,
      "is_pro_active": true,
      "categories": [
        "core"
      ]
    }
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```



---

## POST `/integration/global-feeds/settings`

**POST Save Feed Settings**

Create a new integration feed or update an existing one. Validates required fields defined by the integration provider before saving.

**Required permission:** `integrations/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `integration_name` (string) **required** — The integration provider key (e.g., `fluent-crm`)
- `integration_id` (integer) — The existing feed ID to update. Omit to create a new feed.
- `integration` (string) **required** — JSON-encoded feed settings data containing field mappings, conditionals, and configuration

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message
  - `integration_id` (integer) — The feed ID (null for newly created feeds before refresh)
  - `integration_name` (string) — The integration provider key
  - `created` (boolean) — true if a new feed was created, false if an existing one was updated
  - `feedData` (object) — The validated and saved feed data
    - _(object)_

  Example:

```json
{
  "message": "Integration has been successfully saved",
  "integration_id": 42,
  "integration_name": "fluent-crm",
  "created": true,
  "feedData": {
    "name": "Add to customers list",
    "enabled": "yes",
    "list_id": "2",
    "merge_fields": {
      "first_name": "{customer.first_name}",
      "last_name": "{customer.last_name}",
      "email": "{customer.email}"
    }
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation error

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Please fill up the required fields:",
  "errors": {
    "name": "Feed Name is required.",
    "list_id": "Contact List is required."
  }
}
```



---

## POST `/integration/global-settings`

**POST Save Global Integration Settings**

Save or update global configuration settings for a specific integration provider (e.g., API keys, authentication credentials).

**Required permission:** `integrations/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings_key` (string) **required** — The integration provider key
- `integration` (object) **required** — The settings data to save (fields vary by provider)
  - _(object)_

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `status` (boolean)

  Example:

```json
{
  "message": "Settings saved successfully",
  "status": true
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`integrations/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---
