# FluentCart API — Settings

39 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/settings/payment-methods/activate-addon`

**POST Activate Payment Addon**

Activate an already-installed payment gateway addon plugin.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/modules/plugin-addons/activate`

**POST Activate Plugin Addon**

Activate an already-installed plugin addon.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/payment-methods/paypal/webhook/check`

**GET Check PayPal Webhook**

Verify the current PayPal webhook registration status and set up the webhook if it is missing. If no PayPal API key has been connected yet for the given `mode`, returns `status`/`message` explaining that PayPal must be connected first. Otherwise it looks up (or registers) the webhook and returns the raw PayPal webhook object (`id`, `url`, `event_types`, `status`) verbatim.

**Required permission:** `super_admin`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | string | yes | Environment mode: `test` or `live`. |


**Responses**

- **200** — Successful response. Returns either a not-connected status message, or the webhook configuration details from PayPal.

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "status": "false",
  "message": "No API key found for webhook setup. Please connect your PayPal account first."
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


- **403** — Authenticated, but the user lacks the required capability (`super_admin`).

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

## POST `/settings/payment-methods/disconnect`

**POST Disconnect Payment Method**

Disconnect a payment gateway account (e.g., revoke Stripe or PayPal connection).

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/payment-methods/paypal/seller-auth-token`

**POST Exchange PayPal Seller Auth Token**

Exchange the PayPal authorization code for a seller access token during the PayPal Connect onboarding flow. This retrieves merchant credentials and saves them to the gateway settings.

