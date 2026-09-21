# FluentCRM API — Commerce Reports (Pro)

2 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/commerce-reports/{provider}/report`

**GET Commerce Report**

Retrieve a specific type of commerce report for a provider. Returns detailed reporting data for the requested report type. Supported providers include 'woo' (WooCommerce), 'edd' (Easy Digital Downloads), 'learndash', 'lifterlms', 'tutorlms', and 'crm'. Additional providers can be registered via the 'fluentcrm_advanced_reports_provider_{provider}' filter.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | string | yes | The commerce provider slug (e.g., 'woo', 'edd', 'learndash', 'lifterlms', 'tutorlms', 'crm'). |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `report_type` | string | no | The specific report type to retrieve. Available types depend on the provider implementation. |


**Responses**

- **200** — Specific report data for the provider.

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "chart_data": {
    "labels": [
      "Jan",
      "Feb",
      "Mar"
    ],
    "datasets": [
      {
        "label": "Revenue",
        "data": [
          5000,
          6200,
          3800
        ]
      }
    ]
  },
  "summary": {
    "total": 15000,
    "average": 5000
  }
}
```


- **422** — Provider not found or not supported.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Provider Class stripe is not found"
}
```



---

## GET `/commerce-reports/{provider}`

**GET Commerce Reports**

Retrieve commerce reports for a specific provider. Returns aggregated reporting data based on the provider's implementation. Supported providers include 'woo' (WooCommerce), 'edd' (Easy Digital Downloads), 'learndash', 'lifterlms', 'tutorlms', and 'crm'. Additional providers can be registered via the 'fluentcrm_advanced_reports_provider_{provider}' filter.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | string | yes | The commerce provider slug (e.g., 'woo', 'edd', 'learndash', 'lifterlms', 'tutorlms', 'crm'). |


**Responses**

- **200** — Reports data for the specified provider.

  Schema (`application/json`):

  - `report` (object) — Report data structure varies by provider. Contains aggregated metrics such as revenue, orders, top products, customer growth, etc.
    - _(object)_

  Example:

```json
{
  "report": {
    "total_revenue": 15000,
    "total_orders": 250,
    "average_order_value": 60,
    "top_products": [
      {
        "name": "Premium Plan",
        "count": 85,
        "revenue": 4250
      }
    ]
  }
}
```


- **422** — Provider not found or not supported.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Provider Class stripe is not found"
}
```



---
