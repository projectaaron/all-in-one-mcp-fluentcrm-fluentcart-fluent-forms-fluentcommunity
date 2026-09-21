# FluentCart API — Subscriptions

19 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/customer-profile/subscriptions/{subscription_uuid}/cancel-auto-renew`

**POST Cancel Auto-Renew**

Cancel auto-renewal for a subscription from the customer portal. The subscription is cancelled both locally and with the remote payment gateway. The cancellation reason is automatically set to cancelled_by_customer.

**Access policy:** `CustomerFrontendPolicy`

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscription_uuid` | string | yes | The subscription UUID (alphanumeric with dashes) |


**Responses**

- **200** — Auto-renewal cancelled successfully

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Your subscription has been successfully cancelled"
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


- **404** — Customer or subscription not found

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "success": false,
  "data": {
    "message": "Subscription not found or does not belong to this account."
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

## PUT `/orders/{order}/subscriptions/{subscription}/cancel`

**PUT Cancel Subscription**

Cancel a subscription both locally and with the remote payment gateway.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | The parent order ID |
| `subscription` | integer | yes | The subscription ID |


**Request body** (`application/json`, required)

- `cancel_reason` (string) **required** — Reason for cancellation. Sanitized with sanitize_text_field.

Example:

```json
{
  "cancel_reason": "Customer requested cancellation"
}
```


**Responses**

- **200** — Subscription cancelled successfully

  Schema (`application/json`):

  - `message` (string)
  - `subscription` (Subscription)

  Example:

```json
{
  "message": "Subscription has been cancelled successfully!",
  "subscription": {
    "id": 15,
    "status": "canceled"
  }
}
```


- **400** — Bad request - missing cancel reason or remote failure

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Please select cancel reason!"
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/manage`).

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

## POST `/customer-profile/subscriptions/{subscription_uuid}/confirm-subscription-switch`

**POST Confirm Subscription Switch**

Confirm a two-step payment method switch. After the initial switch-payment-method call creates a new subscription on the target gateway, this endpoint finalizes the switch by confirming the new subscription and deactivating the old one.

**Access policy:** `CustomerFrontendPolicy`

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscription_uuid` | string | yes | The subscription UUID (alphanumeric with dashes) |


**Request body** (`application/json`, required)

- `data` (object) **required** — Confirmation data. Additional fields depend on the specific payment gateway implementation.
  - `newVendorSubscriptionId` (string) **required** — The new subscription ID from the target payment gateway
  - `method` (string) **required** — The target payment gateway slug

Example:

```json
{
  "data": {
    "newVendorSubscriptionId": "I-WX9Y8Z7A6B5C",
    "method": "paypal"
  }
}
```


**Responses**

- **200** — Subscription switch confirmed successfully. Response depends on the gateway's confirmSubscriptionSwitch implementation.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Subscription switch confirmed successfully"
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


- **422** — Could not confirm subscription switch

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Could not confirm subscription switch"
}
```



---

## PUT `/orders/{order}/subscriptions/{subscription}/fetch`

**PUT Fetch Subscription from Remote**

Re-sync a subscription's data from the remote payment gateway (e.g., Stripe, PayPal). Useful for resolving data inconsistencies between local records and the payment provider.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | The parent order ID |
| `subscription` | integer | yes | The subscription ID |


**Responses**

- **200** — Subscription fetched successfully from remote gateway

  Schema (`application/json`):

  - `message` (string)
  - `subscription` (Subscription)

  Example:

```json
{
  "message": "Subscription fetched successfully from remote payment gateway!",
  "subscription": {
    "id": 15,
    "status": "active",
    "vendor_subscription_id": "sub_1QxR3nH"
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/manage`).

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


- **422** — Gateway error

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Could not fetch subscription from remote gateway"
}
```



---

## POST `/orders/{order}/subscriptions/{subscription}/early-payment-link`

**POST Generate Early Payment Link**

Generate a URL that allows early payment of remaining installments on an installment-based subscription. Requires early payment feature to be enabled, the subscription must belong to the specified order, have finite installments, be active or trialing, and have remaining installments.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | The parent order ID |
| `subscription` | integer | yes | The subscription ID |


**Responses**

- **200** — Early payment link generated successfully

  Schema (`application/json`):

  - `message` (string)
  - `payment_url` (string) _(format: uri)_ — URL for early installment payment

  Example:

```json
{
  "message": "Early payment link generated.",
  "payment_url": "https://example.com/?fluent-cart=early-installment-payment&subscription_hash=a3f7c1b2-9e4d-4a8b-b5c6-d7e8f9012345"
}
```


- **400** — Bad request - various validation errors

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "success": false,
  "data": {
    "message": "Invalid request. Please check your input and try again."
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/manage`).

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

## GET `/customer-profile/subscriptions/{subscription_uuid}`

**GET Get Customer Subscription Details**

Retrieve full details of a specific subscription for the currently logged-in customer, including transactions, upgrade eligibility, and payment method capabilities.

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscription_uuid` | string | yes | The subscription UUID (alphanumeric with dashes) |


**Responses**

- **200** — Successful response with full subscription details including transactions, upgrade eligibility, and payment method capabilities.

  Schema (`application/json`):

  - `message` (string)
  - `subscription` (CustomerSubscriptionDetail)
  - `section_parts` (object) — Extra HTML content sections for the subscription details page, keyed by section name (filterable via fluent_cart/customer/subscription_details_section_parts). Values are sanitized HTML strings.
    - _(object)_

  Example:

```json
{
  "message": "Success",
  "subscription": {
    "uuid": "a3f7c1b2-9e4d-4a8b-b5c6-d7e8f9012345",
    "status": "active",
    "overridden_status": null,
    "vendor_subscription_id": "sub_1QxR3nH",
    "next_billing_date": "2026-09-20 14:25:00",
    "billing_info": {
      "interval": "yearly",
      "interval_count": 1,
      "amount": 9900,
      "currency": "USD"
    },
    "current_payment_method": "stripe",
    "payment_method": "stripe",
    "payment_info": {
      "card_last_4": "4242",
      "card_brand": "visa"
    },
    "bill_times": 0,
    "bill_count": 1,
    "variation_id": 457,
    "product_id": 123,
    "config": {
      "cancel_at_period_end": false,
      "prorate": true
    },
    "reactivate_url": "https://example.com/?fluent-cart=reactivate&hash=a3f7c1b2-9e4d-4a8b-b5c6-d7e8f9012345",
    "title": "Developer Toolkit Pro",
    "subtitle": "Business Annual",
    "can_upgrade": true,
    "can_switch_payment_method": true,
    "switchable_payment_methods": [
      "stripe",
      "paypal"
    ],
    "can_update_payment_method": true,
    "order": {
      "uuid": "e7b3a1d4-5f2c-48e9-a6b1-c3d4e5f67890"
    },
    "billing_addresses": [
      {
        "first_name": "Sarah",
        "last_name": "Johnson",
        "address_line_1": "742 Evergreen Terrace",
        "address_line_2": "Suite 200",
        "city": "Portland",
        "state": "OR",
        "zip": "97201",
        "country": "US"
      }
    ],
    "recurring_amount": 9900,
    "can_early_pay": false,
    "remaining_installments": 0,
    "transactions": [
      {
        "id": 34,
        "order_id": 42,
        "vendor_charge_id": "ch_3QxR4nIbK",
        "amount": 9900,
        "status": "completed",
        "created_at": "2025-09-20 14:25:30",
        "order": {
          "id": 42,
          "uuid": "e7b3a1d4-5f2c-48e9-a6b1-c3d4e5f67890",
          "status": "completed",
          "total": 10692
        }
      }
    ]
  },
  "section_parts": {
    "end_of_subscription": ""
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

## POST `/customer-profile/subscriptions/{subscription_uuid}/get-or-create-plan`

**POST Get or Create Plan**

Get or create a subscription plan on the remote payment gateway. Typically used during the payment method switch flow to ensure the target gateway has a matching plan configured.

**Access policy:** `CustomerFrontendPolicy`

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscription_uuid` | string | yes | The subscription UUID (alphanumeric with dashes) |


**Request body** (`application/json`, required)

- `data` (object) **required** — Plan data object
  - `method` (string) **required** — Target payment gateway slug (e.g., stripe, paypal)
  - `reason` (string) — Reason for creating the plan

Example:

```json
{
  "data": {
    "method": "stripe",
    "reason": "switching_payment_method"
  }
}
```


**Responses**

- **200** — Plan retrieved or created successfully. Response depends on the gateway's getOrCreateNewPlan implementation.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Plan created successfully"
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


- **422** — Could not get or create plan

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Could not get or create plan"
}
```



---

## GET `/customer-profile/subscriptions/{subscription_uuid}/setup-intent-attempts`

**GET Get Setup Intent Remaining Attempts**

Check how many Stripe SetupIntent attempts remain for the customer. Used to enforce rate limiting on payment method update attempts. Only works when the subscription's current_payment_method is stripe.

**Access policy:** `CustomerFrontendPolicy`

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscription_uuid` | string | yes | The subscription UUID (alphanumeric with dashes) |


**Responses**

- **200** — Returns the number of remaining setup intent attempts

  Schema (`application/json`):

  - `remaining` (integer) — Number of remaining setup intent attempts

  Example:

```json
{
  "remaining": 5
}
```


- **400** — Payment method not supported (non-Stripe subscription)

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Payment method not supported"
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

## GET `/subscriptions/{subscriptionOrderId}`

**GET Get Subscription Details**

Retrieve the full details of a single subscription including customer addresses, labels, activities, and related orders.

**Required permission:** `subscriptions/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscriptionOrderId` | integer | yes | The subscription ID |


**Responses**

- **200** — Successful response. Returns the subscription with eager-loaded relations including labels, activities, customer addresses, and related orders.

  Schema (`application/json`):

  - `subscription` (SubscriptionDetail)
  - `selected_labels` (array<integer>) — Array of label IDs applied to the subscription
  - `reminder_permissions` (object) — Flags indicating whether renewal/trial-end reminder emails can be sent for this subscription.
    - `canSendRenewal` (boolean)
    - `canSendTrialEnd` (boolean)

  Example:

```json
{
  "subscription": {
    "id": 15,
    "uuid": "a3f7c1b2-9e4d-4a8b-b5c6-d7e8f9012345",
    "status": "active",
    "item_name": "Developer Toolkit Pro - Business Annual",
    "parent_order_id": 42,
    "customer_id": 12,
    "product_id": 123,
    "variation_id": 457,
    "vendor_subscription_id": "sub_1QxR3nH",
    "vendor_customer_id": "cus_Qx7K9mN3pR",
    "current_payment_method": "stripe",
    "billing_interval": "yearly",
    "recurring_amount": 9900,
    "bill_times": 0,
    "bill_count": 1,
    "next_billing_date": "2026-09-20 14:25:00",
    "labels": [
      {
        "id": 2,
        "title": "VIP",
        "color": "#8b5cf6"
      },
      {
        "id": 5,
        "title": "Enterprise",
        "color": "#3b82f6"
      }
    ],
    "activities": [
      {
        "id": 101,
        "title": "Subscription Created",
        "content": "Subscription #15 created for order #42",
        "status": "success",
        "created_at": "2025-09-20 14:25:00",
        "user": {
          "ID": 12,
          "display_name": "Sarah Johnson"
        }
      },
      {
        "id": 102,
        "title": "Payment Received",
        "content": "Renewal payment of $99.00 processed via Stripe",
        "status": "success",
        "created_at": "2025-09-20 14:25:30",
        "user": {
          "ID": 0,
          "display_name": "System"
        }
      }
    ],
    "customer": {
      "id": 12,
      "shipping_address": {
        "first_name": "Sarah",
        "last_name": "Johnson",
        "address_line_1": "742 Evergreen Terrace",
        "address_line_2": "Suite 200",
        "city": "Portland",
        "state": "OR",
        "zip": "97201",
        "country": "US"
      },
      "billing_address": {
        "first_name": "Sarah",
        "last_name": "Johnson",
        "address_line_1": "742 Evergreen Terrace",
        "address_line_2": "Suite 200",
        "city": "Portland",
        "state": "OR",
        "zip": "97201",
        "country": "US"
      }
    },
    "related_orders": [
      {
        "id": 42,
        "order_items": [
          {
            "id": 58,
            "order_id": 42,
            "post_title": "Developer Toolkit Pro",
            "title": "Developer Toolkit Pro - Business Annual",
            "quantity": 1,
            "payment_type": "subscription",
            "line_meta": {
              "billing_interval": "yearly",
              "recurring_amount": 9900,
              "signup_fee": 0,
              "trial_days": 0
            }
          }
        ]
      }
    ]
  },
  "selected_labels": [
    2,
    5
  ],
  "reminder_permissions": {
    "canSendRenewal": false,
    "canSendTrialEnd": false
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/view`).

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


- **404** — Subscription not found

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Subscription not found",
  "action_text": "Back to Subscription list",
  "action_url": "/subscriptions"
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

## POST `/customer-profile/subscriptions/{subscription_uuid}/initiate-early-payment`

**POST Initiate Early Payment**

Generate a checkout URL for paying remaining installments early on an installment-based subscription. Requires Pro license, early payment feature enabled, finite installments with remaining payments, and active or trialing status.

**Access policy:** `CustomerFrontendPolicy`

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscription_uuid` | string | yes | The subscription UUID (alphanumeric with dashes) |


**Responses**

- **200** — Early payment URL generated successfully

  Schema (`application/json`):

  - `message` (string)
  - `checkout_url` (string) _(format: uri)_ — URL for early installment payment checkout

  Example:

```json
{
  "message": "Early payment URL generated.",
  "checkout_url": "https://example.com/?fluent-cart=early-installment-payment&subscription_hash=a3f7c1b2-9e4d-4a8b-b5c6-d7e8f9012345"
}
```


- **400** — Early payment not available

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Early payment is not available for this subscription."
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


- **404** — Customer or subscription not found

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "success": false,
  "data": {
    "message": "The requested resource was not found."
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

## GET `/customer-profile/subscriptions`

**GET List Customer Subscriptions**

Retrieve a paginated list of subscriptions belonging to the currently logged-in customer. Subscriptions with pending or intended status are excluded.

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination (default: 1) |
| `per_page` | integer | no | Number of records per page (default: 10) |


**Responses**

- **200** — Successful response. Returns a paginated list of customer subscriptions. If the user is not logged in, returns an empty result set.

  Schema (`application/json`):

  - `message` (string)
  - `subscriptions` (CustomerSubscriptionPagination)

  Example:

```json
{
  "message": "Success",
  "subscriptions": {
    "data": [
      {
        "uuid": "a3f7c1b2-9e4d-4a8b-b5c6-d7e8f9012345",
        "vendor_subscription_id": "sub_1QxR3nH8k5m2Np9",
        "status": "active",
        "overridden_status": "active",
        "next_billing_date": "2026-09-20 14:25:00",
        "billing_info": {
          "method": "stripe",
          "vendor_method_id": "pm_1QxR3nH8k5m2Np9",
          "payment_type": "card",
          "details": {
            "brand": "visa",
            "last_4": "4242",
            "exp_month": 11,
            "exp_year": 2028,
            "country": "US",
            "postal_code": "94102",
            "name": "Alex Morgan"
          }
        },
        "current_payment_method": "stripe",
        "payment_method": null,
        "payment_info": "&#36;99.00 per year, for 1 year",
        "bill_times": "0",
        "bill_count": "1",
        "config": {
          "is_trial_days_simulated": "no",
          "currency": "USD"
        },
        "reactivate_url": "https://yoursite.com/?fluent-cart=reactivate-subscription&subscription_hash=a3f7c1b2-9e4d-4a8b-b5c6-d7e8f9012345",
        "can_upgrade": true,
        "can_switch_payment_method": true,
        "can_update_payment_method": true,
        "collection_method": "automatic",
        "is_auto_charged": true,
        "item_name": "Developer Toolkit Pro - Business Annual"
      },
      {
        "uuid": "c5f9e3d4-1a6f-6c0d-d7e8-f9a0b1234567",
        "vendor_subscription_id": "sub_2RyS4oI9l6n3Oq0",
        "status": "active",
        "overridden_status": "active",
        "next_billing_date": "2026-04-15 09:00:00",
        "billing_info": {
          "method": "stripe",
          "vendor_method_id": "pm_2RyS4oI9l6n3Oq0",
          "payment_type": "card",
          "details": {
            "brand": "mastercard",
            "last_4": "4444",
            "exp_month": 6,
            "exp_year": 2029,
            "country": "US",
            "postal_code": "10001",
            "name": "Jordan Lee"
          }
        },
        "current_payment_method": "stripe",
        "payment_method": null,
        "payment_info": "&#36;19.00 per month, for 12 month",
        "bill_times": "12",
        "bill_count": "3",
        "config": {
          "is_trial_days_simulated": "no",
          "currency": "USD"
        },
        "reactivate_url": "https://yoursite.com/?fluent-cart=reactivate-subscription&subscription_hash=c5f9e3d4-1a6f-6c0d-d7e8-f9a0b1234567",
        "can_upgrade": false,
        "can_switch_payment_method": true,
        "can_update_payment_method": true,
        "collection_method": "automatic",
        "is_auto_charged": true,
        "item_name": "CloudSync Starter - Monthly"
      }
    ],
    "total": 2,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
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

## GET `/subscriptions`

**GET List Subscriptions**

Retrieve a paginated list of subscriptions with optional filtering, sorting, and search.

**Required permission:** `subscriptions/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination |
| `per_page` | integer | no | Number of records per page (default: 10, max: 200) |
| `search` | string | no | Search term. Searches status, subscription ID (#123), customer email (user@example.com), parent order ID, item name, vendor subscription/customer/plan IDs, payment method, billing interval, and bill count. Also supports operator syntax (e.g., ID = 5). |
| `sort_by` | string | no | Column to sort by (default: id). Must be a fillable column on the Subscription model. |
| `sort_type` | string | no | Sort direction: asc or desc (default: desc) |
| `active_view` | string | no | Tab filter for subscription status. |
| `filter_type` | string | no | Filter mode: simple (default) or advanced. |
| `advanced_filters` | string | no | JSON-encoded array of advanced filter groups (requires Pro). Supports filtering by subscription, transaction, product, and license properties. |
| `with` | string | no | Eager-load relations. Supports relation names and {relation}Count for counts. |
| `select` | string | no | Comma-separated list of columns to select. |
| `include_ids` | string | no | Comma-separated IDs that must always be included in results. |
| `limit` | integer | no | Limit number of records (used with non-paginated queries). |
| `offset` | integer | no | Offset for records. |
| `user_tz` | string | no | User timezone for date filtering (e.g., America/New_York). |


**Responses**

- **200** — Successful response. Returns a paginated list of subscriptions.

  Schema (`application/json`):

  - `data` (Pagination)

  Example:

```json
{
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 15,
        "uuid": "a3f7c1b2-9e4d-4a8b-b5c6-d7e8f9012345",
        "status": "active",
        "item_name": "Developer Toolkit Pro - Business Annual",
        "parent_order_id": 42,
        "customer_id": 12,
        "product_id": 123,
        "variation_id": 457,
        "vendor_subscription_id": "sub_1QxR3nH",
        "vendor_customer_id": "cus_Qx7K9mN3pR",
        "vendor_plan_id": "price_1Px8KLM",
        "current_payment_method": "stripe",
        "billing_interval": "yearly",
        "recurring_amount": 9900,
        "bill_times": 0,
        "bill_count": 1,
        "next_billing_date": "2026-09-20 14:25:00",
        "created_at": "2025-09-20 14:25:00",
        "updated_at": "2025-09-20 14:25:30"
      },
      {
        "id": 16,
        "uuid": "b4e8d2c3-0f5e-5b9c-c6d7-e8f9a0123456",
        "status": "trialing",
        "item_name": "CloudSync Starter - Monthly",
        "parent_order_id": 45,
        "customer_id": 18,
        "product_id": 130,
        "variation_id": 462,
        "vendor_subscription_id": "sub_2RyS4oI",
        "vendor_customer_id": "cus_Ry8L0nO4qS",
        "vendor_plan_id": "price_2Qy9LMN",
        "current_payment_method": "stripe",
        "billing_interval": "monthly",
        "recurring_amount": 1900,
        "bill_times": 12,
        "bill_count": 0,
        "next_billing_date": "2026-04-15 09:00:00",
        "created_at": "2026-03-01 09:00:00",
        "updated_at": "2026-03-01 09:00:15"
      }
    ],
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/subscriptions/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/subscriptions/?page=5",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/subscriptions/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/subscriptions/?page=2",
        "label": "2",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/subscriptions/?page=2",
        "label": "pagination.next",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/subscriptions/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/subscriptions",
    "per_page": 10,
    "prev_page_url": null,
    "to": 10,
    "total": 50,
    "last_page": 5
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/view`).

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

## PUT `/orders/{order}/subscriptions/{subscription}/pause`

**PUT Pause Subscription**

Pause an active subscription. Note: This endpoint is registered but currently returns a 'Not available yet' error. It is reserved for future implementation.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | The parent order ID |
| `subscription` | integer | yes | The subscription ID |


**Responses**

- **200** — Not yet available

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Not available yet"
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/manage`).

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

## PUT `/orders/{order}/subscriptions/{subscription}/reactivate`

**PUT Reactivate Subscription**

Reactivate a previously canceled or paused subscription. Note: This endpoint is registered but currently returns a 'Not available yet' error. It is reserved for future implementation.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | The parent order ID |
| `subscription` | integer | yes | The subscription ID |


**Responses**

- **200** — Not yet available

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Not available yet"
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/manage`).

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

## PUT `/orders/{order}/subscriptions/{subscription}/resume`

**PUT Resume Subscription**

Resume a paused subscription. Note: This endpoint is registered but currently returns a 'Not available yet' error. It is reserved for future implementation.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | The parent order ID |
| `subscription` | integer | yes | The subscription ID |


**Responses**

- **200** — Not yet available

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Not available yet"
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/manage`).

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