**Required permission:** `super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`super_admin`).

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

## GET `/settings/storage-drivers/active-drivers`

**GET Get Active Storage Drivers**

Retrieve only the currently active/enabled file storage drivers.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `drivers` (object) — Currently active/enabled storage drivers, keyed by driver slug.
    - _(object)_

  Example:

```json
{
  "drivers": {
    "local": {
      "title": "Local",
      "route": "local",
      "description": "Local allows to upload file in local file storage",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/storage-drivers/local.svg",
      "dark_logo": null,
      "status": true,
      "brand_color": "#136196",
      "has_bucket": false
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/checkout-fields/get-fields`

**GET Get Checkout Fields**

Retrieve the checkout field configuration including the schema definition and current settings.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

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


- **403** — Authenticated, but the user lacks the required capability.

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

## GET `/settings/confirmation/shortcode`

**GET Get Email Shortcodes**

Retrieve available shortcodes/merge tags that can be used in email notification templates and confirmation messages.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Shortcode categories with available merge tags, keyed by group name.
    - `order` (object)
      - `title` (string)
      - `key` (string) — Internal group key used to namespace the shortcodes.
      - `shortcodes` (object) — Map of shortcode tag to human-readable label.
        - _(object)_
    - `general` (object)
      - `title` (string)
      - `key` (string) — Internal group key used to namespace the shortcodes.
      - `shortcodes` (object) — Map of shortcode tag to human-readable label.
        - _(object)_
    - `customer` (object)
      - `title` (string)
      - `key` (string) — Internal group key used to namespace the shortcodes.
      - `shortcodes` (object) — Map of shortcode tag to human-readable label.
        - _(object)_
    - `transaction` (object)
      - `title` (string)
      - `key` (string) — Internal group key used to namespace the shortcodes.
      - `shortcodes` (object) — Map of shortcode tag to human-readable label.
        - _(object)_
    - `settings` (object)
      - `title` (string)
      - `key` (string) — Internal group key used to namespace the shortcodes.
      - `shortcodes` (object) — Map of shortcode tag to human-readable label.
        - _(object)_
      - `group` (string)
    - `license` (object)
      - `title` (string)
      - `shortcodes` (object) — Map of shortcode tag to human-readable label.
        - _(object)_

  Example:

```json
{
  "data": {
    "order": {
      "title": "Order",
      "key": "order",
      "shortcodes": {
        "{{order.id}}": "Order ID",
        "{{order.customer_dashboard_link}}": "Customer Dashboard Link",
        "{{order.payment_link}}": "Order Payment Link",
        "{{order.status}}": "Order Status",
        "{{order.invoice_no}}": "Order Number",
        "{{order.total_amount_formatted}}": "Order Total Amount (Formatted)",
        "{{order.payment_method_title}}": "Order Payment Method Title",
        "{{order.created_at}}": "Order Create Date",
        "{{order.downloads}}": "Order Downloads",
        "{{order.item_count}}": "Order Item Count"
      }
    },
    "general": {
      "title": "General",
      "key": "wp",
      "shortcodes": {
        "{{wp.admin_email}}": "Admin Email",
        "{{wp.site_url}}": "Site URL",
        "{{wp.site_title}}": "Site Title",
        "{{user.ID}}": "User ID",
        "{{user.display_name}}": "User Display Name",
        "{{user.first_name}}": "User First Name",
        "{{user.last_name}}": "User Last Name",
        "{{user.user_email}}": "User Email",
        "{{user.user_login}}": "User Username"
      }
    },
    "customer": {
      "key": "customer",
      "title": "Customer",
      "shortcodes": {
        "{{order.billing.full_name}}": "Full Name",
        "{{order.billing.email}}": "Email",
        "{{order.billing.city}}": "City",
        "{{order.billing.state}}": "State",
        "{{order.billing.postcode}}": "Postcode",
        "{{order.billing.country}}": "Country",
        "{{order.billing.address_1}}": "Address Line 1",
        "{{order.billing.address_2}}": "Address Line 2",
        "{{order.shipping.city}}": "City",
        "{{order.shipping.state}}": "State",
        "{{order.shipping.postcode}}": "Postcode",
        "{{order.shipping.country}}": "Country",
        "{{order.shipping.address_1}}": "Address Line 1",
        "{{order.shipping.address_2}}": "Address Line 2"
      }
    },
    "transaction": {
      "title": "transaction",
      "key": "settings",
      "shortcodes": {
        "{{transaction.total}}": "Total Amount",
        "{{transaction.total_formatted}}": "Total Amount (Formatted)",
        "{{transaction.refund_amount}}": "Refund Amount",
        "{{transaction.refund_amount_formatted}}": "Refund Amount (Formatted)",
        "{{transaction.payment_method}}": "Payment Method",
        "{{transaction.card_last_4}}": "Card Last 4",
        "{{transaction.card_brand}}": "Card Brand",
        "{{transaction.status}}": "Status",
        "{{transaction.currency}}": "Currency"
      }
    },
    "settings": {
      "title": "Settings",
      "key": "settings",
      "shortcodes": {
        "{{settings.store_name}}": "Store Name",
        "{{settings.store_logo}}": "Store Logo",
        "{{settings.store_address}}": "Store Address Line 1",
        "{{settings.store_address2}}": "Store Address Line 2",
        "{{settings.store_country}}": "Store Country",
        "{{settings.store_state}}": "Store State",
        "{{settings.store_city}}": "Store City",
        "{{settings.store_postcode}}": "Store Postcode",
        "{{settings.company_name}}": "Company Name",
        "{{settings.legal_registration_id}}": "Legal Registration ID",
        "{{settings.seller_vat_id}}": "Seller VAT ID",
        "{{settings.seller_tax_id}}": "Seller Tax ID"
      },
      "group": "settings"
    },
    "license": {
      "title": "License",
      "shortcodes": {
        "{{order.licenses}}": "Order Licenses"
      }
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/modules`

**GET Get Module Settings**

Retrieve all module (feature toggle) settings and their field definitions.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/payment-methods/connect/info`

**GET Get Payment Method Connection Info**

Retrieve connection information (OAuth URLs, account status) for a connectable payment gateway.

**Required permission:** `is_super_admin`

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
    "email": "payments@example.com",
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/payment-methods`

**GET Get Payment Method Settings**

Retrieve the configuration and settings for a specific payment method gateway (e.g., Stripe, PayPal).

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/permissions`

**GET Get Permissions**

Retrieve the current role-to-capability permission mappings for FluentCart.

**Also used by the roles & permissions UI.** Retrieve a list of available WordPress roles and the currently configured capability permissions.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/modules/plugin-addons`

**GET Get Plugin Addons**

List all registered plugin addons (e.g., Elementor Blocks) with their installation and activation status.

**Required permission:** `is_super_admin`

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
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/elementor/black.svg",
      "dark_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/elementor/white.svg",
      "plugin_slug": "fluent-cart-elementor-blocks",
      "plugin_file": "fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php",
      "source_type": "cdn",
      "source_link": "https://addons-cdn.fluentcart.com/fluent-cart-elementor-blocks.zip",
      "upcoming": false,
      "repo_link": "https://fluentcart.com/fluentcart-addons/",
      "is_installed": true,
      "is_active": true
    },
    "fluent-cart-bricks-blocks": {
      "title": "FluentCart Bricks Blocks",
      "description": "Enable to get Bricks Builder elements for FluentCart. Requires the Bricks theme.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/bricks/logo.png",
      "plugin_slug": "fluent-cart-bricks-blocks",
      "plugin_file": "fluent-cart-bricks-blocks/fluent-cart-bricks-blocks.php",
      "source_type": "cdn",
      "source_link": "https://addons-cdn.fluentcart.com/fluent-cart-bricks-blocks.zip",
      "license_required": {
        "enabled": false,
        "parent_product_id": 10
      },
      "upcoming": false,
      "repo_link": "https://fluentcart.com/fluentcart-addons/",
      "is_installed": false,
      "is_active": false
    },
    "fluent-cart-divi-modules": {
      "title": "FluentCart Divi Modules",
      "description": "Native Divi 5 modules for FluentCart products, cart, and checkout. Requires Divi 5.0+ and FluentCart 1.3.4+.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/divi/black.svg",
      "dark_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/divi/white.svg",
      "plugin_slug": "fluent-cart-divi-modules",
      "plugin_file": "fluent-cart-divi-modules/fluent-cart-divi-modules.php",
      "source_type": "cdn",
      "source_link": "https://addons-cdn.fluentcart.com/fluent-cart-divi-modules.zip",
      "license_required": {
        "enabled": false,
        "parent_product_id": 10
      },
      "upcoming": false,
      "repo_link": "https://fluentcart.com/fluentcart-addons/",
      "is_installed": false,
      "is_active": false
    },
    "fluent-pdf": {
      "title": "Fluent PDF",
      "description": "Generate PDF receipts and attach them to email notifications.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/fluent-pdf/black.svg",
      "dark_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/fluent-pdf/white.svg",
      "plugin_slug": "fluentforms-pdf",
      "plugin_file": "fluentforms-pdf/fluentforms-pdf.php",
      "source_type": "wordpress",
      "upcoming": false,
      "is_installed": false,
      "is_active": false
    },
    "fluent-cart-migrator": {
      "title": "FluentCart Migrator",
      "description": "Migrate your store data to FluentCart from other eCommerce platforms.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/logo.svg",
      "plugin_slug": "fluent-cart-migrator",
      "plugin_file": "fluent-cart-migrator/fluent-cart-migrator.php",
      "source_type": "cdn",
      "source_link": "https://addons-cdn.fluentcart.com/fluent-cart-migrator.zip",
      "upcoming": false,
      "repo_link": "https://fluentcart.com/fluentcart-addons/?3181_search=Migrator",
      "is_installed": false,
      "is_active": false
    },
    "fluent-cart-customer-rights": {
      "title": "FluentCart Customer Rights",
      "description": "Manage customer withdrawal, refund, return, and cancellation requests with dedicated forms, workflows, notifications, and admin tools.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/fluent-cart-resolution/logo.svg",
      "plugin_slug": "fluent-cart-customer-rights",
      "plugin_file": "fluent-cart-customer-rights/fluent-cart-customer-rights.php",
      "source_type": "cdn",
      "source_link": "https://addons-cdn.fluentcart.com/fluent-cart-customer-rights.zip",
      "license_required": {
        "enabled": false,
        "parent_product_id": 10
      },
      "upcoming": false,
      "repo_link": "https://fluentcart.com/fluentcart-addons/",
      "is_installed": false,
      "is_active": false
    },
    "fluent-cart-page-history": {
      "title": "FluentCart Page History",
      "description": "Track customer browsing journeys before checkout and view page history on order details.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/cart.svg",
      "plugin_slug": "fluent-cart-page-history",
      "plugin_file": "fluent-cart-page-history/fluent-cart-page-history.php",
      "source_type": "cdn",
      "source_link": "https://fluentcart.com/?fluent-cart=get_license_version",
      "license_required": {
        "enabled": true,
        "parent_product_id": 10
      },
      "upcoming": false,
      "repo_link": "https://fluentcart.com/fluentcart-addons/",
      "is_installed": true,
      "is_active": true
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/storage-drivers/{driver}`

**GET Get Storage Driver Settings**

Retrieve the configuration settings and field schema for a specific storage driver.

**Required permission:** `is_super_admin`

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
    "bucket": "example-store-downloads",
    "region": "us-east-1",
    "is_active": true,
    "base_url": "https://example-store-downloads.s3.amazonaws.com"
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/store`

**GET Get Store Settings**

Retrieve all store configuration settings along with the field schema for a given settings tab.

**Required permission:** `store/settings`

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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## POST `/settings/payment-methods/install-addon`

**POST Install Payment Addon**

Install a payment gateway addon plugin from a remote source (WordPress.org or GitHub).

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/modules/plugin-addons/install`

**POST Install Plugin Addon**

Install a registered plugin addon from its configured source (WordPress.org, GitHub, or CDN).

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/payment-methods/all`

**GET List All Payment Methods**

Retrieve all registered payment method gateways categorized by availability status.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `gateways` (array<object>)
    - `title` (string) — Payment type label (e.g. the card brand group)
    - `route` (string) — Gateway route/handler slug
    - `slug` (string) — Gateway slug identifier
    - `label` (string) — Gateway display label
    - `admin_title` (string) — Admin-facing title for the gateway. Only present for gateways that define one.
    - `description` (string)
    - `logo` (string)
    - `icon` (string) — Small gateway icon URL
    - `status` (boolean) — Whether the gateway is currently enabled/connected
    - `brand_color` (string) — Gateway brand color as a hex code
    - `upcoming` (boolean)
    - `requires_pro` (boolean) — Present and set to `true` only for gateways that require FluentCart Pro to activate.
    - `supported_features` (object) — Feature flags supported by this gateway. Encoded as a mixed array: numeric keys list supported feature names (e.g. `payment`, `refund`, `webhook`, `subscriptions`), and `switch_payment_method` is an object listing gateways this one can switch to/from.
      - _(object)_

  Example:

```json
{
  "gateways": [
    {
      "title": "Card",
      "route": "stripe",
      "slug": "stripe",
      "label": "Stripe",
      "admin_title": "Stripe",
      "description": "Stripe's payments platform lets you accept credit cards, debit cards, and popular payment methods around the world all with a single integration.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/payment-methods/card.svg",
      "icon": "https://example.com/wp-content/plugins/fluent-cart/assets/images/payment-methods/stripe-icon.svg",
      "status": true,
      "brand_color": "#635bff",
      "upcoming": false,
      "supported_features": {
        "0": "payment",
        "1": "refund",
        "2": "webhook",
        "3": "custom_payment",
        "4": "card_update",
        "5": "dispute_handler",
        "6": "subscriptions",
        "switch_payment_method": {
          "supported_gateways": [
            "stripe",
            "paypal"
          ]
        }
      }
    },
    {
      "title": "PayPal",
      "route": "paypal",
      "slug": "paypal",
      "label": "PayPal",
      "description": "PayPal is the faster, safer way to send and receive money or make an online payment. Get started or create a merchant account to accept payments.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/payment-methods/paypal-icon.svg",
      "icon": "https://example.com/wp-content/plugins/fluent-cart/assets/images/payment-methods/paypal-icon.svg",
      "brand_color": "#60cdff",
      "status": true,
      "upcoming": false,
      "supported_features": {
        "0": "payment",
        "1": "refund",
        "2": "webhook",
        "3": "subscriptions"
      }
    },
    {
      "title": "Square",
      "route": "square",
      "slug": "square",
      "label": "Square",
      "description": "Accept payments via Square.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/payment-methods/square.svg",
      "icon": "https://example.com/wp-content/plugins/fluent-cart/assets/images/payment-methods/square-icon.svg",
      "brand_color": "#000000",
      "status": false,
      "upcoming": false,
      "requires_pro": true,
      "supported_features": {
        "0": "payment",
        "1": "refund"
      }
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/storage-drivers`

**GET List All Storage Drivers**

Retrieve all registered file storage drivers and their current status.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `drivers` (object) — Registered storage drivers keyed by driver slug (e.g. `local`, `s3`, `r2`).
    - _(object)_

  Example:

```json
{
  "drivers": {
    "local": {
      "title": "Local",
      "route": "local",
      "description": "Local allows to upload file in local file storage",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/storage-drivers/local.svg",
      "dark_logo": null,
      "status": true,
      "brand_color": "#136196",
      "has_bucket": false,
      "instance": {
        "slug": "local",
        "title": "Local",
        "brandColor": "#136196"
      }
    },
    "s3": {
      "title": "S3",
      "route": "s3",
      "description": "S3 bucket allows to configure storage options and others for efficient and secure cloud-based file storage",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/storage-drivers/s3.svg",
      "dark_logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/storage-drivers/s3-dark.svg",
      "status": false,
      "brand_color": "#4f94d4",
      "has_bucket": true,
      "instance": {
        "slug": "s3",
        "title": "S3",
        "brandColor": "#4f94d4"
      },
      "need_reconfigure": false,
      "buckets": []
    },
    "r2": {
      "title": "Cloudflare R2",
      "route": "r2",
      "description": "Cloudflare R2 allows you to store downloadable product files in Cloudflare object storage.",
      "logo": "https://example.com/wp-content/plugins/fluent-cart-pro/assets/images/storage-drivers/r2.svg",
      "dark_logo": "https://example.com/wp-content/plugins/fluent-cart-pro/assets/images/storage-drivers/r2-dark.svg",
      "status": false,
      "brand_color": "#f38020",
      "has_bucket": true,
      "instance": {
        "slug": "r2",
        "title": "Cloudflare R2",
        "brandColor": "#f38020"
      },
      "need_reconfigure": false,
      "buckets": []
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/payment-methods/reorder`

**POST Reorder Payment Methods**

Set the display order of payment methods on the checkout page.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/checkout-fields/save-fields`

**POST Save Checkout Fields**

Update the checkout field visibility and required settings. The endpoint enforces name field logic automatically: if `first_name` or `last_name` is enabled, `full_name` is automatically disabled; if neither is enabled, `full_name` is automatically enabled and marked as required.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

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


- **403** — Authenticated, but the user lacks the required capability.

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

## POST `/settings/confirmation`

**POST Save Confirmation Settings**

Update the order confirmation/receipt page settings, including the confirmation type, message content, and the receipt page assignment.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/modules`

**POST Save Module Settings**

Enable or disable modules (features) and update their configuration. Fires `fluent_cart/module/activated/{key}` or `fluent_cart/module/deactivated/{key}` hooks when a module's active status changes.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/payment-methods/design`

**POST Save Payment Method Design**

Customize the checkout appearance for a specific payment method, including its label, logo, and instructions.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/payment-methods`

**POST Save Payment Method Settings**

Create or update the configuration for a specific payment method gateway.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/permissions`

**POST Save Permissions**

Update the role-to-capability permission mappings for FluentCart.

**Also used by the roles & permissions UI.** Update which WordPress roles have access to FluentCart.

**Required permission:** `is_super_admin`

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


- **403** — Forbidden - User doesn't have manage_options capability

  Schema (`application/json`):

  - `success` (boolean)
  - `data` (object)
    - `message` (string)

  Example:

```json
{
  "success": false,
  "data": {
    "message": "Sorry, You can not update permissions. Only administrators can update permissions"
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

## POST `/settings/storage-drivers`

**POST Save Storage Driver Settings**

Create or update settings for a specific file storage driver.

**Required permission:** `is_super_admin`

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
    "bucket": "example-store-downloads",
    "region": "us-east-1",
    "is_active": true,
    "base_url": "https://example-store-downloads.s3.amazonaws.com"
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/store`

**POST Save Store Settings**

Update store configuration settings. Submitted values are merged with existing settings.

**Required permission:** `store/settings`

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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## POST `/settings/payment-methods/paypal/webhook/setup`

**POST Setup PayPal Webhook**

Register a webhook endpoint with PayPal to receive payment event notifications.

**Required permission:** `super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`super_admin`).

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

## POST `/settings/storage-drivers/verify-info`

**POST Verify Storage Driver Connection**

Test the connection to a storage driver using the provided credentials without saving them.

**Required permission:** `is_super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/storage-drivers/change-status`

**POST Change Storage Driver Status**

Enable or disable a storage driver that does not manage its own bucket (bucket-backed drivers such as S3 must instead be configured from their own settings page). Only flips the driver's `is_active` flag.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — The storage driver key (e.g., `local`).
- `status` (string) **required** _(enum: `yes`, `no`)_ — New active status for the driver.

Example:

```json
{
  "driver": "local",
  "status": "yes"
}
```


**Responses**

- **200** — Successful response. Returns the updated driver settings.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object) — The driver's persisted settings, including the new is_active value.
    - _(object)_

  Example:

```json
{
  "message": "Status updated successfully",
  "data": {
    "is_active": "yes"
  }
}
```


- **400** — The driver manages its own bucket and must be configured from its settings page, or saving the new status failed.

  Example:

```json
{
  "message": "This storage driver must be managed from its settings page."
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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


- **404** — The named driver does not exist.

  Example:

```json
{
  "message": "Invalid driver"
}
```


- **422** — `status` was not `yes` or `no`.

  Example:

```json
{
  "message": "Invalid status value"
}
```



---

## POST `/settings/storage-drivers/create-bucket`

**POST Create Storage Bucket**

Create a new bucket on a storage driver using the supplied credentials. Used by the settings UI when a store wants to provision a bucket instead of using an existing one.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — The storage driver key (e.g., `s3`, `bunny`).
- `settings` (object) **required** — Driver-specific credentials and the new bucket name/configuration. Fields vary by driver.
  - _(object)_

Example:

```json
{
  "driver": "s3",
  "settings": {
    "access_key": "AKIAEXAMPLE1234",
    "secret_key": "your-secret-key-here",
    "region": "us-east-1",
    "bucket": "my-store-files"
  }
}
```


**Responses**

- **200** — Successful response. The bucket was created.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object) — Driver-specific result of the create-bucket call.
    - _(object)_

  Example:

```json
{
  "message": "Bucket created successfully",
  "data": {
    "bucket": "my-store-files"
  }
}
```


- **400** — The driver could not be resolved, or bucket creation was rejected by the storage provider.

  Example:

```json
{
  "message": "A bucket with that name already exists.",
  "error_data": null
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## GET `/settings/mcp/config-snippets`

**GET Get MCP Config Snippets**

Return ready-to-paste MCP connection snippets for every supported client (Claude Code, Claude Desktop, Cursor, Codex, and a generic HTTP snippet), built server-side in one response. No credentials are ever included — each snippet carries a placeholder for the WordPress username and Application Password that the caller fills in themselves.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `local_dev` | string | no | Overrides TLS-verification guidance in the Claude Desktop snippet. Truthy values (yes, true, 1, on) are treated as a local/dev environment. When omitted, the server auto-detects. |


**Responses**

- **200** — Successful response. Returns connection snippets for every supported MCP client.

  Schema (`application/json`):

  - `snippets` (object) — Keyed by client id: claude-code, claude-desktop, cursor, codex, generic
    - _(object)_
  - `endpoint` (string)
  - `app_passwords_url` (string)
  - `is_local_dev` (boolean)

  Example:

```json
{
  "snippets": {
    "claude-code": {
      "client": "claude-code",
      "snippet": "claude mcp add --transport http fluent-cart https://example.com/wp-json/fluent-cart/mcp --header \"Authorization: Basic <base64(your-username:application-password)>\"",
      "instructions": "Run this in your terminal where Claude Code is installed, with base64 of \"username:application-password\"."
    }
  },
  "endpoint": "https://example.com/wp-json/fluent-cart/mcp",
  "app_passwords_url": "https://example.com/wp-admin/profile.php#application-passwords-section",
  "is_local_dev": false
}
```


- **401** — Authentication required.

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


- **403** — The current user is not a super admin.

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

## GET `/settings/mcp`

**GET Get MCP Status**

Return the status payload used by the MCP settings card in the admin: whether the MCP endpoint is enabled, whether the FluentHub adapter plugin is installed/available, the endpoint URL, tool count, and helper links (Application Passwords page, plugins page).

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns the current MCP status.

  Schema (`application/json`):

  - `mcp_enabled` (boolean)
  - `adapter_available` (boolean)
  - `toolkit_installed` (boolean)
  - `can_auto_install` (boolean)
  - `toolkit_download_url` (string)
  - `endpoint_url` (string)
  - `tools_count` (integer)
  - `app_passwords_url` (string)
  - `plugins_url` (string)
  - `current_user_login` (string)
  - `is_local_dev` (boolean)

  Example:

```json
{
  "mcp_enabled": true,
  "adapter_available": true,
  "toolkit_installed": true,
  "can_auto_install": true,
  "toolkit_download_url": "https://github.com/WPManageNinja/fluent-toolkit",
  "endpoint_url": "https://example.com/wp-json/fluent-cart/mcp",
  "tools_count": 35,
  "app_passwords_url": "https://example.com/wp-admin/profile.php#application-passwords-section",
  "plugins_url": "https://example.com/wp-admin/plugins.php",
  "current_user_login": "admin",
  "is_local_dev": false
}
```


- **401** — Authentication required.

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


- **403** — The current user is not a super admin.

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

## POST `/settings/mcp/install-adapter`

**POST Install MCP Adapter**

Trigger a one-click install of the FluentHub adapter plugin, which is required for the MCP endpoint to work. The free FluentCart plugin can only detect and trigger this install — the actual installer logic lives in a Fluent Pro plugin (FluentCart Pro, or any other Fluent product) that hooks the `fluent_toolkit/*` contract. If no Pro plugin is active, this returns the manual download link instead of installing anything.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Responses**

- **200** — FluentHub installed and activated, or a manual-install link was returned.

  Schema (`application/json`):

  - `adapter_available` (boolean)
  - `toolkit_installed` (boolean)
  - `message` (string)

  Example:

```json
{
  "adapter_available": true,
  "toolkit_installed": true,
  "message": "FluentHub installed and activated. The MCP endpoint is ready."
}
```


- **401** — Authentication required.

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


- **403** — The current user is not a super admin.

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


- **422** — Either the current WordPress user lacks the `install_plugins` capability (regardless of the `is_super_admin` route policy — the controller re-checks independently), or no Pro plugin supports automatic install and a manual download link is returned instead. Both cases use the framework's default `sendError()` status of 422; distinguish them by the presence of `toolkit_download_url`.

  Example:

```json
{
  "message": "Automatic install needs FluentCart Pro (or another Fluent Pro plugin). Install FluentHub manually, then reload this page to connect FluentCart with AI agents.",
  "toolkit_download_url": "https://github.com/WPManageNinja/fluent-toolkit"
}
```



---

## POST `/settings/storage-drivers/bucket-list`

**POST List Storage Buckets**

List the buckets available to a storage driver's credentials, without saving them. Used by the settings UI to populate a bucket picker while a driver is being configured.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — The storage driver key (e.g., `s3`, `bunny`).
- `settings` (object) **required** — Driver-specific credentials used to authenticate and list buckets. Fields vary by driver.
  - _(object)_
- `query` (string) — Optional search string to filter the bucket list by name.

Example:

```json
{
  "driver": "s3",
  "settings": {
    "access_key": "AKIAEXAMPLE1234",
    "secret_key": "your-secret-key-here",
    "region": "us-east-1"
  },
  "query": "store"
}
```


**Responses**

- **200** — Successful response. Returns the matching buckets as select-style options.

  Schema (`application/json`):

  - `options` (array<object>)
    - `id` (string)
    - `title` (string)

  Example:

```json
{
  "options": [
    {
      "id": "my-store-files",
      "title": "my-store-files"
    },
    {
      "id": "my-store-backups",
      "title": "my-store-backups"
    }
  ]
}
```


- **400** — The driver could not be resolved, or the driver's credentials were rejected while listing buckets.

  Example:

```json
{
  "message": "Could not connect to the storage provider with the supplied credentials.",
  "error_data": null
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/storage-drivers/reset`

**POST Reset Storage Driver Settings**

Reset a storage driver's saved settings (including any stored credentials) back to its defaults. The returned settings omit the driver's hidden/secret keys.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — The storage driver key to reset (e.g., `s3`, `local`).

Example:

```json
{
  "driver": "s3"
}
```


**Responses**

- **200** — Successful response. Returns the driver's reset settings, with secret keys omitted.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object) — The driver's default settings after reset, excluding hidden/secret keys.
    - _(object)_

  Example:

```json
{
  "message": "Settings reset successfully",
  "data": {
    "is_active": "no",
    "region": "",
    "bucket": ""
  }
}
```


- **400** — The driver could not be resolved, or resetting its settings failed.

  Example:

```json
{
  "message": "Invalid driver.",
  "error_data": null
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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

## POST `/settings/mcp/toggle`

**POST Toggle MCP**

Flip the master switch that enables or disables the FluentCart MCP server for AI agents. Writes the same option key the server boot guard reads, so a disabled state immediately blocks further MCP requests. The response reports the actually-persisted state rather than the requested value.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `mcp_enabled` (any) — Desired MCP state. Accepts a boolean, or the strings `yes`, `true`, `1`, `on` (case-insensitive) to enable; any other value disables.

Example:

```json
{
  "mcp_enabled": "yes"
}
```


**Responses**

- **200** — Successful response. Returns the persisted MCP state.

  Schema (`application/json`):

  - `mcp_enabled` (boolean)
  - `message` (string)

  Example:

```json
{
  "mcp_enabled": true,
  "message": "MCP enabled. AI agents with a valid app password can now reach the FluentCart tools."
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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


- **422** — The current user cannot manage_options, so the setting was not changed.

  Example:

```json
{
  "message": "Sorry, you do not have permission to change the MCP setting."
}
```



---

## POST `/settings/modules/turnstile/verify`

**POST Verify Turnstile Keys**

Verify a Cloudflare Turnstile Site Key and Secret Key by exchanging the supplied client-side token with Cloudflare's `siteverify` endpoint. Used by the settings UI to confirm a Turnstile configuration works before it is saved.

**Required permission:** `is_super_admin`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `site_key` (string) **required** — Cloudflare Turnstile Site Key.
- `secret_key` (string) **required** — Cloudflare Turnstile Secret Key.
- `token` (string) **required** — The client-side Turnstile response token to verify, generated by widget on the current domain using the supplied Site Key.

Example:

```json
{
  "site_key": "0x4AAAAAAAExampleSiteKey",
  "secret_key": "0x4AAAAAAAExampleSecretKey",
  "token": "0.ExampleTurnstileResponseToken"
}
```


**Responses**

- **200** — Successful response. The keys and token verified against Cloudflare.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Turnstile keys are valid and working."
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


- **403** — Authenticated, but the user lacks the required capability (`is_super_admin`).

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


- **422** — Site Key/Secret Key missing, no token could be obtained, Cloudflare could not be reached, or the keys/token failed verification.

  Example:

```json
{
  "message": "The Secret Key is invalid. Please check it in your Cloudflare Dashboard."
}
```



---
