# FluentCart API — pdf-templates

11 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/settings/pdf-templates/create`

**POST Create PDF Template**

Create a new custom receipt template. The slug is derived from the title and returned as `slug`; use it for subsequent get/save/delete calls.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** — Display title for the new template. Required.

Example:

```json
{
  "title": "Wholesale Invoice"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `slug` (string) — Slug assigned to the new template.
  - `template` (object)
    - `name` (string) — Template slug; matches the key in the `templates` map.
    - `title` (string)
    - `description` (string)
    - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
    - `pdf_settings` (array<object>)
      - `active` (string) — `yes` or `no`.
      - `title` (string)
      - `preview_image` (string)
      - `pdf_structure` (object)
        - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.

  Example:

```json
{
  "message": "Template created successfully",
  "slug": "wholesale_invoice",
  "template": {
    "name": "wholesale_invoice",
    "title": "Wholesale Invoice",
    "description": "",
    "is_default": false,
    "pdf_settings": [
      {
        "active": "yes",
        "title": "Order Receipt",
        "preview_image": "",
        "pdf_structure": {
          "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
        }
      }
    ]
  }
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **422** — `title` was empty.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Template title is required"
}
```



---

## DELETE `/settings/pdf-templates/delete/{template_id}`

**DELETE Delete PDF Template**

Delete a custom receipt template. The four built-in templates (`is_default: true`) are protected and cannot be deleted.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `template_id` | string | yes | Slug of the custom template to delete. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Template deleted successfully"
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **422** — The template does not exist, is a protected built-in, or the delete failed. All three return 422.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Default templates cannot be deleted"
}
```



---

## POST `/settings/pdf-templates/download`

**POST Download PDF Preview**

Render a **test** PDF for a template and return it base64-encoded — no file is written and no URL is issued; decode `pdf_base64` client-side.

The sample is built from a real order: the most recent order that has an invoice number, falling back to the most recent order of any kind. The generated file is deleted from disk immediately after encoding.

Requires the Fluent PDF plugin — check `GET /settings/pdf-templates/status` first.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- `template_id` (string) _(default: `order_receipt`)_ — Slug of the template to render.

Example:

```json
{
  "template_id": "order_receipt"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `pdf_base64` (string) — Base64-encoded PDF bytes.
  - `filename` (string) — `{template_id}-{invoice_no}.pdf`.

  Example:

```json
{
  "pdf_base64": "JVBERi0xLjcKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2c...",
  "filename": "order_receipt-INV-001042.pdf"
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **422** — Fluent PDF is not active, the template does not exist, the store has no orders to sample, or rendering failed. All four return 422 — inspect `message` to tell them apart. Rendering failures are also written to the activity log.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Fluent PDF plugin is not active"
}
```



---

## GET `/settings/pdf-templates/factory-default`

**GET Get Factory Default Templates**

Retrieve the pristine, shipped templates, ignoring any saved customisations. Use this to power a "reset to default" action — diff or overwrite the saved template with what this returns.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `templates` (object) — Map keyed by template slug. The four built-ins are `order_receipt`, `renewal_receipt`, `refund_notice` and `proforma_invoice`; custom templates appear alongside them.
    - `order_receipt` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `renewal_receipt` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `refund_notice` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `proforma_invoice` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.

  Example:

```json
{
  "templates": {
    "order_receipt": {
      "name": "order_receipt",
      "title": "Order Receipt",
      "description": "Default receipt template for paid orders",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "renewal_receipt": {
      "name": "renewal_receipt",
      "title": "Renewal Receipt",
      "description": "Receipt sent for subscription renewals",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "refund_notice": {
      "name": "refund_notice",
      "title": "Refund Notice",
      "description": "Notice sent when an order is refunded",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "proforma_invoice": {
      "name": "proforma_invoice",
      "title": "Proforma Invoice",
      "description": "Proforma invoice issued before payment",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    }
  }
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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

## GET `/settings/pdf-templates/status`

**GET Get PDF Status**

Report whether the Fluent PDF engine is available. When it is not, the response carries the add-on's install/activate state so the UI can offer a one-click install.

PDF **generation** requires this to report `has_fluent_pdf: true`; template editing works without it.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `has_fluent_pdf` (boolean) — `true` when the `FLUENT_PDF` constant is defined, i.e. the Fluent PDF plugin is active.
  - `addon_info` (object) — Install/activate state for the Fluent PDF add-on. `null` when Fluent PDF is already active.
    - `plugin_slug` (string)
    - `plugin_file` (string)
    - `source_type` (string)
    - `is_installed` (boolean)
    - `is_active` (boolean)

  Example:

```json
{
  "has_fluent_pdf": false,
  "addon_info": {
    "plugin_slug": "fluentforms-pdf",
    "plugin_file": "fluentforms-pdf/fluentforms-pdf.php",
    "source_type": "wordpress",
    "is_installed": false,
    "is_active": false
  }
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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

## GET `/settings/pdf-templates/receipt/{template_id}`

**GET Get PDF Template**

Retrieve a single receipt PDF template with its block structure.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `template_id` | string | yes | Template slug, e.g. `order_receipt`, `renewal_receipt`, `refund_notice`, `proforma_invoice`, or a custom slug. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `template` (object)
    - `name` (string) — Template slug; matches the key in the `templates` map.
    - `title` (string)
    - `description` (string)
    - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
    - `pdf_settings` (array<object>)
      - `active` (string) — `yes` or `no`.
      - `title` (string)
      - `preview_image` (string)
      - `pdf_structure` (object)
        - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.

  Example:

```json
{
  "template": {
    "name": "order_receipt",
    "title": "Order Receipt",
    "description": "Default receipt template for paid orders",
    "is_default": true,
    "pdf_settings": [
      {
        "active": "yes",
        "title": "Order Receipt",
        "preview_image": "",
        "pdf_structure": {
          "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
        }
      }
    ]
  }
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **422** — No template matches `template_id`. Note this is a **422**, not a 404 — the controller uses the framework's default error status.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Template not found"
}
```



---

## GET `/settings/pdf-templates/saved`

**GET Get Saved Templates**

Retrieve the currently saved templates, falling back to the defaults where nothing has been saved. Legacy templates are migrated on read.

This returns the same `templates` map as `GET /settings/pdf-templates/receipt` but without the PDF engine status fields.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `templates` (object) — Map keyed by template slug. The four built-ins are `order_receipt`, `renewal_receipt`, `refund_notice` and `proforma_invoice`; custom templates appear alongside them.
    - `order_receipt` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `renewal_receipt` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `refund_notice` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `proforma_invoice` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.

  Example:

```json
{
  "templates": {
    "order_receipt": {
      "name": "order_receipt",
      "title": "Order Receipt",
      "description": "Default receipt template for paid orders",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "renewal_receipt": {
      "name": "renewal_receipt",
      "title": "Renewal Receipt",
      "description": "Receipt sent for subscription renewals",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "refund_notice": {
      "name": "refund_notice",
      "title": "Refund Notice",
      "description": "Notice sent when an order is refunded",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "proforma_invoice": {
      "name": "proforma_invoice",
      "title": "Proforma Invoice",
      "description": "Proforma invoice issued before payment",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    }
  }
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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

## GET `/settings/pdf-templates/seller-details`

**GET Get Seller Details**

Retrieve the E-Invoice (ZUGFeRD/Factur-X) seller details, plus whether the store country — a mandatory EN 16931 field (BT-40) that lives in Store Settings, not here — has been set.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `seller_details` (object)
    - `zugferd_enabled` (string) — `"1"` enables ZUGFeRD/Factur-X e-invoice embedding, `"0"` disables it.
    - `zugferd_profile` (string) — ZUGFeRD conformance profile, e.g. `en16931`.
    - `seller_legal_registration_scheme` (string) — ISO 6523 ICD code identifying the registration scheme. Validated against a fixed list.
    - `seller_contact_name` (string)
    - `seller_contact_email` (string) — Validated with `is_email()` when non-empty.
    - `seller_contact_phone` (string)
    - `seller_bank_iban` (string) — Validated as 2 letters + 2 digits + 4–30 alphanumerics, ignoring whitespace.
    - `seller_bank_bic` (string)
    - `seller_bank_account_name` (string)
    - `seller_electronic_address` (string)
    - `seller_vat_id` (string)
    - `seller_tax_id` (string)
    - `seller_legal_name` (string)
    - `seller_legal_registration_id` (string)
  - `store_country_set` (boolean) — `false` blocks enabling ZUGFeRD.
  - `store_settings_url` (string) — Deep link to the Store Settings business-details section.

  Example:

```json
{
  "seller_details": {
    "zugferd_enabled": "1",
    "zugferd_profile": "en16931",
    "seller_legal_registration_scheme": "0198",
    "seller_contact_name": "Alex Morgan",
    "seller_contact_email": "alex.morgan@example.com",
    "seller_contact_phone": "+1 555 0100",
    "seller_bank_iban": "DE89370400440532013000",
    "seller_bank_bic": "COBADEFFXXX",
    "seller_bank_account_name": "Example Retail Co.",
    "seller_electronic_address": "billing@example.com",
    "seller_vat_id": "DE123456789",
    "seller_tax_id": "12/345/67890",
    "seller_legal_name": "Example Retail Co.",
    "seller_legal_registration_id": "HRB 12345"
  },
  "store_country_set": true,
  "store_settings_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/settings/store-settings#business_details"
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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

## GET `/settings/pdf-templates/receipt`

**GET List PDF Templates**

Retrieve every receipt PDF template, merged with the PDF engine status. Legacy templates are migrated to the current block format on read.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `templates` (object) — Map keyed by template slug. The four built-ins are `order_receipt`, `renewal_receipt`, `refund_notice` and `proforma_invoice`; custom templates appear alongside them.
    - `order_receipt` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `renewal_receipt` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `refund_notice` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
    - `proforma_invoice` (object)
      - `name` (string) — Template slug; matches the key in the `templates` map.
      - `title` (string)
      - `description` (string)
      - `is_default` (boolean) — Built-in templates are `true` and cannot be deleted.
      - `pdf_settings` (array<object>)
        - `active` (string) — `yes` or `no`.
        - `title` (string)
        - `preview_image` (string)
        - `pdf_structure` (object)
          - `content` (string) — Gutenberg block markup using `wp:fluent-cart/receipt-*` blocks, with `{{order.*}}` merge tags.
  - `has_fluent_pdf` (boolean) — `true` when the `FLUENT_PDF` constant is defined, i.e. the Fluent PDF plugin is active.
  - `addon_info` (object) — Install/activate state for the Fluent PDF add-on. `null` when Fluent PDF is already active.
    - `plugin_slug` (string)
    - `plugin_file` (string)
    - `source_type` (string)
    - `is_installed` (boolean)
    - `is_active` (boolean)

  Example:

```json
{
  "templates": {
    "order_receipt": {
      "name": "order_receipt",
      "title": "Order Receipt",
      "description": "Default receipt template for paid orders",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "renewal_receipt": {
      "name": "renewal_receipt",
      "title": "Renewal Receipt",
      "description": "Receipt sent for subscription renewals",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "refund_notice": {
      "name": "refund_notice",
      "title": "Refund Notice",
      "description": "Notice sent when an order is refunded",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    },
    "proforma_invoice": {
      "name": "proforma_invoice",
      "title": "Proforma Invoice",
      "description": "Proforma invoice issued before payment",
      "is_default": true,
      "pdf_settings": [
        {
          "active": "yes",
          "title": "Order Receipt",
          "preview_image": "",
          "pdf_structure": {
            "content": "<!-- wp:fluent-cart/receipt-header {\"title\":\"RECEIPT\"} /-->\n\n<!-- wp:fluent-cart/receipt-addresses {\"billingLabel\":\"BILL TO\"} /-->\n\n<!-- wp:fluent-cart/receipt-meta {\"rows\":[{\"label\":\"Order Number\",\"value\":\"{{order.invoice_no}}\"},{\"label\":\"Order Date\",\"value\":\"{{order.created_at}}\"}]} /-->"
          }
        }
      ]
    }
  },
  "has_fluent_pdf": false,
  "addon_info": {
    "plugin_slug": "fluentforms-pdf",
    "plugin_file": "fluentforms-pdf/fluentforms-pdf.php",
    "source_type": "wordpress",
    "is_installed": false,
    "is_active": false
  }
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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

## POST `/settings/pdf-templates/receipt/{template_id}`

**POST Save PDF Template**

Persist the block structure of a receipt PDF template. The whole `pdf_structure` is replaced, so send the complete document rather than a partial edit.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `template_id` | string | yes | Template slug to write to. |


**Request body** (`application/json`, required)

- `pdf_structure` (object) **required**
  - `content` (string) — Gutenberg block markup for the receipt.

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Template saved successfully"
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **422** — `pdf_structure` was empty, or the write failed.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "No template data provided"
}
```



---

## POST `/settings/pdf-templates/seller-details`

**POST Save Seller Details**

Save the E-Invoice seller details.

Validation runs before anything is written and returns **all** failures at once in `data`, keyed by field. Enabling ZUGFeRD (`zugferd_enabled: "1"`) additionally requires, from **Store Settings** rather than this payload, either a seller VAT ID or a legal registration ID, plus a store country.

**Permission:** `is_super_admin` (`manage_options`) · **Policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `zugferd_enabled` (string) — `"1"` enables ZUGFeRD/Factur-X e-invoice embedding, `"0"` disables it.
- `zugferd_profile` (string) — ZUGFeRD conformance profile, e.g. `en16931`.
- `seller_legal_registration_scheme` (string) — ISO 6523 ICD code identifying the registration scheme. Validated against a fixed list.
- `seller_contact_name` (string)
- `seller_contact_email` (string) — Validated with `is_email()` when non-empty.
- `seller_contact_phone` (string)
- `seller_bank_iban` (string) — Validated as 2 letters + 2 digits + 4–30 alphanumerics, ignoring whitespace.
- `seller_bank_bic` (string)
- `seller_bank_account_name` (string)
- `seller_electronic_address` (string)
- `seller_vat_id` (string)
- `seller_tax_id` (string)
- `seller_legal_name` (string)
- `seller_legal_registration_id` (string)

Example:

```json
{
  "zugferd_enabled": "1",
  "zugferd_profile": "en16931",
  "seller_legal_registration_scheme": "0198",
  "seller_contact_name": "Alex Morgan",
  "seller_contact_email": "alex.morgan@example.com",
  "seller_contact_phone": "+1 555 0100",
  "seller_bank_iban": "DE89370400440532013000",
  "seller_bank_bic": "COBADEFFXXX",
  "seller_bank_account_name": "Example Retail Co.",
  "seller_electronic_address": "billing@example.com",
  "seller_vat_id": "DE123456789",
  "seller_tax_id": "12/345/67890",
  "seller_legal_name": "Example Retail Co.",
  "seller_legal_registration_id": "HRB 12345"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `seller_details` (object)
    - `zugferd_enabled` (string) — `"1"` enables ZUGFeRD/Factur-X e-invoice embedding, `"0"` disables it.
    - `zugferd_profile` (string) — ZUGFeRD conformance profile, e.g. `en16931`.
    - `seller_legal_registration_scheme` (string) — ISO 6523 ICD code identifying the registration scheme. Validated against a fixed list.
    - `seller_contact_name` (string)
    - `seller_contact_email` (string) — Validated with `is_email()` when non-empty.
    - `seller_contact_phone` (string)
    - `seller_bank_iban` (string) — Validated as 2 letters + 2 digits + 4–30 alphanumerics, ignoring whitespace.
    - `seller_bank_bic` (string)
    - `seller_bank_account_name` (string)
    - `seller_electronic_address` (string)
    - `seller_vat_id` (string)
    - `seller_tax_id` (string)
    - `seller_legal_name` (string)
    - `seller_legal_registration_id` (string)

  Example:

```json
{
  "message": "Settings saved successfully",
  "seller_details": {
    "zugferd_enabled": "1",
    "zugferd_profile": "en16931",
    "seller_legal_registration_scheme": "0198",
    "seller_contact_name": "Alex Morgan",
    "seller_contact_email": "alex.morgan@example.com",
    "seller_contact_phone": "+1 555 0100",
    "seller_bank_iban": "DE89370400440532013000",
    "seller_bank_bic": "COBADEFFXXX",
    "seller_bank_account_name": "Example Retail Co.",
    "seller_electronic_address": "billing@example.com",
    "seller_vat_id": "DE123456789",
    "seller_tax_id": "12/345/67890",
    "seller_legal_name": "Example Retail Co.",
    "seller_legal_registration_id": "HRB 12345"
  }
}
```


- **403** — Forbidden — the user is not a super admin.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **422** — Validation failed. Nothing was saved.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object) — Field-keyed error lists.
    - _(object)_

  Example:

```json
{
  "message": "Validation failed. Please correct the errors below.",
  "data": {
    "seller_vat_id": [
      "Seller VAT ID or Legal Registration ID is required when ZUGFeRD is enabled. Please add it in Settings → Store Settings."
    ],
    "seller_bank_iban": [
      "Please provide a valid IBAN."
    ]
  }
}
```



---
