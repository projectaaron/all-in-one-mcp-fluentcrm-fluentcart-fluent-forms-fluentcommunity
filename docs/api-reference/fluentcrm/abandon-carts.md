# FluentCRM API — Abandoned Carts (Pro)

3 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/abandon-carts/bulk-delete`

**POST Bulk Delete Abandoned Carts**

Delete multiple abandoned carts by their IDs. Each cart and its associated data are removed.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `cart_ids` (array<integer>) **required** — Array of cart IDs to delete.

Example:

```json
{
  "cart_ids": [
    1,
    5,
    12
  ]
}
```


**Responses**

- **200** — Carts deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Selected carts have been deleted successfully"
}
```


- **422** — Validation error when no cart IDs are provided.

  Schema (`application/json`):

  - `message` (string) — Error message.

  Example:

```json
{
  "message": "No carts selected to delete"
}
```



---

## GET `/abandon-carts/report-summary`

**GET Get Abandon Cart Report Summary**

Retrieve a summary of abandoned cart metrics including recovered, processing, lost, draft, and opt-out revenue with counts. Also includes the overall recovery rate.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `date_range[]` | array<string> | no | Date range filter as an array of two date strings [start_date, end_date]. Defaults to the last 30 days if not provided or invalid. |


**Responses**

- **200** — Report summary with revenue and count widgets.

  Schema (`application/json`):

  - `widgets` (object) — Map of widget keys to their data.
    - `recovered_revenue` (ReportWidget)
    - `processing_revenue` (ReportWidget)
    - `lost_revenue` (ReportWidget)
    - `draft_revenue` (ReportWidget)
    - `optout_revenue` (ReportWidget)
    - `recovery_rate` (ReportWidget)

  Example:

```json
{
  "widgets": {
    "recovered_revenue": {
      "title": "Recovered Revenue",
      "value": "$1,250.00",
      "count": "15"
    },
    "processing_revenue": {
      "title": "Processing Revenue",
      "value": "$340.50",
      "count": "8"
    },
    "lost_revenue": {
      "title": "Lost Revenue",
      "value": "$890.00",
      "count": "22"
    },
    "draft_revenue": {
      "title": "Draft Revenue",
      "value": "$120.00",
      "count": "3"
    },
    "optout_revenue": {
      "title": "Optout Revenue",
      "value": "$50.00",
      "count": "1"
    },
    "recovery_rate": {
      "title": "Recovery Rate",
      "value": "40.54%",
      "count": ""
    }
  }
}
```



---

## GET `/abandon-carts`

**GET List Abandoned Carts**

Retrieve a paginated list of abandoned carts with subscriber and automation data. Includes information about enabled cart-recovery drivers and whether automation funnels are configured.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query[status]` | string | no | Filter carts by status. |
| `query[search]` | string | no | Search carts by keyword. |
| `date_range[]` | array<string> | no | Date range filter as an array of two date strings [start_date, end_date]. Defaults to the last 30 days if not provided or invalid. |
| `per_page` | integer | no | Number of carts per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of abandoned carts.

  Schema (`application/json`):

  - `carts` (object) — Paginated cart results.
    - `total` (integer) — Total number of carts matching the query.
    - `per_page` (integer) — Number of carts per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `data` (array<AbandonCart>)
  - `haveAutomation` (boolean) — Whether all enabled drivers have corresponding published automation funnels.
  - `missingAutomations` (array<string>) — List of driver labels that do not have published automation funnels.
  - `drivers` (object) — Map of enabled cart-recovery driver slugs to their details.
    - _(object)_

  Example:

```json
{
  "carts": {
    "total": 45,
    "per_page": 15,
    "current_page": 1,
    "last_page": 3,
    "data": [
      {
        "id": 12,
        "email": "john@example.com",
        "full_name": "John Doe",
        "status": "processing",
        "provider": "woocommerce",
        "cart_total": "89.99",
        "currency": "USD",
        "created_at": "2024-03-01 14:30:00",
        "updated_at": "2024-03-01 15:00:00",
        "recovery_url": "https://example.com/checkout?recover=abc123",
        "customer_avatar": "https://www.gravatar.com/avatar/abc123"
      }
    ]
  },
  "haveAutomation": true,
  "missingAutomations": [],
  "drivers": {
    "woocommerce": {
      "label": "WooCommerce",
      "logo": "https://example.com/woo-logo.png"
    }
  }
}
```



---