## POST `/customer-profile/subscriptions/{subscription_uuid}/switch-payment-method`

**POST Switch Payment Method**

Switch a subscription's payment method from one gateway to another (e.g., from Stripe to PayPal). This initiates the switch process, which may require a confirmation step depending on the target gateway.

**Access policy:** `CustomerFrontendPolicy`

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscription_uuid` | string | yes | The subscription UUID (alphanumeric with dashes) |


**Request body** (`application/json`, required)

- `data` (object) **required** — Payment method switch data. Additional fields depend on the specific payment gateway implementation.
  - `newPaymentMethod` (string) **required** — Target payment gateway slug
  - `currentPaymentMethod` (string) **required** — Current payment gateway slug

Example:

```json
{
  "data": {
    "newPaymentMethod": "paypal",
    "currentPaymentMethod": "stripe"
  }
}
```


**Responses**

- **200** — Switch initiated successfully. Response depends on the gateway's switchPaymentMethod implementation. May return a redirect URL or client secret for the new gateway.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Payment method switch initiated"
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


- **422** — Could not switch payment method

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Could not switch payment method"
}
```



---

## POST `/customer-profile/subscriptions/{subscription_uuid}/update-payment-method`

**POST Update Payment Method**

Update the payment method (e.g., replace the card on file) for an existing subscription within the same payment gateway.

