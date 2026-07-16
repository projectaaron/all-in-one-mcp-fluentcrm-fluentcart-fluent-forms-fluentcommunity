# FluentCart API — Settings

30 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [API index](./README.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/settings/payment-methods/activate-addon`

**POST Activate Payment Addon**

Activate an already-installed payment gateway addon plugin.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `plugin_file` (string) **required** — The plugin file path (e.g., `fluent-cart-pro/fluent-cart-pro.php`).

Example:

```json
{
  "plugin_file": "fluent-cart-pro/fluent-cart-pro.php"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Payment addon activated successfully!"
}
```



---

## POST `/settings/modules/plugin-addons/activate`

**POST Activate Plugin Addon**

Activate an already-installed plugin addon.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `plugin_file` (string) **required** — The plugin file path to activate (e.g., `fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php`).

Example:

```json
{
  "plugin_file": "fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Addon activated successfully."
}
```



---

## GET `/settings/payment-methods/paypal/webhook/check`

**GET Check PayPal Webhook**

Verify the current PayPal webhook registration status and set up the webhook if it is missing.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | string | yes | Environment mode: `test` or `live`. |


**Responses**

- **200** — Successful response. Returns the webhook status and configuration details from PayPal.

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "id": "WH-LIVE-80021663MN711374V",
  "url": "https://example.com/wp-json/fluent-cart/v2/webhook/paypal",
  "event_types": [
    {
      "name": "PAYMENT.CAPTURE.COMPLETED",
      "description": "Payment capture completed"
    },
    {
      "name": "PAYMENT.CAPTURE.REFUNDED",
      "description": "Payment capture refunded"
    },
    {
      "name": "BILLING.SUBSCRIPTION.ACTIVATED",
      "description": "Subscription activated"
    },
    {
      "name": "BILLING.SUBSCRIPTION.CANCELLED",
      "description": "Subscription cancelled"
    },
    {
      "name": "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
      "description": "Subscription payment failed"
    }
  ],
  "status": "ACTIVE"
}
```



---

## POST `/settings/payment-methods/disconnect`

**POST Disconnect Payment Method**

Disconnect a payment gateway account (e.g., revoke Stripe or PayPal connection).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `method` (string) **required** — The payment method key to disconnect (e.g., `stripe`, `paypal`).
- `mode` (string) **required** _(enum: `test`, `live`)_ — The environment mode to disconnect: `test` or `live`.

Example:

```json
{
  "method": "paypal",
  "mode": "test"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `settings` (object) — Updated payment method settings
    - _(object)_

  Example:

```json
{
  "message": "PayPal settings has been disconnected",
  "settings": {
    "is_active": "no",
    "payment_mode": "test",
    "checkout_label": "Pay with PayPal",
    "checkout_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/paypal.svg",
    "checkout_instructions": "",
    "thank_you_page_instructions": ""
  }
}
```



---

## POST `/settings/payment-methods/paypal/seller-auth-token`

**POST Exchange PayPal Seller Auth Token**

Exchange the PayPal authorization code for a seller access token during the PayPal Connect onboarding flow. This retrieves merchant credentials and saves them to the gateway settings.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `authCode` (string) **required** — The authorization code received from PayPal OAuth redirect.
- `sharedId` (string) **required** — The PayPal partner shared/client ID used during authentication.
- `mode` (string) **required** _(enum: `test`, `live`)_ — Environment mode: `test` or `live`.

Example:

```json
{
  "authCode": "C21AAF...",
  "sharedId": "AaBbCc...",
  "mode": "live"
}
```


**Responses**

- **200** — Successful response. Credentials are saved to the PayPal gateway settings and webhooks are automatically registered.

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "message": "PayPal account connected successfully",
  "merchant_id": "MERCHANTID1234567",
  "mode": "live",
  "webhook_id": "WH-LIVE-80021663MN711374V"
}
```



---

## GET `/settings/storage-drivers/active-drivers`

**GET Get Active Storage Drivers**

Retrieve only the currently active/enabled file storage drivers.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `drivers` (array<object>)
    - `key` (string)
    - `title` (string)
    - `is_active` (boolean)

  Example:

```json
{
  "drivers": [
    {
      "key": "local",
      "title": "Local Storage",
      "is_active": true
    }
  ]
}
```



---

## GET `/checkout-fields/get-fields`

**GET Get Checkout Fields**

Retrieve the checkout field configuration including the schema definition and current settings.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `fields` (object) — Checkout field schema definitions grouped by section
    - `basic_info` (object)
      - _(object)_
    - `billing_address` (object)
      - _(object)_
    - `shipping_address` (object)
      - _(object)_
  - `settings` (object) — Current checkout field settings grouped by section
    - `basic_info` (object)
      - _(object)_
    - `billing_address` (object)
      - _(object)_
    - `shipping_address` (object)
      - _(object)_

  Example:

```json
{
  "fields": {
    "basic_info": {
      "full_name": {
        "label": "Full Name",
        "type": "text",
        "configurable": true
      },
      "first_name": {
        "label": "First Name",
        "type": "text",
        "configurable": true
      },
      "last_name": {
        "label": "Last Name",
        "type": "text",
        "configurable": true
      },
      "email": {
        "label": "Email",
        "type": "email",
        "configurable": false
      }
    },
    "billing_address": {
      "address_1": {
        "label": "Address Line 1",
        "type": "text",
        "configurable": true
      },
      "address_2": {
        "label": "Address Line 2",
        "type": "text",
        "configurable": true
      },
      "city": {
        "label": "City",
        "type": "text",
        "configurable": true
      },
      "state": {
        "label": "State",
        "type": "select",
        "configurable": true
      },
      "postcode": {
        "label": "Postcode",
        "type": "text",
        "configurable": true
      },
      "country": {
        "label": "Country",
        "type": "select",
        "configurable": false
      },
      "phone": {
        "label": "Phone",
        "type": "tel",
        "configurable": true
      },
      "company": {
        "label": "Company",
        "type": "text",
        "configurable": true
      }
    },
    "shipping_address": {
      "address_1": {
        "label": "Address Line 1",
        "type": "text",
        "configurable": true
      },
      "address_2": {
        "label": "Address Line 2",
        "type": "text",
        "configurable": true
      },
      "city": {
        "label": "City",
        "type": "text",
        "configurable": true
      },
      "state": {
        "label": "State",
        "type": "select",
        "configurable": true
      },
      "postcode": {
        "label": "Postcode",
        "type": "text",
        "configurable": true
      },
      "country": {
        "label": "Country",
        "type": "select",
        "configurable": false
      }
    }
  },
  "settings": {
    "basic_info": {
      "full_name": {
        "enabled": "yes",
        "required": "yes"
      },
      "first_name": {
        "enabled": "no",
        "required": "no"
      },
      "last_name": {
        "enabled": "no",
        "required": "no"
      }
    },
    "billing_address": {
      "address_1": {
        "enabled": "yes",
        "required": "yes"
      },
      "address_2": {
        "enabled": "yes",
        "required": "no"
      },
      "city": {
        "enabled": "yes",
        "required": "yes"
      },
      "state": {
        "enabled": "yes",
        "required": "yes"
      },
      "postcode": {
        "enabled": "yes",
        "required": "yes"
      },
      "country": {
        "enabled": "yes",
        "required": "yes"
      },
      "phone": {
        "enabled": "yes",
        "required": "no"
      },
      "company": {
        "enabled": "yes",
        "required": "no"
      }
    },
    "shipping_address": {
      "address_1": {
        "enabled": "yes",
        "required": "yes"
      },
      "address_2": {
        "enabled": "yes",
        "required": "no"
      },
      "city": {
        "enabled": "yes",
        "required": "yes"
      },
      "state": {
        "enabled": "yes",
        "required": "yes"
      },
      "postcode": {
        "enabled": "yes",
        "required": "yes"
      },
      "country": {
        "enabled": "yes",
        "required": "yes"
      }
    }
  }
}
```



---

## GET `/settings/confirmation/shortcode`

**GET Get Email Shortcodes**

Retrieve available shortcodes/merge tags that can be used in email notification templates and confirmation messages.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Shortcode categories with available merge tags
    - `order` (object)
      - `title` (string)
      - `shortcodes` (object)
        - _(object)_
    - `customer` (object)
      - `title` (string)
      - `shortcodes` (object)
        - _(object)_
    - `store` (object)
      - `title` (string)
      - `shortcodes` (object)
        - _(object)_

  Example:

```json
{
  "data": {
    "order": {
      "title": "Order",
      "shortcodes": {
        "{{order.id}}": "Order ID",
        "{{order.invoice_no}}": "Invoice Number",
        "{{order.total_amount_formatted}}": "Total Amount (Formatted)",
        "{{order.status}}": "Order Status",
        "{{order.payment_method_title}}": "Payment Method",
        "{{order.receipt_url}}": "Receipt URL",
        "{{order.created_at}}": "Order Date",
        "{{order.customer_dashboard_link}}": "Customer Dashboard Link"
      }
    },
    "customer": {
      "title": "Customer",
      "shortcodes": {
        "{{customer.first_name}}": "First Name",
        "{{customer.last_name}}": "Last Name",
        "{{customer.email}}": "Email",
        "{{customer.full_name}}": "Full Name"
      }
    },
    "store": {
      "title": "Store",
      "shortcodes": {
        "{{store.name}}": "Store Name",
        "{{store.logo}}": "Store Logo",
        "{{store.address}}": "Store Address",
        "{{store.url}}": "Store URL"
      }
    }
  }
}
```



---

## GET `/settings/modules`

**GET Get Module Settings**

Retrieve all module (feature toggle) settings and their field definitions.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `fields` (object) — Module field definitions and schema
    - _(object)_
  - `settings` (object) — Current module settings with active status
    - _(object)_

  Example:

```json
{
  "fields": {
    "modules_settings": {
      "title": "Features & addon",
      "type": "section",
      "class": "no-padding",
      "disable_nesting": true,
      "columns": {
        "default": 1,
        "md": 1
      },
      "schema": {
        "shipping": {
          "title": "Shipping",
          "type": "toggle",
          "description": "Enable shipping module for physical products"
        },
        "tax": {
          "title": "Tax",
          "type": "toggle",
          "description": "Enable tax calculation on orders"
        },
        "coupons": {
          "title": "Coupons",
          "type": "toggle",
          "description": "Enable coupon/discount code support"
        },
        "subscriptions": {
          "title": "Subscriptions",
          "type": "toggle",
          "description": "Enable subscription-based products"
        },
        "licensing": {
          "title": "Licensing",
          "type": "toggle",
          "description": "Enable software licensing"
        },
        "stock_management": {
          "title": "Stock Management",
          "type": "toggle",
          "description": "Track product inventory levels"
        }
      }
    }
  },
  "settings": {
    "shipping": {
      "active": "yes"
    },
    "tax": {
      "active": "no"
    },
    "coupons": {
      "active": "yes"
    },
    "subscriptions": {
      "active": "yes"
    },
    "licensing": {
      "active": "no"
    },
    "stock_management": {
      "active": "yes"
    }
  }
}
```



---

## GET `/settings/payment-methods/connect/info`

**GET Get Payment Method Connection Info**

Retrieve connection information (OAuth URLs, account status) for a connectable payment gateway.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `method` | string | yes | The payment method key (e.g., `stripe`, `paypal`). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `connect_config` (object)
    - `test_redirect` (string)
    - `live_redirect` (string)
    - `disconnect_note` (string)
  - `test_account` (object) — Test account information
    - _(object)_
  - `live_account` (object) — Live account information
    - _(object)_
  - `settings` (object) — Current payment method settings
    - _(object)_

  Example:

```json
{
  "connect_config": {
    "test_redirect": "https://example.com/wp-admin/?fluent-cart=paypal-connect&mode=test",
    "live_redirect": "https://example.com/wp-admin/?fluent-cart=paypal-connect&mode=live",
    "disconnect_note": "Disconnecting will prevent PayPal from processing payments. Existing subscriptions will not be affected until their next renewal."
  },
  "test_account": {
    "merchant_id": "TESTMERCHANT123",
    "email": "seller-test@example.com",
    "connected": true,
    "webhook_id": "WH-TEST-1234567890"
  },
  "live_account": {
    "merchant_id": "LIVEMERCHANT456",
    "email": "payments@techstore.com",
    "connected": true,
    "webhook_id": "WH-LIVE-0987654321"
  },
  "settings": {
    "is_active": "yes",
    "payment_mode": "live",
    "checkout_label": "Pay with PayPal",
    "checkout_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/paypal.svg"
  }
}
```



---

## GET `/settings/payment-methods`

**GET Get Payment Method Settings**

Retrieve the configuration and settings for a specific payment method gateway (e.g., Stripe, PayPal).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `method` | string | yes | The payment method key to retrieve settings for (e.g., `stripe`, `paypal`, `cod`). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `settings` (object) — Payment method settings object
    - `is_active` (string)
    - `payment_mode` (string)
    - `checkout_label` (string)
    - `checkout_logo` (string)
    - `checkout_instructions` (string)
    - `thank_you_page_instructions` (string)
  - `fields` (object) — Settings fields schema
    - _(object)_

  Example:

```json
{
  "settings": {
    "is_active": "yes",
    "payment_mode": "live",
    "checkout_label": "Pay with Stripe",
    "checkout_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/stripe.svg",
    "checkout_instructions": "Your payment information is processed securely via Stripe.",
    "thank_you_page_instructions": "Thank you! Your payment has been processed successfully."
  },
  "fields": {
    "general": {
      "title": "General Settings",
      "type": "section",
      "schema": {
        "is_active": {
          "label": "Active",
          "type": "toggle"
        },
        "payment_mode": {
          "label": "Payment Mode",
          "type": "select",
          "options": [
            "test",
            "live"
          ]
        }
      }
    },
    "api_keys": {
      "title": "API Keys",
      "type": "section",
      "schema": {
        "live_publishable_key": {
          "label": "Live Publishable Key",
          "type": "text"
        },
        "live_secret_key": {
          "label": "Live Secret Key",
          "type": "password"
        },
        "test_publishable_key": {
          "label": "Test Publishable Key",
          "type": "text"
        },
        "test_secret_key": {
          "label": "Test Secret Key",
          "type": "password"
        }
      }
    }
  }
}
```



---

## GET `/settings/permissions`

**GET Get Permissions**

Retrieve the current role-to-capability permission mappings for FluentCart.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `roles` (object) — Role-to-capability mapping
    - _(object)_

  Example:

```json
{
  "roles": {
    "administrator": {
      "name": "Administrator",
      "capabilities": {
        "orders/view": true,
        "orders/manage": true,
        "customers/view": true,
        "customers/manage": true,
        "products/manage": true,
        "subscriptions/view": true,
        "subscriptions/manage": true,
        "settings/manage": true,
        "reports/view": true,
        "coupons/manage": true,
        "shipping/manage": true,
        "tax/manage": true
      }
    },
    "shop_manager": {
      "name": "Shop Manager",
      "capabilities": {
        "orders/view": true,
        "orders/manage": true,
        "customers/view": true,
        "customers/manage": true,
        "products/manage": true,
        "coupons/manage": true
      }
    },
    "editor": {
      "name": "Editor",
      "capabilities": {
        "orders/view": true,
        "customers/view": true
      }
    }
  }
}
```



---

## GET `/settings/modules/plugin-addons`

**GET Get Plugin Addons**

List all registered plugin addons (e.g., Elementor Blocks) with their installation and activation status.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `addons` (object) — Map of addon keys to addon details
    - _(object)_

  Example:

```json
{
  "addons": {
    "elementor-block": {
      "title": "Elementor Blocks",
      "description": "Enable to get Elementor Blocks for FluentCart. Minimum Requirement: Elementor V3.34",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/elementor.svg",
      "dark_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/elementor-dark.svg",
      "plugin_slug": "fluent-cart-elementor-blocks",
      "plugin_file": "fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php",
      "source_type": "cdn",
      "source_link": "https://addons-cdn.fluentcart.com/fluent-cart-elementor-blocks.zip",
      "upcoming": false,
      "repo_link": "https://fluentcart.com/fluentcart-addons",
      "is_installed": true,
      "is_active": true
    },
    "fluent-cart-pro": {
      "title": "FluentCart Pro",
      "description": "Pro features including licensing, advanced roles, order bumps, and more",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/pro.svg",
      "dark_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/pro-dark.svg",
      "plugin_slug": "fluent-cart-pro",
      "plugin_file": "fluent-cart-pro/fluent-cart-pro.php",
      "source_type": "cdn",
      "source_link": "https://addons-cdn.fluentcart.com/fluent-cart-pro.zip",
      "upcoming": false,
      "repo_link": "https://fluentcart.com/pricing",
      "is_installed": true,
      "is_active": true
    }
  }
}
```



---

## GET `/settings/storage-drivers/{driver}`

**GET Get Storage Driver Settings**

Retrieve the configuration settings and field schema for a specific storage driver.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `driver` | string | yes | The storage driver key (e.g., `local`, `s3`, `bunny`). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `settings` (object) — Driver configuration settings
    - _(object)_
  - `fields` (object) — Settings field schema definitions
    - _(object)_

  Example:

```json
{
  "settings": {
    "access_key": "AKIAIOSFODNN7EXAMPLE",
    "secret_key": "****",
    "bucket": "techstore-downloads",
    "region": "us-east-1",
    "is_active": true,
    "base_url": "https://techstore-downloads.s3.amazonaws.com"
  },
  "fields": {
    "s3_config": {
      "title": "S3 Configuration",
      "type": "section",
      "schema": {
        "access_key": {
          "label": "Access Key ID",
          "type": "text",
          "required": true
        },
        "secret_key": {
          "label": "Secret Access Key",
          "type": "password",
          "required": true
        },
        "bucket": {
          "label": "Bucket Name",
          "type": "text",
          "required": true
        },
        "region": {
          "label": "Region",
          "type": "select",
          "required": true
        }
      }
    }
  }
}
```



---

## GET `/settings/store`

**GET Get Store Settings**

Retrieve all store configuration settings along with the field schema for a given settings tab.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `settings_name` | string | no | The settings tab to return fields for (e.g., `store_setup`, `checkout`, `pages`). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `settings` (object) — Store settings object
    - `store_name` (string)
    - `currency` (string)
    - `currency_position` (string)
    - `decimal_separator` (string)
    - `checkout_button_text` (string)
    - `view_cart_button_text` (string)
    - `cart_button_text` (string)
    - `popup_button_text` (string)
    - `out_of_stock_button_text` (string)
    - `checkout_method_style` (string)
    - `enable_modal_checkout` (string)
    - `require_logged_in` (string)
    - `show_cart_icon_in_nav` (string)
    - `show_cart_icon_in_body` (string)
    - `additional_address_field` (string)
    - `hide_coupon_field` (string)
    - `user_account_creation_mode` (string)
    - `checkout_page_id` (string)
    - `cart_page_id` (string)
    - `receipt_page_id` (string)
    - `shop_page_id` (string)
    - `customer_profile_page_id` (string)
    - `store_address1` (string)
    - `store_address2` (string)
    - `store_city` (string)
    - `store_country` (string)
    - `store_postcode` (string)
    - `store_state` (string)
    - `order_mode` (string)
    - `variation_view` (string)
    - `variation_columns` (string)
    - `min_receipt_number` (string)
    - `inv_prefix` (string)
    - `show_email_footer` (string)
  - `fields` (object) — Settings fields schema for the requested tab
    - _(object)_

  Example:

```json
{
  "settings": {
    "store_name": "TechStore Inc.",
    "currency": "USD",
    "currency_position": "before",
    "decimal_separator": "dot",
    "checkout_button_text": "Checkout",
    "view_cart_button_text": "View Cart",
    "cart_button_text": "Add To Cart",
    "popup_button_text": "View Product",
    "out_of_stock_button_text": "Not Available",
    "checkout_method_style": "logo",
    "enable_modal_checkout": "no",
    "require_logged_in": "no",
    "show_cart_icon_in_nav": "no",
    "show_cart_icon_in_body": "yes",
    "additional_address_field": "yes",
    "hide_coupon_field": "no",
    "user_account_creation_mode": "all",
    "checkout_page_id": "12",
    "cart_page_id": "14",
    "receipt_page_id": "16",
    "shop_page_id": "18",
    "customer_profile_page_id": "20",
    "store_address1": "456 Market Street",
    "store_address2": "Suite 200",
    "store_city": "San Francisco",
    "store_country": "US",
    "store_postcode": "94102",
    "store_state": "CA",
    "order_mode": "live",
    "variation_view": "both",
    "variation_columns": "masonry",
    "min_receipt_number": "1",
    "inv_prefix": "INV-",
    "show_email_footer": "yes"
  },
  "fields": {
    "store_setup": {
      "store_name": {
        "label": "Store Name",
        "type": "text",
        "required": true
      },
      "currency": {
        "label": "Currency",
        "type": "select",
        "required": true
      },
      "store_country": {
        "label": "Country",
        "type": "select",
        "required": true
      }
    }
  }
}
```



---

## POST `/settings/payment-methods/install-addon`

**POST Install Payment Addon**

Install a payment gateway addon plugin from a remote source (WordPress.org or GitHub).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `plugin_slug` (string) **required** — The slug of the plugin to install (e.g., `fluent-cart-pro`).
- `source_type` (string) **required** _(enum: `wordpress`, `github`)_ — Source type: `wordpress` (WordPress.org) or `github`.
- `source_link` (string) — The URL to the plugin source. Required when `source_type` is `github`.

Example:

```json
{
  "plugin_slug": "fluent-cart-pro",
  "source_type": "wordpress"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `plugin_file` (string)

  Example:

```json
{
  "message": "Payment addon installed successfully!",
  "plugin_file": "fluent-cart-pro/fluent-cart-pro.php"
}
```



---

## POST `/settings/modules/plugin-addons/install`

**POST Install Plugin Addon**

Install a registered plugin addon from its configured source (WordPress.org, GitHub, or CDN).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `plugin_slug` (string) **required** — The slug of the addon to install. Must match a registered addon slug.
- `source_type` (string) _(enum: `wordpress`, `github`, `cdn`)_ — Source type: `wordpress`, `github`, or `cdn`. Defaults to the addon's registered source.
- `source_link` (string) — URL to the addon source. Defaults to the addon's registered source link.
- `asset_path` (string) — GitHub release asset path (defaults to `zipball_url`).

Example:

```json
{
  "plugin_slug": "fluent-cart-elementor-blocks"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `plugin_file` (string)

  Example:

```json
{
  "message": "Addon installed successfully",
  "plugin_file": "fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php"
}
```



---

## GET `/settings/payment-methods/all`

**GET List All Payment Methods**

Retrieve all registered payment method gateways categorized by availability status.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `gateways` (array<object>)
    - `method_key` (string)
    - `title` (string)
    - `is_active` (string)
    - `description` (string)
    - `logo` (string)
    - `upcoming` (boolean)
    - `requires_pro` (boolean)

  Example:

```json
{
  "gateways": [
    {
      "method_key": "stripe",
      "title": "Stripe",
      "is_active": "yes",
      "description": "Accept credit and debit card payments via Stripe",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/stripe.svg",
      "upcoming": false,
      "requires_pro": false
    },
    {
      "method_key": "paypal",
      "title": "PayPal",
      "is_active": "yes",
      "description": "Accept payments via PayPal",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/paypal.svg",
      "upcoming": false,
      "requires_pro": true
    },
    {
      "method_key": "cod",
      "title": "Cash on Delivery",
      "is_active": "no",
      "description": "Accept cash payment upon delivery",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/cod.svg",
      "upcoming": false,
      "requires_pro": false
    },
    {
      "method_key": "square",
      "title": "Square",
      "is_active": "no",
      "description": "Accept payments via Square",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/square.svg",
      "upcoming": false,
      "requires_pro": true
    }
  ]
}
```



---

## GET `/settings/storage-drivers`

**GET List All Storage Drivers**

Retrieve all registered file storage drivers and their current status.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `drivers` (array<object>)
    - `key` (string)
    - `title` (string)
    - `description` (string)
    - `is_active` (boolean)
    - `logo` (string)

  Example:

```json
{
  "drivers": [
    {
      "key": "local",
      "title": "Local Storage",
      "description": "Store files on your server",
      "is_active": true,
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/local-storage.svg"
    },
    {
      "key": "s3",
      "title": "Amazon S3",
      "description": "Store files on Amazon S3 cloud storage",
      "is_active": false,
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/s3.svg"
    },
    {
      "key": "bunny",
      "title": "Bunny CDN",
      "description": "Store files on Bunny CDN storage",
      "is_active": false,
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/bunny.svg"
    }
  ]
}
```



---

## POST `/settings/payment-methods/reorder`

**POST Reorder Payment Methods**

Set the display order of payment methods on the checkout page.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `order` (array<string>) **required** — Ordered array of payment method keys.

Example:

```json
{
  "order": [
    "stripe",
    "paypal",
    "cod"
  ]
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `order` (array<string>)

  Example:

```json
{
  "message": "Payment methods order saved successfully",
  "order": [
    "stripe",
    "paypal",
    "cod"
  ]
}
```



---

## POST `/checkout-fields/save-fields`

**POST Save Checkout Fields**

Update the checkout field visibility and required settings. The endpoint enforces name field logic automatically: if `first_name` or `last_name` is enabled, `full_name` is automatically disabled; if neither is enabled, `full_name` is automatically enabled and marked as required.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required** — Checkout field settings object. Only keys matching existing settings are accepted.
  - `basic_info` (object) — Basic information field settings.
    - _(object)_
  - `billing_address` (object) — Billing address field settings (same structure as `basic_info`).
    - _(object)_
  - `shipping_address` (object) — Shipping address field settings (same structure as `basic_info`).
    - _(object)_

Example:

```json
{
  "settings": {
    "basic_info": {
      "full_name": {
        "enabled": "no",
        "required": "no"
      },
      "first_name": {
        "enabled": "yes",
        "required": "yes"
      },
      "last_name": {
        "enabled": "yes",
        "required": "no"
      }
    }
  }
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Checkout fields has been updated successfully."
}
```



---

## POST `/settings/confirmation`

**POST Save Confirmation Settings**

Update the order confirmation/receipt page settings, including the confirmation type, message content, and the receipt page assignment.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required** — Confirmation settings object.
  - `confirmation_type` (string) _(enum: `same_page`, `custom_page`)_ — Confirmation behavior: `same_page` (show confirmation on same page) or `custom_page` (redirect to a custom page).
  - `message_to_show` (string) — HTML content to display as the order confirmation message. Sanitized with `wp_kses_post`.
  - `confirmation_page_id` (integer) — WordPress page ID for a custom confirmation/receipt page. Also updates the store's `receipt_page_id`.

Example:

```json
{
  "settings": {
    "confirmation_type": "custom_page",
    "confirmation_page_id": 42,
    "message_to_show": "<h2>Order Confirmed!</h2><p>Thank you for your purchase.</p>"
  }
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `confirmation_type` (string)
  - `message_to_show` (string)

  Example:

```json
{
  "confirmation_type": "same_page",
  "message_to_show": "<p>Thank you for your order!</p>"
}
```



---

## POST `/settings/modules`

**POST Save Module Settings**

Enable or disable modules (features) and update their configuration. Fires `fluent_cart/module/activated/{key}` or `fluent_cart/module/deactivated/{key}` hooks when a module's active status changes.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- _(object)_

Example:

```json
{
  "shipping": {
    "active": "yes"
  },
  "tax": {
    "active": "no"
  },
  "coupons": {
    "active": "yes"
  },
  "subscriptions": {
    "active": "yes"
  },
  "licensing": {
    "active": "no"
  },
  "stock_management": {
    "active": "yes"
  }
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Settings saved successfully"
}
```



---

## POST `/settings/payment-methods/design`

**POST Save Payment Method Design**

Customize the checkout appearance for a specific payment method, including its label, logo, and instructions.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `method` (string) **required** — The payment method key (e.g., `stripe`, `paypal`, `cod`).
- `checkout_label` (string) — Custom label displayed on the checkout form for this method.
- `checkout_logo` (string) — URL to a custom logo image for the checkout form.
- `checkout_instructions` (string) — HTML instructions shown on the checkout page when this method is selected.
- `thank_you_page_instructions` (string) — HTML instructions shown on the thank-you/receipt page.

Example:

```json
{
  "method": "stripe",
  "checkout_label": "Credit / Debit Card",
  "checkout_logo": "https://example.com/card-icon.png",
  "checkout_instructions": "<p>You will be charged securely via Stripe.</p>"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `settings` (object) — Updated payment method settings
    - _(object)_

  Example:

```json
{
  "message": "Checkout design settings saved",
  "settings": {
    "is_active": "yes",
    "payment_mode": "live",
    "checkout_label": "Credit / Debit Card",
    "checkout_logo": "https://example.com/wp-content/uploads/card-icon.png",
    "checkout_instructions": "<p>You will be charged securely via Stripe.</p>",
    "thank_you_page_instructions": "<p>Your payment was processed successfully. A receipt has been sent to your email.</p>"
  }
}
```



---

## POST `/settings/payment-methods`

**POST Save Payment Method Settings**

Create or update the configuration for a specific payment method gateway.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `method` (string) **required** — The payment method key (e.g., `stripe`, `paypal`, `cod`).
- `settings` (object) **required** — Key-value object of gateway-specific settings to save. Fields vary by payment method.
  - _(object)_

Example:

```json
{
  "method": "cod",
  "settings": {
    "is_active": "yes",
    "checkout_label": "Cash on Delivery"
  }
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `settings` (object) — Updated payment method settings
    - _(object)_
  - `message` (string)

  Example:

```json
{
  "settings": {
    "is_active": "yes",
    "payment_mode": "live",
    "checkout_label": "Cash on Delivery",
    "checkout_logo": "",
    "checkout_instructions": "Pay with cash when your order is delivered.",
    "thank_you_page_instructions": "Please have the exact amount ready for the delivery driver."
  },
  "message": "Settings saved successfully"
}
```



---

## POST `/settings/permissions`

**POST Save Permissions**

Update the role-to-capability permission mappings for FluentCart.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `capability` (object) **required** — An object mapping WordPress role slugs to their FluentCart capability assignments.
  - _(object)_

Example:

```json
{
  "capability": {
    "shop_manager": {
      "orders/view": true,
      "orders/manage": true,
      "customers/view": true,
      "customers/manage": true,
      "products/manage": true,
      "coupons/manage": true,
      "subscriptions/view": false,
      "settings/manage": false
    },
    "editor": {
      "orders/view": true,
      "orders/manage": false,
      "customers/view": true,
      "products/manage": false
    }
  }
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Permissions saved successfully"
}
```



---

## POST `/settings/storage-drivers`

**POST Save Storage Driver Settings**

Create or update settings for a specific file storage driver.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — The storage driver key (e.g., `local`, `s3`, `bunny`).
- `settings` (object) **required** — Driver-specific configuration settings. Fields vary by driver.
  - _(object)_

Example:

```json
{
  "driver": "s3",
  "settings": {
    "access_key": "AKIA...",
    "secret_key": "wJalr...",
    "bucket": "my-store-files",
    "region": "us-east-1"
  }
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `data` (object) — Saved driver settings
    - _(object)_

  Example:

```json
{
  "message": "Settings saved successfully",
  "data": {
    "access_key": "AKIAIOSFODNN7EXAMPLE",
    "secret_key": "****",
    "bucket": "techstore-downloads",
    "region": "us-east-1",
    "is_active": true,
    "base_url": "https://techstore-downloads.s3.amazonaws.com"
  }
}
```



---

## POST `/settings/store`

**POST Save Store Settings**

Update store configuration settings. Submitted values are merged with existing settings.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings_name` (string) — Settings tab identifier. Required for `store_setup` tab validation (enforces `store_name` and `store_country`).
- `store_name` (string) — Store name. Required when `settings_name` is `store_setup`. Max 200 characters.
- `store_logo` (object) — Store logo with `id`, `url`, and `title`.
  - `id` (integer)
  - `url` (string) _(format: uri)_
  - `title` (string)
- `currency` (string) — Store currency code (e.g., `USD`, `EUR`, `GBP`).
- `currency_position` (string) — Currency symbol position: `before` or `after`.
- `decimal_separator` (string) — Decimal separator style: `dot` or `comma`.
- `checkout_button_text` (string) — Custom text for the checkout button.
- `view_cart_button_text` (string) — Custom text for the view cart button.
- `cart_button_text` (string) — Custom text for the add-to-cart button.
- `popup_button_text` (string) — Custom text for the product popup button.
- `out_of_stock_button_text` (string) — Custom text for the out-of-stock button.
- `checkout_method_style` (string) — Payment method display on checkout: `logo` or other styles.
- `enable_modal_checkout` (string) — Enable modal/popup checkout: `yes` or `no`.
- `show_cart_icon_in_nav` (string) — Show cart icon in navigation: `yes` or `no`.
- `show_cart_icon_in_body` (string) — Show floating cart icon: `yes` or `no`.
- `additional_address_field` (string) — Show additional address field: `yes` or `no`.
- `hide_coupon_field` (string) — Hide coupon input on checkout: `yes` or `no`.
- `user_account_creation_mode` (string) — Account creation mode: `all`, `optional`, or `disabled`.
- `force_ssl` (string) — Force SSL on checkout: `yes` or `no`.
- `checkout_page_id` (integer) — WordPress page ID for the checkout page.
- `cart_page_id` (integer) — WordPress page ID for the cart page.
- `receipt_page_id` (integer) — WordPress page ID for the order receipt page.
- `shop_page_id` (integer) — WordPress page ID for the shop page.
- `customer_profile_page_id` (integer) — WordPress page ID for the customer profile page.
- `store_country` (string) — Store country code. Required when `settings_name` is `store_setup`. Max 200 characters.
- `store_state` (string) — Store state/province code.
- `store_city` (string) — Store city.
- `store_address1` (string) — Store address line 1.
- `store_address2` (string) — Store address line 2.
- `store_postcode` (string) — Store postal/zip code.
- `order_mode` (string) — Order/payment mode: `test` or `live`.
- `variation_view` (string) — Product variation display: `both`, `grid`, or `list`.
- `variation_columns` (string) — Variation layout style: `masonry` or other layouts.
- `product_slug` (string) — Custom product URL slug.
- `min_receipt_number` (string) — Minimum receipt/invoice number.
- `inv_prefix` (string) — Invoice number prefix (e.g., `INV-`).
- `frontend_theme` (object) — Theme color overrides. Object of key-value pairs where values are hex colors.
  - _(object)_

Example:

```json
{
  "settings_name": "store_setup",
  "store_name": "TechStore Inc.",
  "store_country": "US",
  "store_state": "CA",
  "store_city": "San Francisco",
  "store_address1": "456 Market Street",
  "store_postcode": "94102",
  "currency": "USD",
  "currency_position": "before",
  "decimal_separator": "dot",
  "order_mode": "live"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Updated store settings
    - _(object)_

  Example:

```json
{
  "data": {
    "store_name": "TechStore Inc.",
    "currency": "USD",
    "currency_position": "before",
    "decimal_separator": "dot",
    "store_country": "US",
    "store_state": "CA",
    "store_city": "San Francisco",
    "store_address1": "456 Market Street",
    "store_postcode": "94102",
    "order_mode": "live"
  }
}
```



---

## POST `/settings/payment-methods/paypal/webhook/setup`

**POST Setup PayPal Webhook**

Register a webhook endpoint with PayPal to receive payment event notifications.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `mode` (string) **required** _(enum: `test`, `live`)_ — Environment mode: `test` or `live`.

Example:

```json
{
  "mode": "live"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Webhook setup successfully! Please reload the page."
}
```



---

## POST `/settings/storage-drivers/verify-info`

**POST Verify Storage Driver Connection**

Test the connection to a storage driver using the provided credentials without saving them.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — The storage driver key (e.g., `s3`, `bunny`).
- `settings` (object) **required** — Driver-specific credentials and configuration to verify. Fields vary by driver.
  - _(object)_

Example:

```json
{
  "driver": "s3",
  "settings": {
    "access_key": "AKIA...",
    "secret_key": "wJalr...",
    "bucket": "my-store-files",
    "region": "us-east-1"
  }
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Connection verified successfully"
}
```



---
