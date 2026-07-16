# FluentCart API — Integrations

17 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [API index](./README.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/integration/feed/chained`

**POST Chained Data Request**

Handle chained/dependent data requests for integration feeds. Used when selecting a value in one feed field needs to dynamically load options for another field. The behavior is entirely handled by the integration provider through the `fluent_cart/integration/chained_{route}` hook.

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



---

## POST `/integration/global-feeds/change-status/{integration_id}`

**POST Change Feed Status**

Toggle a global integration feed on or off without modifying its configuration.

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



---

## POST `/products/{product_id}/integrations/feed/change-status`

**POST Change Product Feed Status**

Toggle a product-level integration feed on or off.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product_id` | integer | yes | The product ID |


**Request body** (`application/json`, required)

- `product_id` (integer) **required** — The product ID (must also be provided in the request body)
- `notification_id` (integer) **required** — The feed ID to toggle
- `status` (string) **required** _(enum: `yes`, `no`)_ — New status: `yes` (enable) or `no` (disable)

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Integration status has been updated"
}
```


- **400** — Missing required parameters

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Product ID and Notification ID are required"
}
```


- **404** — Notification not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Notification not found"
}
```



---

## DELETE `/integration/global-feeds/{integration_id}`

**DELETE Feed**

Permanently delete a global integration feed.

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



---

## DELETE `/products/{product_id}/integrations/{integration_id}`

**DELETE Product Integration Feed**

Permanently delete a product-level integration feed.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product_id` | integer | yes | The product ID |
| `integration_id` | integer | yes | The feed ID to delete |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Integration deleted successfully"
}
```



---

## GET `/integration/feed/dynamic_options`

**GET Dynamic Options**

Fetch dynamic select options for integration feed fields. Supports WordPress post type searches and provider-specific dynamic option lookups. Used by the feed editor to populate dropdown fields asynchronously.

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



---

## GET `/integration/feed/lists`

**GET Feed Merge Fields (Lists)**

Retrieve the merge fields (field mapping options) for a specific integration provider and list. Called when a user selects a target list in the feed editor to load the available mapping fields.

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



---

## GET `/integration/global-feeds/settings`

**GET Feed Settings**

Retrieve the settings form schema, saved values, and available shortcodes for a specific integration feed. Used to populate the feed editor when creating or editing a global feed.

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
  - `shortcodes` (object) — Available shortcodes for dynamic field mapping
    - _(object)_
  - `inputs` (object) — Checkout input fields available for mapping
    - _(object)_
  - `merge_fields` (any) — Merge fields for the selected list (if applicable)

  Example:

```json
{
  "settings": {
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
    },
    "enabled": "yes",
    "list_id": "",
    "list_name": "",
    "name": "",
    "merge_fields": {
      "first_name": "{customer.first_name}",
      "last_name": "{customer.last_name}",
      "email": "{customer.email}"
    }
  },
  "settings_fields": {
    "fields": [
      {
        "key": "name",
        "label": "Feed Name",
        "type": "text",
        "required": true
      },
      {
        "key": "list_id",
        "label": "Contact List",
        "type": "select",
        "required": true,
        "options": [
          {
            "id": "1",
            "label": "Newsletter Subscribers"
          },
          {
            "id": "2",
            "label": "Customers"
          },
          {
            "id": "3",
            "label": "VIP Customers"
          }
        ]
      }
    ]
  },
  "shortcodes": {
    "customer": {
      "title": "Customer",
      "shortcodes": {
        "{customer.first_name}": "First Name",
        "{customer.last_name}": "Last Name",
        "{customer.email}": "Email"
      }
    }
  },
  "inputs": {
    "billing_first_name": "Billing First Name",
    "billing_last_name": "Billing Last Name",
    "billing_email": "Billing Email",
    "billing_phone": "Billing Phone"
  },
  "merge_fields": {
    "first_name": "{customer.first_name}",
    "last_name": "{customer.last_name}",
    "email": "{customer.email}"
  }
}
```



---

## GET `/integration/global-feeds`

**GET List Global Integration Feeds**

Retrieve all configured global integration feeds along with the list of available integrations that support global scope.

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



---

## GET `/integration/global-settings`

**GET Global Integration Settings**

Retrieve global configuration settings for a specific integration provider. Used to get API key configuration, authentication fields, and current saved values.

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



---

## GET `/products/{product_id}/integrations/{integration_name}/settings`

**GET Product Integration Settings**

Retrieve the feed editor settings for a specific integration provider, scoped to a product. Returns form schema, saved values, available shortcodes, and the product's variation list for conditional targeting.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product_id` | integer | yes | The product ID |
| `integration_name` | string | yes | The integration provider key (e.g., `fluent-crm`) |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `integration_id` | integer | no | The existing feed ID to load for editing. Omit for new feed defaults. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `settings` (object) — Current feed settings values (defaults for new, saved values for existing)
    - _(object)_
  - `settings_fields` (object) — Form schema defining the feed editor fields
    - `fields` (array<object>)
      - `key` (string)
      - `label` (string)
      - `type` (string)
      - `required` (boolean)
  - `shortcodes` (object) — Available shortcodes for dynamic field mapping
    - _(object)_
  - `inputs` (object) — Checkout input fields available for mapping
    - _(object)_
  - `merge_fields` (any) — Merge fields for the selected list (if applicable)
  - `product_variations` (array<object>) — List of the product's variations, used for targeting specific variations
    - `id` (integer) — Variation ID
    - `title` (string) — Variation title
  - `scope` (string) — Always 'product' for this endpoint

  Example:

