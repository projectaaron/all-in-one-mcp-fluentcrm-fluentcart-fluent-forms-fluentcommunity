# FluentCart API — Checkout

7 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## GET `/checkout/get-available-shipping-methods`

**GET Get Available Shipping Methods**

Retrieve shipping methods available for a given country and state. The country can be auto-detected from the customer's timezone or provided directly via country code.

**Access policy:** `PublicPolicy`

**Access policy:** `PublicPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `timezone` | string | no | IANA timezone string (e.g., `America/New_York`, `Europe/London`). Used to auto-detect the country. Either `timezone` or `country_code` must be provided |
| `country_code` | string | no | ISO 3166-1 alpha-2 country code (e.g., `US`, `GB`). Used when `timezone` is not provided |
| `state` | string | no | State/province code to further filter applicable shipping methods |


**Responses**

- **200** — Successful response. Returns available shipping methods for the given location.

  Schema (`application/json`):

  - `available_shipping_methods` (array<object>) — List of available shipping methods
    - `id` (integer) — Shipping method ID
    - `title` (string) — Shipping method display name
    - `charge_type` (string) — Charge type (e.g., `flat_rate`)
    - `charge_amount` (integer) — Shipping charge in cents
    - `status` (string) — Shipping method status
    - `countries` (array<string>) — List of supported country codes
    - `states` (array<string>) — List of supported state codes (empty for all states)
  - `country_code` (string) — The resolved country code
  - `status` (boolean) — Status flag (present in error responses)
  - `message` (string) — Error message when no country provided
  - `view` (string) — HTML view when no methods are available

  Example:

```json
{
  "shipping_methods": [
    {
      "id": "flat_rate",
      "title": "Flat Rate",
      "cost": 500,
      "cost_formatted": "$5.00",
      "description": "Fixed shipping rate",
      "is_taxable": true,
      "tax_class": "standard"
    },
    {
      "id": "free_shipping",
      "title": "Free Shipping",
      "cost": 0,
      "cost_formatted": "$0.00",
      "description": "Free shipping on orders over $50",
      "is_taxable": false,
      "tax_class": ""
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

## GET `/checkout/get-checkout-summary-view`

**GET Get Checkout Summary**

Retrieve a rendered HTML summary of the current cart along with pricing totals. Used to dynamically update the checkout page when the customer changes shipping methods or other options.

**Access policy:** `PublicPolicy`

**Access policy:** `PublicPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `shipping_method_id` | integer | no | ID of the selected shipping method to include its charge in the totals |


**Responses**

- **200** — Successful response. Returns cart summary with pricing totals.

  Schema (`application/json`):

  - `items` (object) — Cart summary data
    - `views` (string) — Server-rendered HTML of the cart item list for the checkout page
    - `subtotal` (string) — Formatted subtotal of all cart items (before shipping)
    - `has_subscriptions` (boolean) — Whether the cart contains subscription products
    - `shipping_charge` (integer) — Shipping charge in cents
    - `unformatted_total` (integer) — Grand total in cents (subtotal + shipping)
    - `total` (string) — Formatted grand total string
    - `shipping_charge_formated` (string) — Formatted shipping charge string
    - `shipping_method_id` (string) — The shipping method ID used for calculation

  Example:

```json
{
  "items": {
    "views": "<div class=\"fct-checkout-items\">...rendered HTML...</div>",
    "subtotal": "$50.00",
    "has_subscriptions": false,
    "shipping_charge": 500,
    "unformatted_total": 5500,
    "total": "$55.00",
    "shipping_charge_formated": "$5.00",
    "shipping_method_id": "3"
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

## GET `/checkout/get-country-info`

**GET Get Country Info**

Retrieve localization details for a country including available states/provinces and address field configuration. Used by the checkout form to dynamically adjust address fields based on the selected country.

**Access policy:** `PublicPolicy`

**Access policy:** `PublicPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `timezone` | string | no | IANA timezone string (e.g., `Asia/Tokyo`). Used to auto-detect the country. Either `timezone` or `country_code` must be provided |
| `country_code` | string | no | ISO 3166-1 alpha-2 country code (e.g., `US`, `JP`). Used when `timezone` is not provided |


**Responses**

- **200** — Successful response. Returns country localization details.

  Schema (`application/json`):

  - `data` (object) — Country information
    - `country_code` (string) — The resolved ISO country code
    - `states` (array<object>) — List of state/province options. Empty array if the country has no states
      - `label` (string) — State display name
      - `value` (string) — State code
    - `address_locale` (object) — Country-specific address field labels and requirements (e.g., 'State' vs 'Province', 'ZIP Code' vs 'Postal Code')
      - `state` (object)
        - `label` (string) — Display label for the state field
        - `required` (boolean) — Whether the state field is required
      - `postcode` (object)
        - `label` (string) — Display label for the postcode field
        - `required` (boolean) — Whether the postcode field is required
      - `city` (object)
        - `label` (string) — Display label for the city field
        - `required` (boolean) — Whether the city field is required

  Example:

```json
{
  "data": {
    "country_code": "US",
    "states": [
      {
        "label": "Alabama",
        "value": "AL"
      },
      {
        "label": "Alaska",
        "value": "AK"
      },
      {
        "label": "California",
        "value": "CA"
      },
      {
        "label": "New York",
        "value": "NY"
      }
    ],
    "address_locale": {
      "state": {
        "label": "State",
        "required": true
      },
      "postcode": {
        "label": "ZIP Code",
        "required": true
      },
      "city": {
        "label": "City",
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

## GET `/checkout/get-order-info`

**GET Get Order Info**

Retrieve payment-gateway-specific order information needed by the frontend to initialize payment UI elements. This is typically called after the checkout page loads to set up payment forms (e.g., Stripe Elements configuration, PayPal button setup).

**Access policy:** `PublicPolicy`

**Access policy:** `PublicPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `method` | string | yes | Payment gateway slug (e.g., `stripe`, `paypal`, `square`, `airwallex`) |


**Responses**

- **200** — Successful response. The response structure is gateway-specific.

  Schema (`application/json`):

  - `status` (string) — Result status
  - `message` (string) — Human-readable message
  - `data` (object) — Gateway-specific data (e.g., client_secret, publishable_key for Stripe)
    - _(object)_
  - `payment_args` (object) — Payment gateway arguments
    - `checkout_mode` (string) — Payment checkout mode (`onsite` or `hosted`)
    - `appearance` (object) — UI appearance configuration for the payment form
      - _(object)_

  Example:

```json
{
  "order": {
    "id": 42,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "pending",
    "total": 9900,
    "total_formatted": "$99.00",
    "subtotal": 9900,
    "discount_total": 0,
    "tax_total": 0,
    "shipping_total": 0,
    "currency": "USD",
    "items": [
      {
        "id": 1,
        "product_id": 123,
        "product_name": "Developer Toolkit Pro",
        "quantity": 1,
        "price": 9900,
        "price_formatted": "$99.00"
      }
    ],
    "customer": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
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

## GET `/checkout/get-shipping-methods-list-view`

**GET Get Shipping Methods List View**

Retrieve a server-rendered HTML view of available shipping methods for the checkout page. This endpoint wraps get-available-shipping-methods and returns a pre-rendered HTML list suitable for direct insertion into the checkout form.

**Access policy:** `PublicPolicy`

**Access policy:** `PublicPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `timezone` | string | no | IANA timezone string (e.g., `America/New_York`). Used to auto-detect the country. Either `timezone` or `country_code` must be provided |
| `country_code` | string | no | ISO 3166-1 alpha-2 country code (e.g., `US`, `GB`). Used when `timezone` is not provided |
| `state` | string | no | State/province code to further filter applicable shipping methods |


**Responses**

- **200** — Successful response. Returns rendered HTML of shipping methods.

  Schema (`application/json`):

  - `data` (object) — Response data wrapper
    - `status` (boolean) — Whether shipping methods were found
    - `view` (string) — Server-rendered HTML of the shipping method list
    - `country_code` (string) — The resolved country code

  Example:

```json
{
  "methods": [
    {
      "id": "flat_rate",
      "title": "Flat Rate",
      "cost": 500,
      "cost_formatted": "$5.00",
      "enabled": true
    },
    {
      "id": "free_shipping",
      "title": "Free Shipping",
      "cost": 0,
      "cost_formatted": "$0.00",
      "enabled": true
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

## POST `/user/login`

**POST Login**

Authenticate a user during the checkout process. On success, sets the WordPress authentication cookie and returns a redirect URL to the customer profile page.

**Access policy:** `PublicPolicy`

**Access policy:** `PublicPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `user_login` (string) **required** — WordPress username or email address
- `password` (string) **required** — Account password
- `remember_me` (string) _(enum: `on`)_ — Set to `on` to persist the login session ("Remember Me"). Default: not remembered

Example:

```json
{
  "user_login": "john@example.com",
  "password": "securepassword123",
  "remember_me": "on"
}
```


**Responses**

- **200** — Login successful. Returns redirect URL.

  Schema (`application/json`):

  - `success` (boolean) — Whether the login was successful
  - `data` (object)
    - `message` (string) — Human-readable result message
    - `redirect_url` (string) — URL to redirect the user to after login

  Example:

```json
{
  "success": true,
  "data": {
    "message": "Login successful",
    "redirect_url": "https://your-site.com/customer-profile/#/profile"
  }
}
```


- **400** — Missing required fields.

  Schema (`application/json`):

  - `success` (boolean)
  - `data` (object)
    - `message` (string)
    - `code` (string)

  Example:

```json
{
  "success": false,
  "data": {
    "message": "Invalid email or password. Please try again."
  }
}
```


- **401** — Invalid credentials.

  Schema (`application/json`):

  - `success` (boolean)
  - `data` (object)
    - `message` (string)
    - `code` (string)

  Example:

```json
{
  "success": false,
  "data": {
    "message": "The password you entered for the username john@example.com is incorrect.",
    "code": "login_failed"
  }
}
```


- **403** — Invalid security nonce.

  Schema (`application/json`):

  - `message` (string)
  - `code` (string)

  Example:

```json
{
  "message": "Invalid security token. Please refresh the page and try again.",
  "code": "invalid_nonce"
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

## POST `/checkout/place-order`

**POST Place Order**

Submit a checkout order with billing/shipping details and payment method. This endpoint validates the cart, creates a customer (or matches an existing one), creates a draft order, and initiates the payment flow with the selected gateway.

**Access policy:** `PublicPolicy`

**Access policy:** `PublicPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `billing_email` (string) **required** _(format: email)_ — Customer email address. Auto-populated for logged-in users
- `billing_full_name` (string) — Full name of the customer. Required when the store uses full name mode. Auto-populated for logged-in users if available
- `billing_first_name` (string) — Customer first name. Required when the store uses separate first/last name mode
- `billing_last_name` (string) — Customer last name. Required when the store uses separate name mode and last name is configured as required
- `billing_country` (string) — ISO country code (e.g., `US`, `GB`). Required based on checkout field configuration. Defaults to store country if not provided
- `billing_address_1` (string) — Street address line 1. Required based on checkout field configuration
- `billing_address_2` (string) — Street address line 2 (apt, suite, unit)
- `billing_city` (string) — City name. Required based on checkout field configuration
- `billing_state` (string) — State/province code. Required if the selected country has states
- `billing_postcode` (string) — Postal/ZIP code. Required based on checkout field configuration
- `billing_phone` (string) — Phone number
- `billing_tax_id` (string) — Customer tax ID / VAT number
- `billing_address_id` (integer) — ID of a saved customer billing address (for returning customers)
- `ship_to_different` (string) _(enum: `yes`, `no`; default: `no`)_ — Set to `yes` to use a different shipping address. Default: `no`
- `shipping_full_name` (string) — Shipping recipient name. Required when `ship_to_different` is `yes`
- `shipping_country` (string) — Shipping country code. Required when `ship_to_different` is `yes`
- `shipping_address_1` (string) — Shipping street address. Required when `ship_to_different` is `yes`
- `shipping_address_2` (string) — Shipping address line 2
- `shipping_city` (string) — Shipping city. Required when `ship_to_different` is `yes`
- `shipping_state` (string) — Shipping state/province code
- `shipping_postcode` (string) — Shipping postal code
- `shipping_phone` (string) — Shipping phone number
- `shipping_address_id` (integer) — ID of a saved customer shipping address
- `fc_selected_shipping_method` (integer) — ID of the selected shipping method. Required for orders containing physical products
- `payment_method` (string) **required** — Payment gateway slug (e.g., `stripe`, `paypal`, `cod`, `square`)
- `order_notes` (string) _(maxLength: 200)_ — Optional order notes from the customer. Max 200 characters
- `agree_terms` (string) — Terms agreement flag. Required if terms acceptance is enabled in store settings
- `allow_create_account` (string) _(enum: `yes`, `no`)_ — Set to `yes` to create a WordPress user account (when store setting is `user_choice`)
- `user_tz` (string) _(default: `UTC`)_ — Customer timezone (e.g., `America/New_York`). Default: `UTC`

Example:

```json
{
  "billing_email": "john@example.com",
  "billing_full_name": "John Doe",
  "billing_country": "US",
  "billing_address_1": "123 Main St",
  "billing_city": "New York",
  "billing_state": "NY",
  "billing_postcode": "10001",
  "payment_method": "stripe",
  "user_tz": "America/New_York"
}
```


**Responses**

- **200** — Successful response. The response structure varies by payment gateway.

  Schema (`application/json`):

  - `status` (string) — Result status (`success` or `failed`)
  - `redirect_url` (string) — URL to redirect the customer to (for redirect-based gateways or completed orders)
  - `payment_args` (object) — Payment gateway-specific arguments (for on-site gateways like Stripe Elements)
    - `client_secret` (string) — Stripe PaymentIntent client secret
    - `checkout_mode` (string) — Payment checkout mode (`onsite` or `hosted`)
  - `order_id` (integer) — The created order ID (for on-site payment flows)
  - `message` (string) — Human-readable result message
  - `errors` (object) — Validation errors keyed by field name (when status is `failed`)
    - _(object)_

  Example:

```json
{
  "success": true,
  "order": {
    "id": 42,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "pending",
    "total": 9900,
    "total_formatted": "$99.00",
    "currency": "USD",
    "payment_method": "stripe",
    "created_at": "2025-03-20 14:30:00"
  },
  "redirect_url": "https://example.com/checkout/payment/a1b2c3d4",
  "message": "Order placed successfully."
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


- **422** — Product validation failure.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Product is out of stock"
}
```


- **429** — Rate limit exceeded (5 requests per 60 seconds per IP/user).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Too many requests. Please try again later."
}
```



---
