# FluentCRM API — export

2 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/subscribers-export`

**POST Fetch Contact Export Page**

<Badge type="warning" text="Pro" />

Fetch one page of contact-export rows. The admin export runs by calling this repeatedly and assembling the CSV client-side, which is what keeps a six-figure export from timing out in a single request.

**Paging is fixed at 500 rows per request** and cannot be changed. Keep requesting while `has_more` is true, incrementing `page`.

`total` and `headers` are returned **only on page 1** — capture them on the first call, because later pages carry just `page`, `rows`, and `has_more`.

The maximum page is 200, a hard ceiling of 100,000 rows per export; beyond that the endpoint returns 400.

`filter_type` selects one of two mutually exclusive branches: `simple` reads `tags`, `lists`, and `statuses`, while `advanced` reads `advanced_filters` and ignores the others.

Prefer this POST form: export selections routinely exceed what fits in a query string.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts_export`

_Enforced by `ExportPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `columns` (array<string>) **required** — Contact columns to export. **Required** — an empty or non-array value returns 400. Including `tags`, `lists`, `companies`, or `primary_company` also eager-loads that relation.
- `custom_fields` (array<string>) — Custom field keys to add as extra columns.
- `commerce_columns` (array<string>) — Commerce columns to append. Supplying any of these forces `has_commerce` on, restricting the export to contacts with commerce data.
- `page` (integer) _(default: `1`)_ — 1-based page of the export. Page size is fixed at 500 and the maximum page is 200, giving a hard ceiling of 100,000 rows.
- `limit` (integer) — Optional cap on total rows across all pages. Ignored unless between 1 and 100,000.
- `offset` (integer) — Number of rows to skip before the first exported row.
- `filter_type` (string) _(enum: `simple`, `advanced`; default: `simple`)_ — Which filtering branch to use. The two are mutually exclusive.
- `tags` (array<integer>) — Tag ids (simple filtering only).
- `lists` (array<integer>) — List ids (simple filtering only).
- `statuses` (array<string>) — Contact statuses (simple filtering only).
- `advanced_filters` (string) — JSON-encoded filter groups (advanced filtering only).
- `contact_ids` (array<integer>) — Export only these contacts. Ids of zero or less are discarded.
- `company_ids` (array<integer>) — Restrict to contacts belonging to these companies.
- `search` (string) — Search term applied to the contact query.
- `sort_by` (string) _(default: `id`)_ — Column to sort by.
- `sort_type` (string) _(enum: `ASC`, `DESC`; default: `DESC`)_ — Sort direction.
- `has_commerce` (string) — Restrict to contacts that have commerce data.

Example:

```json
{
  "columns": [
    "email",
    "first_name",
    "last_name",
    "status",
    "tags"
  ],
  "filter_type": "simple",
  "statuses": [
    "subscribed"
  ],
  "page": 1
}
```


**Responses**

- **200** — One page of export rows.

  Schema (`application/json`):

  - `page` (integer) — The page that was returned.
  - `total` (integer) — Total rows the export will produce. **Page 1 only.**
  - `headers` (array<string>) — Column labels for the CSV header row. **Page 1 only.**
  - `rows` (array<array<string>>) — Flattened contact rows, aligned to `headers`.
  - `has_more` (boolean) — True while further pages remain.

  Example:

```json
{
  "page": 1,
  "total": 12867,
  "headers": [
    "Email",
    "First Name",
    "Last Name",
    "Status",
    "Tags"
  ],
  "rows": [
    [
      "john@example.com",
      "John",
      "Doe",
      "subscribed",
      "VIP Customer"
    ]
  ],
  "has_more": true
}
```


- **400** — `columns` was empty or not an array, or `page` exceeded the 200-page maximum.

  Schema (`application/json`):

  - _$ref: Error_
- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **404** — No contacts matched the export query.

  Schema (`application/json`):

  - _$ref: Error_

---

## GET `/subscribers-export`

**GET Fetch Contact Export Page**

<Badge type="warning" text="Pro" />

Fetch one page of contact-export rows. The admin export runs by calling this repeatedly and assembling the CSV client-side, which is what keeps a six-figure export from timing out in a single request.

**Paging is fixed at 500 rows per request** and cannot be changed. Keep requesting while `has_more` is true, incrementing `page`.

`total` and `headers` are returned **only on page 1** — capture them on the first call, because later pages carry just `page`, `rows`, and `has_more`.

The maximum page is 200, a hard ceiling of 100,000 rows per export; beyond that the endpoint returns 400.

`filter_type` selects one of two mutually exclusive branches: `simple` reads `tags`, `lists`, and `statuses`, while `advanced` reads `advanced_filters` and ignores the others.

This is the same handler as `POST /subscribers-export`, with parameters read from the query string. Array parameters must be sent in bracket form (`columns[]=email`). For anything but a small column list, prefer the POST form — long selections overflow practical URL length limits.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts_export`

_Enforced by `ExportPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `columns[]` | array<string> | no | Contact columns to export. Required. |
| `custom_fields[]` | array<string> | no | Custom field keys to add as columns. |
| `commerce_columns[]` | array<string> | no | Commerce columns to append. Forces `has_commerce` on. |
| `page` | integer | no | 1-based export page. Page size is fixed at 500; maximum page is 200. |
| `limit` | integer | no | Cap on total rows across all pages. |
| `offset` | integer | no | Rows to skip before the first exported row. |
| `filter_type` | string | no | Which filtering branch to use. |
| `tags[]` | array<integer> | no | Tag ids (simple filtering only). |
| `lists[]` | array<integer> | no | List ids (simple filtering only). |
| `statuses[]` | array<string> | no | Contact statuses (simple filtering only). |
| `advanced_filters` | string | no | JSON-encoded filter groups (advanced filtering only). |
| `contact_ids[]` | array<integer> | no | Export only these contacts. |
| `company_ids[]` | array<integer> | no | Restrict to these companies. |
| `search` | string | no | Search term applied to the contact query. |
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `has_commerce` | string | no | Restrict to contacts that have commerce data. |


**Responses**

- **200** — One page of export rows.

  Schema (`application/json`):

  - `page` (integer) — The page that was returned.
  - `total` (integer) — Total rows the export will produce. **Page 1 only.**
  - `headers` (array<string>) — Column labels for the CSV header row. **Page 1 only.**
  - `rows` (array<array<string>>) — Flattened contact rows, aligned to `headers`.
  - `has_more` (boolean) — True while further pages remain.

  Example:

```json
{
  "page": 1,
  "total": 12867,
  "headers": [
    "Email",
    "First Name",
    "Last Name",
    "Status",
    "Tags"
  ],
  "rows": [
    [
      "john@example.com",
      "John",
      "Doe",
      "subscribed",
      "VIP Customer"
    ]
  ],
  "has_more": true
}
```


- **400** — `columns` was empty or not an array, or `page` exceeded the 200-page maximum.

  Schema (`application/json`):

  - _$ref: Error_
- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **404** — No contacts matched the export query.

  Schema (`application/json`):

  - _$ref: Error_

---