```json
{
  "settings": {
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
    },
    "enabled": "yes",
    "list_id": "",
    "list_name": "",
    "name": "",
    "merge_fields": {
      "first_name": "{customer.first_name}",
      "last_name": "{customer.last_name}",
      "email": "{customer.email}"
    },
    "conditional_variation_ids": [
      456,
      457
    ]
  },
  "settings_fields": {
    "fields": [
      {
        "key": "name",
        "label": "Feed Name",
        "type": "text",
        "required": true
      }
    ]
  },
  "shortcodes": {
    "customer": {
      "title": "Customer",
      "shortcodes": {
        "{customer.first_name}": "First Name",
        "{customer.last_name}": "Last Name",
        "{customer.email}": "Email"
      }
    }
  },
  "inputs": {
    "billing_first_name": "Billing First Name",
    "billing_last_name": "Billing Last Name",
    "billing_email": "Billing Email"
  },
  "merge_fields": {
    "first_name": "{customer.first_name}",
    "last_name": "{customer.last_name}",
    "email": "{customer.email}"
  },
  "product_variations": [
    {
      "id": 101,
      "title": "Basic Plan"
    },
    {
      "id": 102,
      "title": "Pro Plan"
    }
  ],
  "scope": "product"
}
```



---

## POST `/integration/feed/install-plugin`

**POST Install and Activate Add-on Plugin**

Install and activate a supported integration plugin from the WordPress.org repository. Only whitelisted plugins can be installed through this endpoint.

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
    }
  }
}
```



---

## GET `/products/{productId}/integrations`

**GET List Product Integration Feeds**

Retrieve all integration feeds configured for a specific product, along with available product-scoped integrations.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productId` | integer | yes | The product ID |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `feeds` (array<ProductFeed>)
  - `available_integrations` (object) — Available integrations that support product scope
    - _(object)_
  - `all_module_config_url` (string) _(format: uri)_ — URL to the integrations admin page

  Example:

```json
{
  "feeds": [
    {
      "id": 15,
      "name": "Tag VIP buyers",
      "enabled": "yes",
      "provider": "fluent-crm",
      "feed": {
        "name": "Tag VIP buyers",
        "enabled": "yes",
        "list_id": "3",
        "list_name": "VIP Customers",
        "merge_fields": {
          "first_name": "{customer.first_name}",
          "last_name": "{customer.last_name}",
          "email": "{customer.email}"
        },
        "conditional_variation_ids": [
          101,
          102
        ],
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
      "scope": "product"
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
      ]
    }
  },
  "all_module_config_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/integrations"
}
```



---

## POST `/integration/global-feeds/settings`

**POST Save Feed Settings**

Create a new integration feed or update an existing one. Validates required fields defined by the integration provider before saving.

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

## POST `/products/{product_id}/integrations`

**POST Save Product Integration Feed**

Create a new product-level integration feed or update an existing one. Validates required fields and associates the feed with the specified product.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product_id` | integer | yes | The product ID |


**Request body** (`application/json`, required)

- `integration_name` (string) **required** — The integration provider key (e.g., `fluent-crm`)
- `integration_id` (integer) — Existing feed ID to update. Omit to create a new feed.
- `integration` (string) **required** — JSON-encoded feed settings data

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message
  - `integration_id` (integer) — The feed ID
  - `integration_name` (string) — The integration provider key
  - `created` (boolean) — true if a new feed was created, false if an existing one was updated
  - `feedData` (object) — The validated and saved feed data
    - _(object)_

  Example:

```json
{
  "message": "Integration has been successfully saved",
  "integration_id": 15,
  "integration_name": "fluent-crm",
  "created": true,
  "feedData": {
    "name": "Tag VIP buyers",
    "enabled": "yes",
    "list_id": "3",
    "conditional_variation_ids": [
      101
    ]
  }
}
```


- **404** — Product not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Product not found"
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
    "name": "Feed Name is required."
  }
}
```



---

## POST `/integration/global-settings`

**POST Save Global Integration Settings**

Save or update global configuration settings for a specific integration provider (e.g., API keys, authentication credentials).

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



---