**Access policy:** `CustomerFrontendPolicy`

**Access policy:** `CustomerFrontendPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscription_uuid` | string | yes | The subscription UUID (alphanumeric with dashes) |


**Request body** (`application/json`, required)

- `data` (object) **required** — Payment method data object. Additional fields depend on the specific payment gateway implementation.
  - `method` (string) **required** — Payment gateway slug (e.g., stripe, paypal)
  - `payment_method_id` (string) — Gateway-specific payment method identifier

Example:

```json
{
  "data": {
    "method": "stripe",
    "payment_method_id": "pm_1Px8KLMnOpQr"
  }
}
```


**Responses**

- **200** — Payment method updated successfully. Response depends on the gateway's cardUpdate implementation.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Payment method updated successfully"
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


- **422** — Could not update payment method

  Schema (`application/json`):

  - _$ref: Error_

  Example:

```json
{
  "message": "Could not update payment method"
}
```



---

## PUT `/orders/{order}/subscriptions/{subscription}/vendor-ids`

**PUT Update Vendor IDs**

Correct the gateway identifiers (vendor_subscription_id, vendor_customer_id) on a gateway-billed subscription. Opt-in: the endpoint returns an error unless the site enables the `fluent_cart/subscription/vendor_id_editing_enabled` filter. Writes only the identifier columns — no renewal is voided, no invoice re-synced, no status event dispatched, and the payment gateway is not called. Only the keys sent are written. The new vendor_subscription_id is claimed atomically, so another subscription on the same payment method cannot already hold it.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | The parent order ID |
| `subscription` | integer | yes | The subscription ID |


