# FluentCart API — Email Notifications

15 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/email-notification/enable-notification/{name}`

**POST Enable/Disable Notification**

Toggle a notification template on or off without modifying other settings.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | yes | The notification key (e.g., order_paid_admin) |


**Request body** (`application/json`, required)

- `active` (string) **required** _(enum: `yes`, `no`)_ — Set to yes to enable or no to disable the notification

Example:

```json
{
  "active": "yes"
}
```


**Responses**

- **200** — Notification updated successfully

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Notification updated successfully"
}
```


- **400** — Bad request or update failed

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to update notification"
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

## GET `/email-notification/{notification}`

**GET Get Single Notification**

Retrieve a single email notification template by its name, along with available shortcodes for the email editor.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `notification` | string | yes | The notification key (e.g., order_paid_customer, subscription_renewal_admin) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (EmailNotificationDetail)
  - `shortcodes` (object) — Available shortcode groups for the email editor
    - _(object)_

  Example:

```json
{
  "data": {
    "event": "order_paid",
    "group": "order",
    "group_label": "Order Actions",
    "title": "Purchase receipt to customer",
    "description": "This email will be sent to the customer after an order is placed.",
    "recipient": "customer",
    "smartcode_groups": [
      "order",
      "customer",
      "transaction"
    ],
    "template_path": "order.paid.customer",
    "is_async": false,
    "name": "order_paid_customer",
    "settings": {
      "active": "yes",
      "subject": "Purchase Receipt #{{order.invoice_no}}",
      "is_default_body": "yes",
      "email_body": ""
    }
  },
  "shortcodes": {
    "order": {
      "title": "Order",
      "key": "order",
      "shortcodes": {
        "{{order.id}}": "Order ID",
        "{{order.invoice_no}}": "Order Number",
        "{{order.status}}": "Order Status",
        "{{order.total_amount_formatted}}": "Order Total Amount (Formatted)"
      }
    },
    "general": {
      "title": "General",
      "key": "wp",
      "shortcodes": {
        "{{wp.admin_email}}": "Admin Email",
        "{{wp.site_url}}": "Site URL",
        "{{wp.site_title}}": "Site Title"
      }
    },
    "customer": {
      "title": "Customer",
      "key": "customer",
      "shortcodes": {
        "{{order.billing.first_name}}": "First Name",
        "{{order.billing.last_name}}": "Last Name",
        "{{order.billing.email}}": "Email"
      }
    },
    "transaction": {
      "title": "transaction",
      "key": "settings",
      "shortcodes": {
        "{{transaction.total_formatted}}": "Total Amount (Formatted)",
        "{{transaction.payment_method}}": "Payment Method",
        "{{transaction.status}}": "Status"
      }
    },
    "settings": {
      "title": "Settings",
      "key": "settings",
      "shortcodes": {
        "{{settings.store_name}}": "Store Name",
        "{{settings.store_logo}}": "Store Logo"
      }
    },
    "license": {
      "title": "License (Loop)",
      "key": "license",
      "shortcodes": {
        "{{license.key}}": "License Key",
        "{{license.status}}": "Status"
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


- **404** — Notification not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Notification Details not found"
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

## GET `/email-notification/reminders`

**GET Get Scheduling Settings**

Retrieve reminder/scheduling settings for automated email notifications such as payment reminders, renewal reminders, and trial-end reminders. Returns both the current settings and the form field definitions for the reminders tab.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `settings` (object) — Current reminder/scheduling settings
    - `reminders_enabled` (string) _(enum: `yes`, `no`)_ — Master toggle for all reminders
    - `invoice_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable invoice payment reminders
    - `invoice_reminder_due_days` (integer) — Days before due date to send invoice reminder (0-365)
    - `invoice_reminder_overdue_days` (string) — Comma-separated day intervals for overdue reminders
    - `yearly_renewal_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable yearly subscription renewal reminders
    - `yearly_renewal_reminder_days` (integer) — Days before renewal to send reminder (7-90)
    - `trial_end_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable trial ending reminders
    - `trial_end_reminder_days` (integer) — Days before trial ends to send reminder (1-14)
    - `monthly_renewal_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable monthly renewal reminders
    - `monthly_renewal_reminder_days` (integer) — Days before renewal to send reminder (3-28)
    - `quarterly_renewal_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable quarterly renewal reminders
    - `quarterly_renewal_reminder_days` (integer) — Days before renewal to send reminder (7-60)
    - `half_yearly_renewal_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable half-yearly renewal reminders
    - `half_yearly_renewal_reminder_days` (integer) — Days before renewal to send reminder (7-60)
  - `fields` (object) — Form field definitions for the reminders settings tab
    - `reminders` (object) — Reminder field configurations
      - _(object)_

  Example:

```json
{
  "settings": {
    "reminders_enabled": "yes",
    "invoice_reminders_enabled": "yes",
    "invoice_reminder_due_days": 3,
    "invoice_reminder_overdue_days": "1,3,7",
    "yearly_renewal_reminders_enabled": "yes",
    "yearly_renewal_reminder_days": 30,
    "trial_end_reminders_enabled": "yes",
    "trial_end_reminder_days": 3,
    "monthly_renewal_reminders_enabled": "no",
    "monthly_renewal_reminder_days": 7,
    "quarterly_renewal_reminders_enabled": "no",
    "quarterly_renewal_reminder_days": 14,
    "half_yearly_renewal_reminders_enabled": "no",
    "half_yearly_renewal_reminder_days": 14
  },
  "fields": {
    "reminders": {
      "title": "Reminder Settings",
      "type": "section",
      "schema": {
        "reminders_enabled": {
          "label": "Enable Reminders",
          "type": "toggle"
        },
        "invoice_reminders_enabled": {
          "label": "Invoice Reminders",
          "type": "toggle"
        },
        "invoice_reminder_due_days": {
          "label": "Days Before Due Date",
          "type": "number",
          "min": 0,
          "max": 365
        },
        "invoice_reminder_overdue_days": {
          "label": "Overdue Reminder Days",
          "type": "text",
          "placeholder": "1,3,7"
        },
        "yearly_renewal_reminders_enabled": {
          "label": "Yearly Renewal Reminders",
          "type": "toggle"
        },
        "yearly_renewal_reminder_days": {
          "label": "Days Before Yearly Renewal",
          "type": "number",
          "min": 7,
          "max": 90
        },
        "trial_end_reminders_enabled": {
          "label": "Trial End Reminders",
          "type": "toggle"
        },
        "trial_end_reminder_days": {
          "label": "Days Before Trial End",
          "type": "number",
          "min": 1,
          "max": 14
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

## GET `/email-notification/get-settings`

**GET Get Global Email Settings**

Retrieve the global email configuration settings used across all notification emails (sender name, email addresses, footer, etc.).

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object)
    - `from_name` (string) — Sender name displayed in emails
    - `from_email` (string) _(format: email)_ — Sender email address
    - `reply_to_name` (string) — Reply-to name
    - `reply_to_email` (string) — Reply-to email address
    - `email_footer` (string) — HTML content for the email footer
    - `show_email_footer` (string) _(enum: `yes`, `no`)_ — Whether to show the email footer
    - `admin_email` (string) — Admin notification recipient email(s). Supports shortcodes
    - `notification_config` (object) — Notification-specific configurations
      - _(object)_
  - `shortcodes` (array<ShortcodeGroup>) — Available shortcode groups for settings fields

  Example:

```json
{
  "data": {
    "from_name": "TechStore",
    "from_email": "orders@example.com",
    "reply_to_name": "TechStore Support",
    "reply_to_email": "support@example.com",
    "email_footer": "<p>&copy; 2025 TechStore Inc. All rights reserved.</p><p>456 Market Street, San Francisco, CA 94102</p>",
    "show_email_footer": "yes",
    "admin_email": "{{wp.admin_email}}",
    "notification_config": {
      "order_paid_admin": {
        "active": "yes"
      },
      "order_paid_customer": {
        "active": "yes"
      },
      "order_refunded_admin": {
        "active": "yes"
      },
      "order_refunded_customer": {
        "active": "yes"
      }
    }
  },
  "shortcodes": [
    {
      "title": "General",
      "key": "wp",
      "shortcodes": {
        "{{wp.admin_email}}": "Admin Email",
        "{{wp.site_url}}": "Site URL",
        "{{wp.site_title}}": "Site Title",
        "{{user.display_name}}": "User Display Name",
        "{{user.user_email}}": "User Email"
      }
    },
    {
      "title": "Settings",
      "key": "settings",
      "shortcodes": {
        "{{settings.store_name}}": "Store Name",
        "{{settings.store_logo}}": "Store Logo",
        "{{settings.store_address}}": "Store Address Line 1"
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

## GET `/email-notification/get-short-codes`

**GET Get Shortcodes**

Retrieve available shortcodes, email template files, and editor buttons for the email notification editor.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object)
    - `email_templates` (array<object>) — Available email template files
      - `path` (string) — Template path identifier
      - `label` (string) — Human-readable template label
    - `shortcodes` (object) — Available shortcode groups keyed by group name
      - _(object)_
    - `buttons` (object) — Pre-built HTML button snippets for the email editor, keyed by button label
      - _(object)_

  Example:

```json
{
  "data": {
    "email_templates": [
      {
        "path": "fluent_cart_order_paid",
        "label": "Order Paid"
      },
      {
        "path": "fluent_cart_subscription_renewal",
        "label": "Subscription Renewal"
      }
    ],
    "shortcodes": {
      "order": {
        "title": "Order",
        "key": "order",
        "shortcodes": {
          "{{order.id}}": "Order ID",
          "{{order.customer_dashboard_link}}": "Customer Dashboard Link",
          "{{order.status}}": "Order Status",
          "{{order.invoice_no}}": "Order Number",
          "{{order.total_amount_formatted}}": "Order Total Amount (Formatted)",
          "{{order.created_at}}": "Order Create Date"
        }
      },
      "general": {
        "title": "General",
        "key": "wp",
        "shortcodes": {
          "{{wp.admin_email}}": "Admin Email",
          "{{wp.site_url}}": "Site URL",
          "{{wp.site_title}}": "Site Title",
          "{{user.display_name}}": "User Display Name",
          "{{user.user_email}}": "User Email"
        }
      },
      "customer": {
        "title": "Customer",
        "key": "customer",
        "shortcodes": {
          "{{order.billing.first_name}}": "First Name",
          "{{order.billing.last_name}}": "Last Name",
          "{{order.billing.email}}": "Email",
          "{{order.billing.city}}": "City",
          "{{order.billing.state}}": "State",
          "{{order.billing.country}}": "Country"
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
          "{{settings.store_postcode}}": "Store Postcode"
        }
      },
      "license": {
        "title": "License (Loop)",
        "key": "license",
        "shortcodes": {
          "{{license.sl}}": "Serial Number",
          "{{license.key}}": "License Key",
          "{{license.status}}": "Status",
          "{{license.product_name}}": "Product Name",
          "{{license.variant}}": "Variant",
          "{{license.limit}}": "Activation Limit",
          "{{license.activation_count}}": "Activation Count",
          "{{license.expiration_date}}": "Expiration Date"
        }
      }
    },
    "buttons": {
      "View Order": "<a href=\"https://example.com/wp-admin/admin.php?page=fluent-cart#/orders/{{order.id}}/view\" style=\"background-color: green; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">View Order</a>"
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

## GET `/email-notification`

**GET List All Notifications**

Retrieve all registered email notification templates with their current configuration. Returns both default and customized notification settings for orders, subscriptions, and scheduler/reminder actions.

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Email notifications keyed by notification name
    - _(object)_

  Example:

```json
{
  "data": {
    "order_paid_admin": {
      "event": "order_paid_done",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Send mail to admin after New Order Paid",
      "description": "This email will be sent to the admin after an order is placed.",
      "recipient": "admin",
      "smartcode_groups": [
        "order",
        "customer",
        "transaction"
      ],
      "template_path": "order.paid.admin",
      "is_async": false,
      "pre_header": "You got a new order on your shop! Order #{{order.invoice_no}} totaling {{order.total_amount_formatted}}.",
      "name": "order_paid_admin",
      "settings": {
        "active": "yes",
        "subject": "New Sales On {{settings.store_name}}",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      }
    },
    "order_paid_customer": {
      "event": "order_paid",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Purchase receipt to customer",
      "description": "This email will be sent to the customer after an order is placed.",
      "recipient": "customer",
      "smartcode_groups": [
        "order",
        "customer",
        "transaction"
      ],
      "template_path": "order.paid.customer",
      "is_async": false,
      "name": "order_paid_customer",
      "settings": {
        "active": "yes",
        "subject": "Purchase Receipt #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      }
    },
    "order_refunded_admin": {
      "event": "order_refunded",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Order refund notification to admin",
      "description": "This email will be sent to the admin when an order is refunded.",
      "recipient": "admin",
      "smartcode_groups": [
        "order",
        "customer",
        "transaction"
      ],
      "template_path": "order.refunded.admin",
      "is_async": false,
      "pre_header": "A refund has been processed for order #{{order.invoice_no}}.",
      "name": "order_refunded_admin",
      "settings": {
        "active": "yes",
        "subject": "Refund Processed for Order #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      }
    },
    "order_refunded_customer": {
      "event": "order_refunded",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Order refund notification to customer",
      "description": "This email will be sent to the customer when their order is refunded.",
      "recipient": "customer",
      "smartcode_groups": [
        "order",
        "customer",
        "transaction"
      ],
      "template_path": "order.refunded.customer",
      "is_async": false,
      "name": "order_refunded_customer",
      "settings": {
        "active": "yes",
        "subject": "Your Refund for Order #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      }
    },
    "subscription_renewal_customer": {
      "event": "subscription_renewal",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Subscription renewal notification to customer",
      "description": "This email will be sent to the customer when their subscription is renewed.",
      "recipient": "customer",
      "smartcode_groups": [
        "subscription"
      ],
      "template_path": "subscription.renewal.customer",
      "is_async": false,
      "name": "subscription_renewal_customer",
      "settings": {
        "active": "yes",
        "subject": "Subscription Renewed - Receipt #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      }
    },
    "subscription_canceled_customer": {
      "event": "subscription_canceled",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Subscription canceled notification to customer",
      "description": "This email will be sent to the customer when their subscription is canceled.",
      "recipient": "customer",
      "smartcode_groups": [
        "subscription"
      ],
      "template_path": "subscription.canceled.customer",
      "is_async": false,
      "name": "subscription_canceled_customer",
      "settings": {
        "active": "yes",
        "subject": "Your Subscription Has Been Canceled",
        "is_default_body": "yes",
        "email_body": ""
      }
    },
    "order_delivered_customer": {
      "event": "shipping_status_changed_to_delivered",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Send mail to customer when shipping status changed to delivered.",
      "description": "This email will be sent to the customer after an order is marked as delivered",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "order.delivered.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Order has been delivered #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      },
      "name": "order_delivered_customer"
    },
    "order_placed_admin": {
      "event": "order_placed_offline",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Send mail to admin after New Order Placed (Offline Payment)",
      "description": "This email will be sent to the admin when an order is placed using offline payment method.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "order.placed.admin",
      "is_async": false,
      "manage_toggle": "no",
      "toggle_label": "Auto-enabled for offline payments",
      "pre_header": "You have a new order on your shop placed with offline payment. Please review the order details in this email. You can also go to FluentCart Dashboard to view the order details and manage it. Thank you for using FluentCart.",
      "settings": {
        "subject": "New Order on {{settings.store_name}} (Offline Payment)",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      },
      "name": "order_placed_admin"
    },
    "order_placed_customer": {
      "event": "order_placed_offline",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Order confirmation to customer (Offline Payment)",
      "description": "This email will be sent to the customer when an order is placed using offline payment method.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "order.placed.customer",
      "is_async": false,
      "manage_toggle": "no",
      "toggle_label": "Auto-enabled for offline payments",
      "settings": {
        "subject": "Order Confirmation #{{order.invoice_no}} (Offline Payment)",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      },
      "name": "order_placed_customer"
    },
    "order_shipped_customer": {
      "event": "shipping_status_changed_to_shipped",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Send mail to customer when shipping status changed to shipped.",
      "description": "This email will be sent to the customer after an order is marked as shipped",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "order.shipped.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Order has been shipped #{{order.invoice_no}} 📦",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      },
      "name": "order_shipped_customer"
    },
    "renewal_created_admin": {
      "event": "renewal_created",
      "group": "manual_subscription",
      "group_label": "Store-Managed Renewals",
      "title": "Notify admin when a renewal order is created",
      "description": "This email will be sent to the admin when a renewal order is generated for a store-managed subscription.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "renewal.created.admin",
      "pre_header": "A new renewal order has been created for a store-managed subscription. Review it in the FluentCart Dashboard.",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "New Renewal Order Created on {{settings.store_name}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "renewal_created_admin"
    },
    "renewal_created_customer": {
      "event": "renewal_created",
      "group": "manual_subscription",
      "group_label": "Store-Managed Renewals",
      "title": "Send the renewal order to the customer when a renewal order is created",
      "description": "This email will be sent to the customer when a renewal order is generated for a store-managed subscription.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "renewal.created.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Your Subscription Renewal #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "renewal_created_customer"
    },
    "renewal_reminder_due_admin": {
      "event": "renewal_reminder_due",
      "group": "manual_subscription",
      "group_label": "Store-Managed Renewals",
      "title": "Renewal due reminder copy to admin",
      "description": "This email will be sent to admin when a due reminder is sent to customer.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "order.reminder.due.admin",
      "pre_header": "A renewal due reminder was sent to a customer. Review the order details in this email or visit FluentCart Dashboard.",
      "is_async": false,
      "settings": {
        "active": "no",
        "subject": "Renewal Reminder Sent #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "renewal_reminder_due_admin"
    },
    "renewal_reminder_due_customer": {
      "event": "renewal_reminder_due",
      "group": "manual_subscription",
      "group_label": "Store-Managed Renewals",
      "title": "Renewal due reminder to customer",
      "description": "This email will be sent before/at renewal due date when payment is pending.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "order.reminder.due.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Payment Reminder #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "renewal_reminder_due_customer"
    },
    "renewal_reminder_overdue_customer": {
      "event": "renewal_reminder_overdue",
      "group": "scheduler",
      "group_label": "Scheduler / Reminder Actions",
      "title": "Payment reminder to customer",
      "description": "This email will be sent to remind customer about pending payment.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "order.reminder.overdue.customer",
      "is_async": false,
      "manage_toggle": "no",
      "toggle_label": "On demand",
      "settings": {
        "subject": "Payment Reminder - Order #{{order.id}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "renewal_reminder_overdue_customer"
    },
    "subscription_canceled_admin": {
      "event": "subscription_canceled",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Send mail to admin when a subscription is canceled",
      "description": "This email will be sent to the admin when a subscription is canceled.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "subscription.canceled.admin",
      "pre_header": "A subscription has been canceled. Review the details in this email or visit FluentCart Dashboard to manage the subscription.",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Subscription Canceled - {{order.customer.full_name}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_canceled_admin"
    },
    "subscription_past_due_admin": {
      "event": "subscription_past_due",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Notify admin when a subscription is past due",
      "description": "This email will be sent to the admin when a subscription is marked as past due.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "subscription.past_due.admin",
      "pre_header": "A subscription payment is past due. Review the subscription details in this email or visit FluentCart Dashboard.",
      "is_async": false,
      "settings": {
        "active": "no",
        "subject": "Subscription Past Due #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_past_due_admin"
    },
    "subscription_past_due_customer": {
      "event": "subscription_past_due",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Notify customer when subscription is past due",
      "description": "This email will be sent to the customer when their subscription is marked as past due.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "subscription.past_due.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Your Subscription is Past Due on {{settings.store_name}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_past_due_customer"
    },
    "subscription_period_skipped_customer": {
      "event": "subscription_period_skipped",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Notify customer when a billing period is skipped",
      "description": "This email will be sent to the customer when an admin skips their next billing period. The internal reason and actor are never included. Off by default.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "subscription.period_skipped.customer",
      "is_async": false,
      "settings": {
        "active": "no",
        "subject": "Your next payment has been skipped on {{settings.store_name}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_period_skipped_customer"
    },
    "subscription_renewal_admin": {
      "event": "subscription_renewed",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Send mail to admin after a subscription renewed",
      "description": "This email will be sent to the admin after a renewal payment made",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "subscription.renewal.admin",
      "pre_header": "You got a new Renewal on your shop. Congratulations! Checkout all the details in this email. You can also go to FluentCart Dashboard to view the order details and manage it. Thank you for using FluentCart.",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "New Renewal On {{settings.store_name}}",
        "is_default_body": "yes",
        "email_body": "",
        "attach_pdf_template": ""
      },
      "name": "subscription_renewal_admin"
    },
    "subscription_renewal_failed_admin": {
      "event": "subscription_renewal_failed",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Notify admin when an automatic renewal charge fails",
      "description": "This email will be sent to the admin when a saved payment method could not be charged for a subscription renewal.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "subscription.renewal_failed.admin",
      "pre_header": "An automatic subscription renewal charge failed. Review the order in the FluentCart Dashboard.",
      "is_async": false,
      "settings": {
        "active": "no",
        "subject": "Automatic Charge Failed for Renewal #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_renewal_failed_admin"
    },
    "subscription_renewal_failed_customer": {
      "event": "subscription_renewal_failed",
      "group": "subscription",
      "group_label": "Subscription Actions",
      "title": "Notify customer when an automatic renewal charge fails",
      "description": "This email will be sent to the customer when their saved payment method could not be charged for a subscription renewal.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "subscription.renewal_failed.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Automatic Payment Failed for Renewal #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_renewal_failed_customer"
    },
    "subscription_renewal_reminder_admin": {
      "event": "subscription_renewal_reminder",
      "group": "scheduler",
      "group_label": "Scheduler / Reminder Actions",
      "title": "Upcoming renewal reminder copy to admin",
      "description": "This email will be sent to admin when an upcoming renewal reminder is sent.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "subscription.reminder.admin",
      "pre_header": "A subscription renewal reminder was sent to a customer. Review subscription details from FluentCart Dashboard.",
      "is_async": false,
      "settings": {
        "active": "no",
        "subject": "Renewal Reminder Sent for {{order.customer.full_name}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_renewal_reminder_admin"
    },
    "subscription_renewal_reminder_customer": {
      "event": "subscription_renewal_reminder",
      "group": "scheduler",
      "group_label": "Scheduler / Reminder Actions",
      "title": "Upcoming renewal reminder to customer",
      "description": "This email will be sent before subscription auto-renewal date.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "subscription.reminder.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Upcoming Renewal Reminder from {{settings.store_name}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_renewal_reminder_customer"
    },
    "subscription_trial_end_reminder_admin": {
      "event": "subscription_trial_end_reminder",
      "group": "scheduler",
      "group_label": "Scheduler / Reminder Actions",
      "title": "Trial ending soon reminder copy to admin",
      "description": "This email will be sent to admin when a trial ending reminder is sent to a customer.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "subscription.trial_end.admin",
      "pre_header": "A trial ending soon reminder was sent to a customer. Review subscription details from FluentCart Dashboard.",
      "is_async": false,
      "settings": {
        "active": "no",
        "subject": "Trial Ending Soon - {{order.customer.full_name}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_trial_end_reminder_admin"
    },
    "subscription_trial_end_reminder_customer": {
      "event": "subscription_trial_end_reminder",
      "group": "scheduler",
      "group_label": "Scheduler / Reminder Actions",
      "title": "Trial ending soon reminder to customer",
      "description": "This email will be sent before a trial period ends and converts to a paid subscription.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "subscription.trial_end.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Your Trial is Ending Soon - {{settings.store_name}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "subscription_trial_end_reminder_customer"
    },
    "system_charge_failed_admin": {
      "event": "system_charge_failed",
      "group": "system_subscription",
      "group_label": "Store-Managed Renewals · Auto-Charge",
      "title": "Notify admin when an automatic renewal charge fails",
      "description": "This email will be sent to the admin when a saved payment method could not be charged for a renewal order.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "subscription.charge_failed.admin",
      "pre_header": "An automatic subscription renewal charge failed. Review the renewal order in the FluentCart Dashboard.",
      "is_async": false,
      "settings": {
        "active": "no",
        "subject": "Automatic Charge Failed for Renewal #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "system_charge_failed_admin"
    },
    "system_charge_failed_customer": {
      "event": "system_charge_failed",
      "group": "system_subscription",
      "group_label": "Store-Managed Renewals · Auto-Charge",
      "title": "Notify customer when an automatic renewal charge fails",
      "description": "This email will be sent to the customer when the saved payment method could not be charged for a renewal order. It includes the failure reason and a Pay Now link.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "subscription.charge_failed.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Automatic Payment Failed for Renewal #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "system_charge_failed_customer"
    },
    "system_upcoming_charge_customer": {
      "event": "system_upcoming_charge",
      "group": "system_subscription",
      "group_label": "Store-Managed Renewals · Auto-Charge",
      "title": "Notify customer before an automatic renewal charge",
      "description": "This email tells the customer the amount and date of the upcoming automatic charge to their saved payment method, when the renewal order is created ahead of the due date.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "subscription.upcoming_charge.customer",
      "is_async": false,
      "settings": {
        "active": "yes",
        "subject": "Upcoming automatic payment for your subscription",
        "is_default_body": "yes",
        "email_body": ""
      },
      "name": "system_upcoming_charge_customer"
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

## POST `/email-notification/preview-default-template`

**POST Preview Default Template**

Generate an HTML preview of a default (built-in) email template. Unlike the custom block editor preview, this renders the PHP-based default template using dummy preview data, wrapped in the standard email layout with header and footer.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `template` (string) **required** _(enum: `order.paid.admin`, `order.paid.customer`, `order.refunded.admin`, `order.refunded.customer`, `order.shipped.customer`, `order.delivered.customer`, `order.placed.admin`, `order.placed.customer`, `order.reminder.overdue.customer`, `order.reminder.overdue.admin`, `subscription.renewal.customer`, `subscription.renewal.admin`, `subscription.canceled.customer`, `subscription.canceled.admin`, `subscription.reminder.customer`, `subscription.reminder.admin`, `subscription.trial_end.customer`, `subscription.trial_end.admin`)_ — The template path name to preview. Corresponds to the template_path value from the notification configuration

Example:

```json
{
  "template": "order.paid.customer"
}
```


**Responses**

- **200** — Successful response with rendered HTML

  Schema (`application/json`):

  - `data` (object)
    - `content` (string) — Fully rendered email HTML with the default PHP template, dummy preview data, header, footer, and resolved shortcodes. All links and buttons are disabled via injected CSS

  Example:

```json
{
  "data": {
    "content": "<!DOCTYPE html><html>...rendered email HTML...</html>"
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

## POST `/email-notification/preview`

**POST Preview Notification**

Generate an HTML preview of a custom email notification template. Uses the block editor email body from the notification's saved settings, parses it through the block parser, wraps it in the email template layout, and resolves shortcodes using real or fallback order data.

**Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `notification_name` (string) **required** — The notification key to preview (e.g., order_paid_customer)
- `order_id` (integer) — Specific order ID to use for shortcode data. If not provided or not found, the most recent order is used

Example:

```json
{
  "notification_name": "order_paid_customer",
  "order_id": 42
}
```


**Responses**

- **200** — Successful response with rendered HTML

  Schema (`application/json`):

  - `html` (string) — Fully rendered email HTML including parsed block editor content, header, footer, and resolved shortcodes

  Example:

```json
{
  "html": "<!DOCTYPE html><html>...rendered email HTML...</html>"
}
```


- **400** — Bad request - missing or invalid notification name

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No notification name provided."
}
```


- **404** — Notification not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Notification not found."
}
```



---

## POST `/email-notification/reminders`

**POST Save Scheduling Settings**

Update reminder/scheduling settings for automated email notifications. Each reminder type has an enable toggle and a days configuration that controls how many days before the event the reminder is sent.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `reminders_enabled` (string) _(enum: `yes`, `no`)_ — Master toggle for all reminders
- `invoice_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable invoice payment reminders
- `invoice_reminder_due_days` (integer) _(min: 0; max: 365)_ — Days before due date to send invoice reminder. Required when invoice_reminders_enabled is yes
- `invoice_reminder_overdue_days` (string) — Comma-separated day intervals for overdue reminders (e.g., 1,3,7)
- `yearly_renewal_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable yearly subscription renewal reminders
- `yearly_renewal_reminder_days` (integer) _(min: 7; max: 90)_ — Days before renewal to send reminder. Required when yearly_renewal_reminders_enabled is yes
- `trial_end_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable trial ending reminders
- `trial_end_reminder_days` (integer) _(min: 1; max: 14)_ — Days before trial ends to send reminder. Required when trial_end_reminders_enabled is yes
- `monthly_renewal_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable monthly renewal reminders
- `monthly_renewal_reminder_days` (integer) _(min: 3; max: 28)_ — Days before renewal to send reminder. Required when monthly_renewal_reminders_enabled is yes
- `quarterly_renewal_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable quarterly renewal reminders
- `quarterly_renewal_reminder_days` (integer) _(min: 7; max: 60)_ — Days before renewal to send reminder. Required when quarterly_renewal_reminders_enabled is yes
- `half_yearly_renewal_reminders_enabled` (string) _(enum: `yes`, `no`)_ — Enable half-yearly renewal reminders
- `half_yearly_renewal_reminder_days` (integer) _(min: 7; max: 60)_ — Days before renewal to send reminder. Required when half_yearly_renewal_reminders_enabled is yes

Example:

```json
{
  "reminders_enabled": "yes",
  "invoice_reminders_enabled": "yes",
  "invoice_reminder_due_days": 3,
  "invoice_reminder_overdue_days": "1,3,7",
  "yearly_renewal_reminders_enabled": "yes",
  "yearly_renewal_reminder_days": 30,
  "trial_end_reminders_enabled": "yes",
  "trial_end_reminder_days": 3,
  "monthly_renewal_reminders_enabled": "no",
  "monthly_renewal_reminder_days": 7,
  "quarterly_renewal_reminders_enabled": "no",
  "quarterly_renewal_reminder_days": 14,
  "half_yearly_renewal_reminders_enabled": "no",
  "half_yearly_renewal_reminder_days": 14
}
```


**Responses**

- **200** — Scheduling settings saved successfully

  Schema (`application/json`):

  - `data` (object) — Updated settings data
    - _(object)_
  - `message` (string)

  Example:

```json
{
  "data": {
    "reminders_enabled": "yes",
    "invoice_reminders_enabled": "yes",
    "invoice_reminder_due_days": 3,
    "invoice_reminder_overdue_days": "1,3,7",
    "yearly_renewal_reminders_enabled": "yes",
    "yearly_renewal_reminder_days": 30,
    "trial_end_reminders_enabled": "yes",
    "trial_end_reminder_days": 3,
    "monthly_renewal_reminders_enabled": "no",
    "monthly_renewal_reminder_days": 7,
    "quarterly_renewal_reminders_enabled": "no",
    "quarterly_renewal_reminder_days": 14,
    "half_yearly_renewal_reminders_enabled": "no",
    "half_yearly_renewal_reminder_days": 14
  },
  "message": "Scheduling settings saved successfully"
}
```


- **400** — Bad request or save failed

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to save scheduling settings"
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

## POST `/email-notification/save-settings`

**POST Save Global Email Settings**

Update the global email configuration settings for all notification emails.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `from_name` (string) **required** _(maxLength: 255)_ — Sender name displayed in emails (max 255 characters)
- `from_email` (string) **required** _(format: email; maxLength: 255)_ — Sender email address (must be valid email, max 255 characters)
- `reply_to_name` (string) _(maxLength: 255)_ — Reply-to name (max 255 characters)
- `reply_to_email` (string) _(format: email; maxLength: 255)_ — Reply-to email address (must be valid email, max 255 characters)
- `email_footer` (string) — HTML content for the email footer. Sanitized with wp_kses_post
- `admin_email` (string) **required** — Admin notification recipient email(s). Supports shortcodes like {{wp.admin_email}}
- `show_email_footer` (string) _(enum: `yes`, `no`)_ — Show or hide the email footer. On free plans, this is always forced to yes

Example:

```json
{
  "from_name": "TechStore",
  "from_email": "orders@example.com",
  "reply_to_name": "TechStore Support",
  "reply_to_email": "support@example.com",
  "email_footer": "<p>&copy; 2025 TechStore Inc. All rights reserved.</p>",
  "admin_email": "admin@example.com",
  "show_email_footer": "yes"
}
```


**Responses**

- **200** — Settings saved successfully

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Email settings saved successfully"
}
```


- **400** — Bad request or save failed

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to save email settings"
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

## PUT `/email-notification/{notification}`

**PUT Update Notification**

Update an email notification template's settings including subject, body content, and active status.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `notification` | string | yes | The notification key (e.g., order_paid_customer) |


**Request body** (`application/json`, required)

- `settings` (object) **required**
  - `subject` (string) **required** _(maxLength: 255)_ — Email subject line. Supports shortcodes like {{order.invoice_no}}
  - `email_body` (string) — Custom email body content (HTML). Sanitized with wp_kses_post
  - `active` (string) _(enum: `yes`, `no`)_ — Enable or disable the notification
  - `is_default_body` (string) _(enum: `yes`, `no`)_ — Whether to use the default template body. When set to yes, the custom email_body is cleared

Example:

```json
{
  "settings": {
    "subject": "Your Order #{{order.invoice_no}} is Confirmed!",
    "email_body": "<p>Thank you for your purchase, {{order.billing.first_name}}!</p>",
    "active": "yes",
    "is_default_body": "no"
  }
}
```


**Responses**

- **200** — Notification updated successfully

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Notification updated successfully"
}
```


- **400** — Bad request or update failed

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to update notification"
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

## GET `/email-notification/digest-settings`

**GET Get Store Digest Settings**

Retrieve the store's digest email settings — the recurring summary email(s) sent to store admins on a daily, weekly, and/or monthly cadence.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns the current store digest settings.

  Schema (`application/json`):

  - `data` (object)
    - `enabled` (string) — "yes" or "no" — whether digest emails are enabled at all.
    - `recipients` (string) — Comma-separated recipient list, or a template like {{wp.admin_email}}.
    - `send_when_empty` (string) — "yes" or "no" — whether to send a digest even when there's no activity to report.
    - `daily` (object)
      - `enabled` (string)
      - `send_hour` (integer)
    - `weekly` (object)
      - `enabled` (string)
      - `send_hour` (integer)
      - `send_dow` (integer) — Day of week to send, 0-6.
    - `monthly` (object)
      - `enabled` (string)
      - `send_hour` (integer)

  Example:

```json
{
  "data": {
    "enabled": "yes",
    "recipients": "{{wp.admin_email}}",
    "send_when_empty": "no",
    "daily": {
      "enabled": "no",
      "send_hour": 8
    },
    "weekly": {
      "enabled": "yes",
      "send_hour": 8,
      "send_dow": 1
    },
    "monthly": {
      "enabled": "no",
      "send_hour": 8
    }
  }
}
```


- **401** — Unauthenticated.

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


- **403** — The authenticated user lacks store-sensitive access.

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

## POST `/email-notification/digest-settings`

**POST Save Store Digest Settings**

Save the store's digest email settings. The `enabled` master flag is derived server-side — it is set to "yes" automatically whenever any of the daily, weekly, or monthly cadences are enabled, and cannot be set directly.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- `recipients` (string) — Comma-separated recipient list, or a template like {{wp.admin_email}}. Defaults to {{wp.admin_email}} if omitted.
- `send_when_empty` (string) — "yes" to send a digest even when there's no activity to report; anything else is treated as "no".
- `daily` (object)
  - `enabled` (string) — "yes" to enable the daily digest; anything else is treated as "no".
  - `send_hour` (integer) — Hour of day to send, clamped to 0-23.
- `weekly` (object)
  - `enabled` (string)
  - `send_hour` (integer) — Hour of day to send, clamped to 0-23.
  - `send_dow` (integer) — Day of week to send, 0-6.
- `monthly` (object)
  - `enabled` (string)
  - `send_hour` (integer) — Hour of day to send, clamped to 0-23.

Example:

```json
{
  "recipients": "alex.morgan@example.com",
  "send_when_empty": "no",
  "daily": {
    "enabled": "no",
    "send_hour": 8
  },
  "weekly": {
    "enabled": "yes",
    "send_hour": 8,
    "send_dow": 1
  },
  "monthly": {
    "enabled": "no",
    "send_hour": 8
  }
}
```


**Responses**

- **200** — Digest settings saved successfully.

  Schema (`application/json`):

  - `data` (object) — The stored digest settings, including the server-derived enabled flag.
    - _(object)_
  - `message` (string)

  Example:

```json
{
  "data": {
    "enabled": "yes",
    "recipients": "alex.morgan@example.com",
    "send_when_empty": "no",
    "daily": {
      "enabled": "no",
      "send_hour": 8
    },
    "weekly": {
      "enabled": "yes",
      "send_hour": 8,
      "send_dow": 1
    },
    "monthly": {
      "enabled": "no",
      "send_hour": 8
    }
  },
  "message": "Store digest settings saved successfully"
}
```


- **401** — Unauthenticated.

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


- **403** — The authenticated user lacks store-sensitive access.

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

## POST `/email-notification/digest-settings/send-test`

**POST Send Test Digest Email**

Send a one-off test digest email for the given cadence, using the store's currently configured digest recipients (falling back to the WordPress admin email if none are configured).

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- `frequency` (string) _(enum: `daily`, `weekly`, `monthly`)_ — One of: daily, weekly, monthly. Falls back to "daily" if omitted or not a recognized cadence.

Example:

```json
{
  "frequency": "weekly"
}
```


**Responses**

- **200** — Test digest email sent successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Test digest email sent."
}
```


- **401** — Unauthenticated.

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


- **403** — The authenticated user lacks store-sensitive access.

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


- **422** — The test email could not be sent (e.g. no valid mailer/recipients configured).

  Example:

```json
{
  "message": "Could not send the test email. Please check your mailing settings and recipients."
}
```



---

## POST `/email-notification/send-manual-reminder`

**POST Send Manual Reminder**

Manually trigger a reminder email for a single entity (for example, a subscription payment reminder) outside of its normal scheduled trigger.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `event` (string) **required** — The reminder event type to send.
- `entity_id` (integer) **required** — ID of the entity (e.g. subscription ID) the reminder relates to.

Example:

```json
{
  "event": "subscription_payment_reminder",
  "entity_id": 15
}
```


**Responses**

- **200** — Reminder sent successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Reminder sent successfully."
}
```


- **401** — Unauthenticated.

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


- **403** — The authenticated user lacks store-sensitive access.

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


- **422** — Missing event/entity_id, or the reminder could not be sent for the given entity.

  Example:

```json
{
  "message": "Event type and entity ID are required"
}
```



---