**Request body** (`application/json`, required)

- `vendor_subscription_id` (string) _(maxLength: 45)_ — The subscription ID at the payment gateway. Send an empty string to clear it. Omit the key to leave it untouched.
- `vendor_customer_id` (string) _(maxLength: 45)_ — The customer ID at the payment gateway. Send an empty string to clear it. Omit the key to leave it untouched.

Example:

```json
{
  "vendor_subscription_id": "sub_1P9xyzABCdef",
  "vendor_customer_id": "cus_NffrFeUfNV2Hib"
}
```


**Responses**

- **200** — Vendor IDs updated

  Schema (`application/json`):

  - `message` (string)
  - `subscription` (object)
    - _(object)_

  Example:

```json
{
  "message": "Vendor IDs have been updated successfully!",
  "subscription": {
    "id": 1,
    "status": "active",
    "collection_method": "automatic",
    "current_payment_method": "stripe",
    "vendor_subscription_id": "sub_1P9xyzABCdef",
    "vendor_customer_id": "cus_NffrFeUfNV2Hib"
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/manage`).

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


- **422** — Validation failed

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "vendor_subscription_id": [
    "Vendor IDs may only contain letters, numbers, dots, dashes and underscores."
  ]
}
```



---

## POST `/orders/{order}/subscriptions/{subscription}/verify-vendor-ids`

**POST Verify Vendor IDs**

Read-only lookup of a candidate vendor subscription ID at the payment gateway, used before saving a correction. Writes nothing locally and nothing at the gateway. Requires the `fluent_cart/subscription/vendor_id_editing_enabled` filter and a gateway declaring the `verify_vendor_ids` capability (Stripe and PayPal); other gateways return an error. A successful lookup proves the ID exists in the merchant account whose credentials this store holds — it is not proof of ownership, since one merchant account can back several stores.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | The parent order ID |
| `subscription` | integer | yes | The subscription ID |


**Request body** (`application/json`, required)

- `vendor_subscription_id` (string) _(maxLength: 45)_ — The candidate subscription ID to look up
- `vendor_customer_id` (string) _(maxLength: 45)_ — The candidate customer ID. Sent because some gateways nest the subscription under its customer.

Example:

```json
{
  "vendor_subscription_id": "sub_1P9xyzABCdef",
  "vendor_customer_id": "cus_NffrFeUfNV2Hib"
}
```


**Responses**

- **200** — Lookup result

  Schema (`application/json`):

  - `message` (string)
  - `verification` (object)
    - `id` (string)
    - `status` (string) — The gateway's own status string
    - `customer_id` (string)
    - `amount` (string) — Decimal amount, empty when the gateway does not report one
    - `currency` (string)
    - `next_billing_date` (string) — GMT, Y-m-d H:i:s; empty when unknown

  Example:

```json
{
  "message": "Subscription found at the payment gateway.",
  "verification": {
    "id": "sub_1P9xyzABCdef",
    "status": "active",
    "customer_id": "cus_NffrFeUfNV2Hib",
    "amount": "29.00",
    "currency": "USD",
    "next_billing_date": "2026-09-01 00:00:00"
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


- **403** — Authenticated, but the user lacks the required capability (`subscriptions/manage`).

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
