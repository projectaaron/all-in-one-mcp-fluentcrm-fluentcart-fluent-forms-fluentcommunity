# FluentCart API — Reports

43 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## GET `/reports/country-heat-map`

**GET Get Country Heat Map**

Retrieve order counts grouped by billing country for world map / heat map visualization.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[currency]` | string | no | Currency code filter. Defaults to store currency. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `countryHeatMap` (array<object>) — Order counts by country for heat map visualization
    - `name` (string) — Country name
    - `value` (integer) — Order count

  Example:

```json
{
  "countryHeatMap": [
    {
      "name": "United States",
      "value": 120
    },
    {
      "name": "United Kingdom",
      "value": 35
    },
    {
      "name": "Germany",
      "value": 22
    },
    {
      "name": "Canada",
      "value": 18
    },
    {
      "name": "Australia",
      "value": 12
    },
    {
      "name": "France",
      "value": 10
    },
    {
      "name": "Netherlands",
      "value": 8
    },
    {
      "name": "India",
      "value": 7
    },
    {
      "name": "Brazil",
      "value": 5
    },
    {
      "name": "Japan",
      "value": 4
    }
  ]
}
```



---

## GET `/reports/customer-report`

**GET Get Customer Report**

Retrieve customer acquisition and activity data as time-series chart data with summary statistics. Supports comparison against a prior period with fluctuation calculations.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `summary` (object) — Customer report summary
    - _(object)_
  - `previousSummary` (object) — Comparison period summary
    - _(object)_
  - `fluctuations` (object) — Fluctuation data
    - _(object)_
  - `currentMetrics` (array<object>) — Current period metrics
    - _(object)_
  - `previousMetrics` (array<object>) — Comparison period metrics
    - _(object)_

  Example:

```json
{
  "summary": {
    "total_customers": 215,
    "new_customers": 32,
    "returning_customers": 183
  },
  "previousSummary": {
    "total_customers": 185,
    "new_customers": 28,
    "returning_customers": 157
  },
  "fluctuations": {
    "total_customers": {
      "value": 16.2,
      "direction": "up"
    },
    "new_customers": {
      "value": 14.3,
      "direction": "up"
    },
    "returning_customers": {
      "value": 16.6,
      "direction": "up"
    }
  },
  "currentMetrics": [
    {
      "year": "2025",
      "group": "2025-01",
      "new_customers": 8,
      "total_customers": 25
    },
    {
      "year": "2025",
      "group": "2025-02",
      "new_customers": 12,
      "total_customers": 30
    },
    {
      "year": "2025",
      "group": "2025-03",
      "new_customers": 6,
      "total_customers": 22
    },
    {
      "year": "2025",
      "group": "2025-04",
      "new_customers": 10,
      "total_customers": 28
    },
    {
      "year": "2025",
      "group": "2025-05",
      "new_customers": 15,
      "total_customers": 35
    },
    {
      "year": "2025",
      "group": "2025-06",
      "new_customers": 9,
      "total_customers": 27
    }
  ],
  "previousMetrics": [
    {
      "year": "2024",
      "group": "2024-07",
      "new_customers": 6,
      "total_customers": 20
    },
    {
      "year": "2024",
      "group": "2024-08",
      "new_customers": 9,
      "total_customers": 24
    },
    {
      "year": "2024",
      "group": "2024-09",
      "new_customers": 5,
      "total_customers": 18
    },
    {
      "year": "2024",
      "group": "2024-10",
      "new_customers": 8,
      "total_customers": 22
    },
    {
      "year": "2024",
      "group": "2024-11",
      "new_customers": 11,
      "total_customers": 28
    },
    {
      "year": "2024",
      "group": "2024-12",
      "new_customers": 7,
      "total_customers": 21
    }
  ]
}
```



---

## GET `/reports/daily-signups`

**GET Get Daily Signups**

Retrieve daily subscription signup counts over the specified date range.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[subscriptionType]` | string | no | Subscription type filter. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `signups` (object) — Daily signup count data
    - _(object)_

  Example:

```json
{
  "signups": {
    "labels": [
      "2025-09-14",
      "2025-09-15",
      "2025-09-16",
      "2025-09-17",
      "2025-09-18",
      "2025-09-19",
      "2025-09-20"
    ],
    "data": [
      3,
      5,
      2,
      8,
      4,
      6,
      3
    ],
    "total": 31
  }
}
```



---

## GET `/reports/dashboard-stats`

**GET Get Dashboard Stats**

Retrieve key dashboard statistics including total orders, paid orders, paid order items, and total paid amounts. Automatically calculates comparison against the equivalent prior period based on the selected date range.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date. If omitted, defaults to the earliest order date. |
| `params[endDate]` | string | no | End date. If omitted, defaults to today. |
| `params[currency]` | string | no | Currency code filter. Defaults to store currency. |
| `params[paymentStatus]` | string | no | Payment status filter. Set to all to include all statuses. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `dashBoardStats` (object) — Dashboard statistics with current and comparison counts
    - _(object)_

  Example:

```json
{
  "dashBoardStats": {
    "total_orders": {
      "title": "All Orders",
      "icon": "AllOrdersIcon",
      "current_count": 342,
      "compare_count": 289
    },
    "paid_orders": {
      "title": "Paid Orders",
      "icon": "Money",
      "current_count": 328,
      "compare_count": 275
    },
    "total_paid_order_items": {
      "title": "Paid Order Items",
      "icon": "OrderItemsIcon",
      "current_count": 856,
      "compare_count": 720
    },
    "total_paid_amounts": {
      "title": "Order Value (Paid)",
      "icon": "OrderValueIcon",
      "current_count": 1250000,
      "compare_count": 1050000,
      "is_cents": true
    }
  }
}
```



---

## GET `/reports/fetch-new-vs-returning-customer`

**GET Get New vs Returning Customers**

Compare the ratio of orders from new customers versus returning customers over the given period.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `newVsReturning` (object) — Comparison data for new vs returning customers
    - _(object)_

  Example:

```json
{
  "newVsReturning": {
    "new_customers": 32,
    "returning_customers": 183,
    "new_orders": 38,
    "returning_orders": 304,
    "new_revenue": 285000,
    "returning_revenue": 965000,
    "new_vs_returning_ratio": 0.175,
    "chart": [
      {
        "label": "New Customers",
        "value": 32,
        "percentage": 14.9
      },
      {
        "label": "Returning Customers",
        "value": 183,
        "percentage": 85.1
      }
    ]
  }
}
```



---

## GET `/reports/fetch-order-by-group`

**GET Get Orders by Group**

Retrieve order data broken down by a specified grouping dimension (e.g., payment method, country, payment status).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Order data grouped by the specified dimension
    - _(object)_

  Example:

```json
{
  "data": {
    "by_payment_method": [
      {
        "label": "Stripe",
        "orders": 230,
        "revenue": 850000
      },
      {
        "label": "PayPal",
        "orders": 95,
        "revenue": 320000
      },
      {
        "label": "Cash on Delivery",
        "orders": 17,
        "revenue": 80000
      }
    ],
    "by_billing_country": [
      {
        "label": "US",
        "orders": 120,
        "revenue": 680000
      },
      {
        "label": "GB",
        "orders": 35,
        "revenue": 195000
      },
      {
        "label": "DE",
        "orders": 22,
        "revenue": 118000
      },
      {
        "label": "CA",
        "orders": 18,
        "revenue": 95000
      }
    ]
  }
}
```



---

## GET `/reports/fetch-report-by-day-and-hour`

**GET Get Report by Day and Hour**

Retrieve a heatmap-style report showing order distribution by day of the week and hour of the day.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "heatmap": {
    "days": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "hours": [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23
    ],
    "data": [
      {
        "day": "Monday",
        "hour": 9,
        "count": 18
      },
      {
        "day": "Monday",
        "hour": 10,
        "count": 24
      },
      {
        "day": "Monday",
        "hour": 14,
        "count": 22
      },
      {
        "day": "Tuesday",
        "hour": 10,
        "count": 28
      },
      {
        "day": "Tuesday",
        "hour": 11,
        "count": 26
      },
      {
        "day": "Wednesday",
        "hour": 9,
        "count": 20
      },
      {
        "day": "Wednesday",
        "hour": 14,
        "count": 19
      },
      {
        "day": "Thursday",
        "hour": 10,
        "count": 25
      },
      {
        "day": "Thursday",
        "hour": 15,
        "count": 21
      },
      {
        "day": "Friday",
        "hour": 11,
        "count": 16
      },
      {
        "day": "Saturday",
        "hour": 12,
        "count": 8
      },
      {
        "day": "Sunday",
        "hour": 15,
        "count": 5
      }
    ],
    "max_count": 28,
    "total_orders": 342
  }
}
```



---

## GET `/reports/fetch-report-meta`

**GET Get Report Meta**

Retrieve metadata for the reporting interface, including available currencies, the earliest order date, and store mode.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date to scope the currency lookup. |
| `params[endDate]` | string | no | End date to scope the currency lookup. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `currencies` (object) — Available currencies with codes and signs
    - _(object)_
  - `min_date` (string) — Earliest order date
  - `storeMode` (string) — Current store mode (live or test)
  - `first_order_date` (string) — Date of the first order

  Example:

```json
{
  "currencies": {
    "USD": {
      "code": "USD",
      "sign": "$"
    },
    "EUR": {
      "code": "EUR",
      "sign": "€"
    },
    "GBP": {
      "code": "GBP",
      "sign": "£"
    }
  },
  "min_date": "2024-01-15 08:30:00",
  "storeMode": "live",
  "first_order_date": "2024-01-15 08:30:00"
}
```



---

## GET `/reports/fetch-top-sold-products`

**GET Get Top Sold Products**

Retrieve a ranked list of the best-selling products within the specified date range.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "topSoldProducts": [
    {
      "product_id": 123,
      "title": "Developer Toolkit Pro",
      "total_sold": 142,
      "total_revenue": 680000,
      "product_type": "digital"
    },
    {
      "product_id": 125,
      "title": "API Testing Suite",
      "total_sold": 98,
      "total_revenue": 290000,
      "product_type": "digital"
    },
    {
      "product_id": 130,
      "title": "WordPress starter theme",
      "total_sold": 76,
      "total_revenue": 152000,
      "product_type": "digital"
    },
    {
      "product_id": 128,
      "title": "Cloud Hosting Add-on",
      "total_sold": 65,
      "total_revenue": 97500,
      "product_type": "digital"
    },
    {
      "product_id": 135,
      "title": "Premium Support Package",
      "total_sold": 42,
      "total_revenue": 626000,
      "product_type": "digital"
    }
  ]
}
```



---

## GET `/reports/fetch-top-sold-variants`

**GET Get Top Sold Variants**

Retrieve a ranked list of the best-selling product variants within the specified date range.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "topSoldVariants": [
    {
      "variant_id": 457,
      "title": "Business License - Annual",
      "product_title": "Developer Toolkit Pro",
      "total_sold": 89,
      "revenue": 450000
    },
    {
      "variant_id": 456,
      "title": "Personal License",
      "product_title": "Developer Toolkit Pro",
      "total_sold": 53,
      "revenue": 230000
    },
    {
      "variant_id": 460,
      "title": "Team License - Annual",
      "product_title": "API Testing Suite",
      "total_sold": 48,
      "revenue": 192000
    },
    {
      "variant_id": 459,
      "title": "Solo License",
      "product_title": "API Testing Suite",
      "total_sold": 50,
      "revenue": 98000
    },
    {
      "variant_id": 465,
      "title": "Standard License",
      "product_title": "WordPress starter theme",
      "total_sold": 76,
      "revenue": 152000
    }
  ]
}
```



---

## GET `/reports/future-renewals`

**GET Get Future Renewals**

Retrieve projected future subscription renewal data.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "futureRenewals": [
    {
      "date": "2025-10-01",
      "count": 15,
      "expected_revenue": 148500
    },
    {
      "date": "2025-11-01",
      "count": 22,
      "expected_revenue": 217800
    },
    {
      "date": "2025-12-01",
      "count": 18,
      "expected_revenue": 178200
    },
    {
      "date": "2026-01-01",
      "count": 28,
      "expected_revenue": 277200
    },
    {
      "date": "2026-02-01",
      "count": 12,
      "expected_revenue": 118800
    },
    {
      "date": "2026-03-01",
      "count": 20,
      "expected_revenue": 198000
    }
  ],
  "total_expected_revenue": 1138500,
  "total_renewals": 115
}
```



---

## POST `/reports/retention-snapshots/generate`

**POST Generate Retention Snapshots**

Trigger generation of retention snapshot data. If Action Scheduler is available, the job runs in the background; otherwise it runs synchronously.

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- `product_id` (integer) — Specific product ID to generate snapshots for. If omitted, generates for all products.

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `success` (boolean) — Whether the operation was successful
  - `message` (string) — Status message
  - `job_id` (integer) — Unix timestamp job ID for tracking
  - `mode` (string) _(enum: `background`, `synchronous`)_ — Execution mode

  Example:

```json
{
  "success": true,
  "message": "Snapshot generation queued",
  "job_id": 1718456789,
  "mode": "background"
}
```



---

## GET `/reports/get-dashboard-summary`

**GET Get Dashboard Summary**

Retrieve a high-level summary of the store including product counts and coupon statistics.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `summaryData` (object) — Store summary data
    - `total_products` (integer) — Total fluent-products count
    - `draft_products` (integer) — Draft product count
    - `active_coupons` (integer) — Active coupon count
    - `expired_coupons` (integer) — Expired coupon count

  Example:

```json
{
  "summaryData": {
    "total_products": 25,
    "draft_products": 3,
    "active_coupons": 8,
    "expired_coupons": 4
  }
}
```



---

## GET `/reports/overview`

**GET Get Revenue Overview**

Retrieve a comprehensive year-over-year revenue overview comparing the last 12 months against the same months in the prior year. Includes monthly breakdowns, quarterly aggregations, and top revenue-generating countries.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[currency]` | string | no | Currency code to filter by. Defaults to store currency. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Revenue overview data with gross/net revenue, quarterly breakdowns, and top countries
    - _(object)_

  Example:

```json
{
  "data": {
    "gross_revenue": {
      "2025-01": {
        "current": 420000,
        "prev": 350000,
        "yoy_growth": "20.00"
      },
      "2025-02": {
        "current": 480000,
        "prev": 380000,
        "yoy_growth": "26.32"
      },
      "2025-03": {
        "current": 510000,
        "prev": 410000,
        "yoy_growth": "24.39"
      },
      "2025-04": {
        "current": 390000,
        "prev": 360000,
        "yoy_growth": "8.33"
      },
      "2025-05": {
        "current": 550000,
        "prev": 420000,
        "yoy_growth": "30.95"
      },
      "2025-06": {
        "current": 620000,
        "prev": 480000,
        "yoy_growth": "29.17"
      }
    },
    "gross_revenue_quarterly": {
      "Q1-2025": {
        "current": 1410000,
        "prev_year": 1140000,
        "yy_growth": "23.68"
      },
      "Q2-2025": {
        "current": 1560000,
        "prev_year": 1260000,
        "yy_growth": "23.81"
      }
    },
    "net_revenue": {
      "2025-01": {
        "current": 378000,
        "prev": 315000,
        "yoy_growth": "20.00"
      },
      "2025-02": {
        "current": 432000,
        "prev": 342000,
        "yoy_growth": "26.32"
      },
      "2025-03": {
        "current": 459000,
        "prev": 369000,
        "yoy_growth": "24.39"
      },
      "2025-04": {
        "current": 351000,
        "prev": 324000,
        "yoy_growth": "8.33"
      },
      "2025-05": {
        "current": 495000,
        "prev": 378000,
        "yoy_growth": "30.95"
      },
      "2025-06": {
        "current": 558000,
        "prev": 432000,
        "yoy_growth": "29.17"
      }
    },
    "net_revenue_quarterly": {
      "Q1-2025": {
        "current": 1269000,
        "prev_year": 1026000,
        "yy_growth": "23.68"
      },
      "Q2-2025": {
        "current": 1404000,
        "prev_year": 1134000,
        "yy_growth": "23.81"
      }
    },
    "gross_summary": {
      "total": 2970000,
      "total_prev": 2400000,
      "yoy_growth": "23.75"
    },
    "net_summary": {
      "total": 2673000,
      "total_prev": 2160000,
      "yoy_growth": "23.75"
    },
    "top_country_net": {
      "by_month": {
        "2025-01": {
          "US": 210000,
          "GB": 85000,
          "DE": 42000
        },
        "2025-02": {
          "US": 240000,
          "GB": 95000,
          "DE": 48000
        }
      },
      "by_countries": {
        "US": 1500000,
        "GB": 580000,
        "DE": 310000,
        "CA": 180000,
        "AU": 103000
      }
    },
    "top_country_gross": {
      "by_month": {
        "2025-01": {
          "US": 233000,
          "GB": 94000,
          "DE": 47000
        },
        "2025-02": {
          "US": 267000,
          "GB": 106000,
          "DE": 53000
        }
      },
      "by_countries": {
        "US": 1667000,
        "GB": 644000,
        "DE": 344000,
        "CA": 200000,
        "AU": 115000
      }
    }
  }
}
```



---

## GET `/reports/get-recent-activities`

**GET Get Recent Activities**

Retrieve the 10 most recent activity log entries, optionally filtered by time period.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `groupKey` | string | no | Time filter for activities. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `recentActivities` (array<object>) — List of recent activity log entries
    - `title` (string) — Activity title
    - `content` (string) — Activity description
    - `created_at` (string) — Activity timestamp
    - `created_by` (integer) — User ID who performed the action
    - `module_name` (string) — Module name (e.g., orders)
    - `module_id` (integer) — Related module entity ID

  Example:

```json
{
  "recentActivities": [
    {
      "title": "Order completed",
      "content": "Order #INV-342 marked as completed",
      "created_at": "2025-09-20 14:25:30",
      "created_by": 1,
      "module_name": "orders",
      "module_id": 342
    },
    {
      "title": "New subscription",
      "content": "Sarah Johnson subscribed to Developer Toolkit Pro (Business License - Annual)",
      "created_at": "2025-09-20 14:25:00",
      "created_by": 0,
      "module_name": "subscriptions",
      "module_id": 89
    },
    {
      "title": "Payment received",
      "content": "$106.92 received via Stripe for order #INV-342",
      "created_at": "2025-09-20 14:24:50",
      "created_by": 0,
      "module_name": "transactions",
      "module_id": 415
    },
    {
      "title": "Refund processed",
      "content": "Refund of $49.00 issued for order #INV-338",
      "created_at": "2025-09-20 11:15:00",
      "created_by": 1,
      "module_name": "orders",
      "module_id": 338
    },
    {
      "title": "Order created",
      "content": "New order #INV-341 placed by Mike Chen",
      "created_at": "2025-09-20 11:10:00",
      "created_by": 0,
      "module_name": "orders",
      "module_id": 341
    },
    {
      "title": "Subscription renewed",
      "content": "Subscription #75 renewed successfully for $99.00",
      "created_at": "2025-09-20 09:00:00",
      "created_by": 0,
      "module_name": "subscriptions",
      "module_id": 75
    },
    {
      "title": "Coupon applied",
      "content": "Coupon FALL25 applied to order #INV-340",
      "created_at": "2025-09-19 16:45:00",
      "created_by": 0,
      "module_name": "orders",
      "module_id": 340
    },
    {
      "title": "License activated",
      "content": "License key activated for Developer Toolkit Pro by Emily Wilson",
      "created_at": "2025-09-19 15:30:00",
      "created_by": 0,
      "module_name": "licenses",
      "module_id": 210
    },
    {
      "title": "Subscription canceled",
      "content": "Subscription #62 canceled by customer request",
      "created_at": "2025-09-19 12:00:00",
      "created_by": 0,
      "module_name": "subscriptions",
      "module_id": 62
    },
    {
      "title": "Order created",
      "content": "New order #INV-340 placed by Emily Wilson",
      "created_at": "2025-09-19 11:45:00",
      "created_by": 0,
      "module_name": "orders",
      "module_id": 340
    }
  ]
}
```



---

## GET `/reports/get-recent-orders`

**GET Get Recent Orders**

Retrieve the 10 most recent orders for the dashboard with basic customer and order information.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `recentOrders` (array<object>) — List of 10 most recent orders
    - `id` (integer) — Order ID
    - `customer_id` (integer) — Customer ID
    - `customer_name` (string) — Customer name
    - `total_amount` (number) — Total amount in decimal (dollars)
    - `created_at` (string) — Order creation timestamp
    - `order_items_count` (integer) — Number of items in the order

  Example:

```json
{
  "recentOrders": [
    {
      "id": 342,
      "customer_id": 105,
      "customer_name": "Sarah Johnson",
      "total_amount": 106.92,
      "created_at": "2025-09-20 14:25:00",
      "order_items_count": 2
    },
    {
      "id": 341,
      "customer_id": 98,
      "customer_name": "Mike Chen",
      "total_amount": 49,
      "created_at": "2025-09-20 11:10:00",
      "order_items_count": 1
    },
    {
      "id": 340,
      "customer_id": 112,
      "customer_name": "Emily Wilson",
      "total_amount": 199,
      "created_at": "2025-09-19 16:45:00",
      "order_items_count": 3
    },
    {
      "id": 339,
      "customer_id": 87,
      "customer_name": "James Rodriguez",
      "total_amount": 29,
      "created_at": "2025-09-19 14:20:00",
      "order_items_count": 1
    },
    {
      "id": 338,
      "customer_id": 42,
      "customer_name": "Lisa Anderson",
      "total_amount": 149,
      "created_at": "2025-09-19 10:05:00",
      "order_items_count": 2
    },
    {
      "id": 337,
      "customer_id": 73,
      "customer_name": "David Kim",
      "total_amount": 99,
      "created_at": "2025-09-18 16:30:00",
      "order_items_count": 1
    },
    {
      "id": 336,
      "customer_id": 156,
      "customer_name": "Anna Schmidt",
      "total_amount": 248,
      "created_at": "2025-09-18 12:15:00",
      "order_items_count": 4
    },
    {
      "id": 335,
      "customer_id": 91,
      "customer_name": "Robert Taylor",
      "total_amount": 49,
      "created_at": "2025-09-18 09:45:00",
      "order_items_count": 1
    },
    {
      "id": 334,
      "customer_id": 128,
      "customer_name": "Maria Garcia",
      "total_amount": 99,
      "created_at": "2025-09-17 15:50:00",
      "order_items_count": 1
    },
    {
      "id": 333,
      "customer_id": 64,
      "customer_name": "Thomas Brown",
      "total_amount": 178,
      "created_at": "2025-09-17 11:20:00",
      "order_items_count": 2
    }
  ]
}
```



---

## GET `/reports/revenue`

**GET Get Revenue Data**

Retrieve detailed revenue data grouped by the specified interval, with optional comparison against a prior period. Includes summary totals, period-over-period fluctuations, and the applied group key.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `revenueReport` (array<object>) — Revenue data grouped by interval
    - _(object)_
  - `summary` (object) — Summary totals for the period
    - _(object)_
  - `previousSummary` (object) — Summary totals for the comparison period
    - _(object)_
  - `fluctuations` (object) — Period-over-period fluctuation data
    - _(object)_
  - `previousMetrics` (array<object>) — Comparison period metrics
    - _(object)_
  - `appliedGroupKey` (string) — The grouping key that was applied

  Example:

```json
{
  "revenueReport": [
    {
      "year": "2025",
      "group": "2025-01",
      "gross_revenue": 420000,
      "net_revenue": 378000,
      "orders": 45
    },
    {
      "year": "2025",
      "group": "2025-02",
      "gross_revenue": 480000,
      "net_revenue": 432000,
      "orders": 52
    },
    {
      "year": "2025",
      "group": "2025-03",
      "gross_revenue": 510000,
      "net_revenue": 459000,
      "orders": 48
    },
    {
      "year": "2025",
      "group": "2025-04",
      "gross_revenue": 390000,
      "net_revenue": 351000,
      "orders": 40
    },
    {
      "year": "2025",
      "group": "2025-05",
      "gross_revenue": 550000,
      "net_revenue": 495000,
      "orders": 58
    },
    {
      "year": "2025",
      "group": "2025-06",
      "gross_revenue": 620000,
      "net_revenue": 558000,
      "orders": 65
    }
  ],
  "summary": {
    "gross_revenue": 2970000,
    "net_revenue": 2673000,
    "total_orders": 308,
    "total_items_sold": 756,
    "total_tax": 185000,
    "total_shipping": 52000,
    "total_discounts": 60000
  },
  "previousSummary": {
    "gross_revenue": 2400000,
    "net_revenue": 2160000,
    "total_orders": 260,
    "total_items_sold": 640
  },
  "fluctuations": {
    "gross_revenue": {
      "value": 23.75,
      "direction": "up"
    },
    "net_revenue": {
      "value": 23.75,
      "direction": "up"
    },
    "total_orders": {
      "value": 18.46,
      "direction": "up"
    }
  },
  "previousMetrics": [
    {
      "year": "2024",
      "group": "2024-07",
      "gross_revenue": 350000,
      "net_revenue": 315000,
      "orders": 38
    },
    {
      "year": "2024",
      "group": "2024-08",
      "gross_revenue": 380000,
      "net_revenue": 342000,
      "orders": 42
    },
    {
      "year": "2024",
      "group": "2024-09",
      "gross_revenue": 410000,
      "net_revenue": 369000,
      "orders": 45
    }
  ],
  "appliedGroupKey": "monthly"
}
```



---

## GET `/reports/item-count-distribution`

**GET Get Item Count Distribution**

Retrieve the distribution of orders by the number of items per order (e.g., how many orders have 1 item, 2 items, etc.).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (array<object>) — Item count distribution data
    - _(object)_

  Example:

```json
{
  "data": [
    {
      "item_count": 1,
      "order_count": 185,
      "percentage": 54.1
    },
    {
      "item_count": 2,
      "order_count": 98,
      "percentage": 28.7
    },
    {
      "item_count": 3,
      "order_count": 38,
      "percentage": 11.1
    },
    {
      "item_count": 4,
      "order_count": 15,
      "percentage": 4.4
    },
    {
      "item_count": "5+",
      "order_count": 6,
      "percentage": 1.7
    }
  ]
}
```



---

## GET `/reports/license-chart`

**GET Get License Line Chart**

Retrieve license creation/activation data as time-series chart data, grouped by the specified interval.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[paymentStatus]` | string | no | Payment status filter. |
| `params[orderStatus]` | string | no | Order status filter. |
| `params[currency]` | string | no | Currency code filter. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[orderTypes]` | array<string> | no | Order type filter. |
| `params[groupKey]` | string | no | Time grouping interval. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "labels": [
    "2025-01",
    "2025-02",
    "2025-03",
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09"
  ],
  "datasets": [
    {
      "label": "Licenses Issued",
      "data": [
        18,
        22,
        28,
        24,
        32,
        30,
        35,
        29,
        38
      ]
    },
    {
      "label": "Activations",
      "data": [
        25,
        30,
        38,
        35,
        45,
        42,
        50,
        40,
        52
      ]
    }
  ],
  "summary": {
    "total_licenses_issued": 256,
    "total_activations": 357
  }
}
```



---

## GET `/reports/license-pie-chart`

**GET Get License Pie Chart**

Retrieve license distribution data suitable for pie/donut chart visualization (e.g., active vs expired vs revoked).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[paymentStatus]` | string | no | Payment status filter. |
| `params[orderStatus]` | string | no | Order status filter. |
| `params[currency]` | string | no | Currency code filter. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[orderTypes]` | array<string> | no | Order type filter. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "distribution": [
    {
      "label": "Active",
      "value": 198,
      "percentage": 80.8,
      "color": "#67C23A"
    },
    {
      "label": "Expired",
      "value": 32,
      "percentage": 13.1,
      "color": "#E6A23C"
    },
    {
      "label": "Revoked",
      "value": 15,
      "percentage": 6.1,
      "color": "#F56C6C"
    }
  ],
  "total_licenses": 245
}
```



---

## GET `/reports/license-summary`

**GET Get License Summary**

Retrieve summary statistics for licenses (total issued, active, expired, revoked, etc.) within the specified date range.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[paymentStatus]` | string | no | Payment status filter. |
| `params[orderStatus]` | string | no | Order status filter. |
| `params[currency]` | string | no | Currency code filter. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[orderTypes]` | array<string> | no | Order type filter. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "total_licenses": 245,
  "active_licenses": 198,
  "expired_licenses": 32,
  "revoked_licenses": 15,
  "total_activations": 412,
  "average_activations_per_license": 1.68,
  "activation_limit_reached": 24
}
```



---

## GET `/reports/order-chart`

**GET Get Order Chart**

Retrieve order count and statistics as time-series chart data, with optional comparison against a prior period. Includes summary totals and fluctuation calculations.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `orderChartData` (array<object>) — Time-series order chart data
    - _(object)_
  - `summary` (object) — Summary totals
    - _(object)_
  - `previousSummary` (object) — Comparison period summary
    - _(object)_
  - `fluctuations` (object) — Fluctuation data
    - _(object)_

  Example:

```json
{
  "orderChartData": [
    {
      "year": "2025",
      "group": "2025-09-14",
      "orders": 12
    },
    {
      "year": "2025",
      "group": "2025-09-15",
      "orders": 18
    },
    {
      "year": "2025",
      "group": "2025-09-16",
      "orders": 8
    },
    {
      "year": "2025",
      "group": "2025-09-17",
      "orders": 22
    },
    {
      "year": "2025",
      "group": "2025-09-18",
      "orders": 15
    },
    {
      "year": "2025",
      "group": "2025-09-19",
      "orders": 19
    },
    {
      "year": "2025",
      "group": "2025-09-20",
      "orders": 14
    }
  ],
  "summary": {
    "total_orders": 342,
    "average_orders_per_day": 16
  },
  "previousSummary": {
    "total_orders": 289,
    "average_orders_per_day": 14
  },
  "fluctuations": {
    "total_orders": {
      "value": 18.3,
      "direction": "up"
    },
    "average_orders_per_day": {
      "value": 14.3,
      "direction": "up"
    }
  }
}
```



---

## GET `/reports/order-completion-time`

**GET Get Order Completion Time**

Retrieve statistics on how long orders take to be completed (time between creation and completion).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Order completion time statistics
    - _(object)_

  Example:

```json
{
  "data": {
    "average_hours": 2.4,
    "median_hours": 1.2,
    "min_hours": 0.01,
    "max_hours": 72.5,
    "distribution": [
      {
        "range": "< 1 hour",
        "count": 145,
        "percentage": 42.4
      },
      {
        "range": "1-6 hours",
        "count": 120,
        "percentage": 35.1
      },
      {
        "range": "6-24 hours",
        "count": 52,
        "percentage": 15.2
      },
      {
        "range": "1-3 days",
        "count": 20,
        "percentage": 5.8
      },
      {
        "range": "3+ days",
        "count": 5,
        "percentage": 1.5
      }
    ],
    "total_completed": 342
  }
}
```



---

## GET `/reports/order-value-distribution`

**GET Get Order Value Distribution**

Retrieve the distribution of orders by their total value, showing how orders are spread across different price ranges.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (array<object>) — Order value distribution data
    - _(object)_

  Example:

```json
{
  "data": [
    {
      "label": "$0-$25",
      "count": 28,
      "percentage": 8.2
    },
    {
      "label": "$25-$50",
      "count": 82,
      "percentage": 24
    },
    {
      "label": "$50-$100",
      "count": 120,
      "percentage": 35.1
    },
    {
      "label": "$100-$200",
      "count": 78,
      "percentage": 22.8
    },
    {
      "label": "$200-$500",
      "count": 28,
      "percentage": 8.2
    },
    {
      "label": "$500+",
      "count": 6,
      "percentage": 1.7
    }
  ]
}
```



---

## GET `/reports/product-performance`

**GET Get Product Performance**

Retrieve a ranked performance chart of top-performing products within the specified date range.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `productPerformance` (array<object>) — Ranked product performance data
    - _(object)_

  Example:

```json
{
  "productPerformance": [
    {
      "product_id": 123,
      "title": "Developer Toolkit Pro",
      "orders": 142,
      "revenue": 680000,
      "items_sold": 142,
      "refunds": 3,
      "refund_amount": 15000
    },
    {
      "product_id": 125,
      "title": "API Testing Suite",
      "orders": 98,
      "revenue": 290000,
      "items_sold": 98,
      "refunds": 2,
      "refund_amount": 9800
    },
    {
      "product_id": 130,
      "title": "WordPress starter theme",
      "orders": 76,
      "revenue": 152000,
      "items_sold": 76,
      "refunds": 1,
      "refund_amount": 2000
    },
    {
      "product_id": 128,
      "title": "Cloud Hosting Add-on",
      "orders": 65,
      "revenue": 97500,
      "items_sold": 65,
      "refunds": 0,
      "refund_amount": 0
    },
    {
      "product_id": 135,
      "title": "Premium Support Package",
      "orders": 42,
      "revenue": 626000,
      "items_sold": 42,
      "refunds": 2,
      "refund_amount": 29800
    }
  ]
}
```



---

## GET `/reports/product-report`

**GET Get Product Report**

Retrieve product-level report data as time-series chart data with summary statistics. Supports comparison against a prior period with fluctuation calculations.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `summary` (object) — Product report summary
    - _(object)_
  - `previousSummary` (object) — Comparison period summary
    - _(object)_
  - `fluctuations` (object) — Fluctuation data
    - _(object)_
  - `currentMetrics` (array<object>) — Current period metrics
    - _(object)_
  - `previousMetrics` (array<object>) — Comparison period metrics
    - _(object)_

  Example:

```json
{
  "summary": {
    "total_products_sold": 856,
    "total_revenue": 2970000,
    "unique_products": 25
  },
  "previousSummary": {
    "total_products_sold": 720,
    "total_revenue": 2400000,
    "unique_products": 22
  },
  "fluctuations": {
    "total_products_sold": {
      "value": 18.9,
      "direction": "up"
    },
    "total_revenue": {
      "value": 23.75,
      "direction": "up"
    }
  },
  "currentMetrics": [
    {
      "year": "2025",
      "group": "2025-01",
      "products_sold": 120,
      "revenue": 420000
    },
    {
      "year": "2025",
      "group": "2025-02",
      "products_sold": 138,
      "revenue": 480000
    },
    {
      "year": "2025",
      "group": "2025-03",
      "products_sold": 145,
      "revenue": 510000
    },
    {
      "year": "2025",
      "group": "2025-04",
      "products_sold": 110,
      "revenue": 390000
    },
    {
      "year": "2025",
      "group": "2025-05",
      "products_sold": 162,
      "revenue": 550000
    },
    {
      "year": "2025",
      "group": "2025-06",
      "products_sold": 181,
      "revenue": 620000
    }
  ],
  "previousMetrics": [
    {
      "year": "2024",
      "group": "2024-07",
      "products_sold": 105,
      "revenue": 350000
    },
    {
      "year": "2024",
      "group": "2024-08",
      "products_sold": 115,
      "revenue": 380000
    },
    {
      "year": "2024",
      "group": "2024-09",
      "products_sold": 125,
      "revenue": 410000
    }
  ]
}
```



---

## GET `/reports/quick-order-stats`

**GET Get Quick Order Stats**

Retrieve quick summary statistics for orders within a specified range, with automatic comparison against the equivalent prior period.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `day_range` | string | no | Date range shortcut. Accepts relative date strings, this_month, or all_time. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `stats` (object) — Order statistics
    - _(object)_
  - `from_date` (string) — Start of the queried date range
  - `to_date` (string) — End of the queried date range

  Example:

```json
{
  "stats": {
    "total_orders": 18,
    "total_revenue": 125000,
    "average_order_value": 6944,
    "total_items_sold": 42,
    "compare_total_orders": 15,
    "compare_total_revenue": 108000,
    "compare_average_order_value": 7200
  },
  "from_date": "2025-09-01 00:00:00",
  "to_date": "2025-09-20 23:59:59"
}
```



---

## GET `/reports/refund-chart`

**GET Get Refund Chart**

Retrieve refund data as time-series chart data with summary totals. Supports comparison against a prior period with fluctuation calculations.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `summary` (object) — Refund summary totals
    - _(object)_
  - `previousSummary` (object) — Comparison period summary
    - _(object)_
  - `chartData` (array<object>) — Time-series refund chart data
    - _(object)_
  - `fluctuations` (object) — Fluctuation data
    - _(object)_
  - `previousMetrics` (array<object>) — Comparison period metrics
    - _(object)_

  Example:

```json
{
  "summary": {
    "total_refunds": 8,
    "total_refund_amount": 70000,
    "average_refund": 8750,
    "refund_rate": 2.3
  },
  "previousSummary": {
    "total_refunds": 6,
    "total_refund_amount": 52000,
    "average_refund": 8667,
    "refund_rate": 2.1
  },
  "chartData": [
    {
      "year": "2025",
      "group": "2025-01",
      "refund_count": 1,
      "refund_amount": 9900
    },
    {
      "year": "2025",
      "group": "2025-02",
      "refund_count": 2,
      "refund_amount": 14800
    },
    {
      "year": "2025",
      "group": "2025-03",
      "refund_count": 0,
      "refund_amount": 0
    },
    {
      "year": "2025",
      "group": "2025-04",
      "refund_count": 1,
      "refund_amount": 4900
    },
    {
      "year": "2025",
      "group": "2025-05",
      "refund_count": 2,
      "refund_amount": 19800
    },
    {
      "year": "2025",
      "group": "2025-06",
      "refund_count": 2,
      "refund_amount": 20600
    }
  ],
  "fluctuations": {
    "total_refunds": {
      "value": 33.3,
      "direction": "up"
    },
    "total_refund_amount": {
      "value": 34.6,
      "direction": "up"
    }
  },
  "previousMetrics": [
    {
      "year": "2024",
      "group": "2024-07",
      "refund_count": 1,
      "refund_amount": 8500
    },
    {
      "year": "2024",
      "group": "2024-08",
      "refund_count": 2,
      "refund_amount": 15000
    },
    {
      "year": "2024",
      "group": "2024-09",
      "refund_count": 3,
      "refund_amount": 28500
    }
  ]
}
```



---

## GET `/reports/refund-data-by-group`

**GET Get Refund Data by Group**

Retrieve refund data broken down by a grouping dimension (e.g., payment method, country).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Refund data grouped by the specified dimension
    - _(object)_

  Example:

```json
{
  "data": {
    "by_payment_method": [
      {
        "label": "Stripe",
        "refund_count": 5,
        "refund_amount": 48000
      },
      {
        "label": "PayPal",
        "refund_count": 2,
        "refund_amount": 15000
      },
      {
        "label": "Cash on Delivery",
        "refund_count": 1,
        "refund_amount": 7000
      }
    ],
    "by_reason": [
      {
        "label": "Product not as expected",
        "count": 3,
        "amount": 28000
      },
      {
        "label": "Duplicate purchase",
        "count": 2,
        "amount": 18000
      },
      {
        "label": "Technical issues",
        "count": 2,
        "amount": 16000
      },
      {
        "label": "Other",
        "count": 1,
        "amount": 8000
      }
    ]
  }
}
```



---

## GET `/reports/report-overview`

**GET Get Report Overview**

Retrieve an aggregated report overview including order summary statistics and breakdowns by payment method.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[created_at]` | object | no | Date filter with column, operator, and value keys. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Aggregated report data
    - _(object)_
  - `orders_by_payment_method` (object) — Order breakdown by payment method
    - _(object)_

  Example:

```json
{
  "data": {
    "total_orders": 342,
    "total_revenue": 1250000,
    "net_revenue": 1180000,
    "total_tax": 95000,
    "total_shipping": 35000,
    "total_discounts": 42000,
    "total_refunds": 70000,
    "average_order_value": 3655,
    "total_customers": 215
  },
  "orders_by_payment_method": {
    "stripe": {
      "count": 230,
      "revenue": 850000,
      "percentage": 67.3
    },
    "paypal": {
      "count": 95,
      "revenue": 320000,
      "percentage": 27.8
    },
    "cod": {
      "count": 17,
      "revenue": 80000,
      "percentage": 4.9
    }
  }
}
```



---

## GET `/reports/retention-chart`

**GET Get Retention Chart**

Retrieve subscription retention data as chart data, showing how many subscribers remain active over time.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[customDays]` | integer | no | Custom number of days for the retention period. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `chartData` (object) — Retention chart data
    - _(object)_

  Example:

```json
{
  "chartData": {
    "labels": [
      "Month 1",
      "Month 2",
      "Month 3",
      "Month 4",
      "Month 5",
      "Month 6",
      "Month 7",
      "Month 8",
      "Month 9",
      "Month 10",
      "Month 11",
      "Month 12"
    ],
    "data": [
      100,
      92,
      87,
      83,
      80,
      78,
      76,
      74,
      73,
      72,
      71,
      70
    ],
    "total_initial_subscribers": 183,
    "current_active": 128
  }
}
```



---

## GET `/reports/retention-snapshots/status`

**GET Check Retention Snapshot Status**

Check the status of a previously queued retention snapshot generation job.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[job_id]` | integer | yes | The job ID returned from the retention-snapshots/generate endpoint. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `success` (boolean) — Whether the lookup was successful
  - `status` (string) _(enum: `running`, `completed`)_ — Job status
  - `message` (string) — Status message
  - `data` (object) — Job details
    - _(object)_

  Example:

```json
{
  "success": true,
  "status": "running",
  "message": "Job is still running",
  "data": {
    "status": "pending",
    "started_at": "2025-06-15 14:30:00",
    "product_id": 42
  }
}
```



---

## GET `/reports/revenue-by-group`

**GET Get Revenue by Group**

Retrieve revenue data broken down by a specific grouping dimension (e.g., payment method, billing country).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object) — Revenue data grouped by the specified dimension
    - _(object)_

  Example:

```json
{
  "data": {
    "by_payment_method": [
      {
        "label": "Stripe",
        "value": 850000,
        "count": 230,
        "percentage": 68
      },
      {
        "label": "PayPal",
        "value": 320000,
        "count": 95,
        "percentage": 25.6
      },
      {
        "label": "Cash on Delivery",
        "value": 80000,
        "count": 17,
        "percentage": 6.4
      }
    ],
    "by_billing_country": [
      {
        "label": "US",
        "value": 680000,
        "count": 120,
        "percentage": 54.4
      },
      {
        "label": "GB",
        "value": 195000,
        "count": 35,
        "percentage": 15.6
      },
      {
        "label": "DE",
        "value": 118000,
        "count": 22,
        "percentage": 9.4
      },
      {
        "label": "CA",
        "value": 95000,
        "count": 18,
        "percentage": 7.6
      },
      {
        "label": "AU",
        "value": 62000,
        "count": 12,
        "percentage": 5
      }
    ]
  }
}
```



---

## GET `/reports/sales-growth`

**GET Get Sales Growth**

Retrieve sales growth data over a specified period. Filters to orders with successful payment and order statuses.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `start_date` | string | no | Start date. Defaults to the earliest order date. |
| `end_date` | string | no | End date. Defaults to the latest order date. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `sales_data` (object) — Sales growth data
    - _(object)_

  Example:

```json
{
  "sales_data": {
    "current_period": {
      "total_revenue": 1250000,
      "total_orders": 342,
      "average_order_value": 3655
    },
    "previous_period": {
      "total_revenue": 1050000,
      "total_orders": 289,
      "average_order_value": 3633
    },
    "growth": {
      "revenue_growth": 19.05,
      "orders_growth": 18.34,
      "aov_growth": 0.61
    },
    "monthly": [
      {
        "month": "2025-01",
        "revenue": 420000,
        "orders": 45
      },
      {
        "month": "2025-02",
        "revenue": 480000,
        "orders": 52
      },
      {
        "month": "2025-03",
        "revenue": 510000,
        "orders": 48
      },
      {
        "month": "2025-04",
        "revenue": 390000,
        "orders": 40
      },
      {
        "month": "2025-05",
        "revenue": 550000,
        "orders": 58
      },
      {
        "month": "2025-06",
        "revenue": 620000,
        "orders": 65
      }
    ]
  }
}
```



---

## GET `/reports/sales-growth-chart`

**GET Get Sales Growth Chart**

Retrieve time-series chart data for sales growth on the dashboard, showing order counts and net revenue grouped by the specified interval.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[orderStatus]` | array<string> | no | Order status filter. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `salesGrowthChart` (array<object>) — Time-series sales growth data. Note: net_revenue values are in decimal (dollars), not cents.
    - _(object)_

  Example:

```json
{
  "salesGrowthChart": [
    {
      "year": "2025",
      "group": "2025-01",
      "orders": 45,
      "net_revenue": 3780
    },
    {
      "year": "2025",
      "group": "2025-02",
      "orders": 52,
      "net_revenue": 4320
    },
    {
      "year": "2025",
      "group": "2025-03",
      "orders": 48,
      "net_revenue": 4590
    },
    {
      "year": "2025",
      "group": "2025-04",
      "orders": 40,
      "net_revenue": 3510
    },
    {
      "year": "2025",
      "group": "2025-05",
      "orders": 58,
      "net_revenue": 4950
    },
    {
      "year": "2025",
      "group": "2025-06",
      "orders": 65,
      "net_revenue": 5580
    },
    {
      "year": "2025",
      "group": "2025-07",
      "orders": 55,
      "net_revenue": 4800
    },
    {
      "year": "2025",
      "group": "2025-08",
      "orders": 62,
      "net_revenue": 5250
    },
    {
      "year": "2025",
      "group": "2025-09",
      "orders": 48,
      "net_revenue": 4200
    }
  ]
}
```



---

## GET `/reports/sales-report`

**GET Get Sales Report**

Retrieve comprehensive sales report data with multiple graph metrics (revenue, orders, items, etc.) broken down by the specified time interval. Supports comparison against a prior period with fluctuation calculations.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `graphs` (object) — Graph data for multiple metrics
    - _(object)_
  - `summaryData` (object) — Summary data for the period
    - _(object)_
  - `previousSummary` (object) — Comparison period summary
    - _(object)_
  - `fluctuations` (object) — Fluctuation data
    - _(object)_

  Example:

```json
{
  "graphs": {
    "gross_revenue": [
      {
        "year": "2025",
        "group": "2025-01",
        "value": 420000
      },
      {
        "year": "2025",
        "group": "2025-02",
        "value": 480000
      },
      {
        "year": "2025",
        "group": "2025-03",
        "value": 510000
      }
    ],
    "net_revenue": [
      {
        "year": "2025",
        "group": "2025-01",
        "value": 378000
      },
      {
        "year": "2025",
        "group": "2025-02",
        "value": 432000
      },
      {
        "year": "2025",
        "group": "2025-03",
        "value": 459000
      }
    ],
    "orders": [
      {
        "year": "2025",
        "group": "2025-01",
        "value": 45
      },
      {
        "year": "2025",
        "group": "2025-02",
        "value": 52
      },
      {
        "year": "2025",
        "group": "2025-03",
        "value": 48
      }
    ],
    "items_sold": [
      {
        "year": "2025",
        "group": "2025-01",
        "value": 120
      },
      {
        "year": "2025",
        "group": "2025-02",
        "value": 138
      },
      {
        "year": "2025",
        "group": "2025-03",
        "value": 145
      }
    ]
  },
  "summaryData": {
    "gross_revenue": 2970000,
    "net_revenue": 2673000,
    "total_orders": 342,
    "items_sold": 856,
    "tax_collected": 185000,
    "shipping_collected": 52000,
    "discounts": 60000,
    "refunds": 70000
  },
  "previousSummary": {
    "gross_revenue": 2400000,
    "net_revenue": 2160000,
    "total_orders": 289,
    "items_sold": 720
  },
  "fluctuations": {
    "gross_revenue": {
      "value": 23.75,
      "direction": "up"
    },
    "net_revenue": {
      "value": 23.75,
      "direction": "up"
    },
    "total_orders": {
      "value": 18.34,
      "direction": "up"
    },
    "items_sold": {
      "value": 18.89,
      "direction": "up"
    }
  }
}
```



---

## GET `/reports/search-repeat-customer`

**GET Search Repeat Customers**

Search and paginate through customers who have made multiple purchases.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[per_page]` | integer | no | Number of results per page. |
| `params[current_page]` | integer | no | Current page number. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `repeat_customers` (object) — Paginated repeat customer data
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `data` (array<object>)
      - _(object)_

  Example:

```json
{
  "repeat_customers": {
    "total": 183,
    "per_page": 15,
    "current_page": 1,
    "data": [
      {
        "customer_id": 42,
        "customer_name": "Sarah Johnson",
        "email": "sarah@example.com",
        "order_count": 12,
        "total_spent": 128500,
        "first_order": "2024-03-15",
        "last_order": "2025-09-20"
      },
      {
        "customer_id": 73,
        "customer_name": "Mike Chen",
        "email": "mike@example.com",
        "order_count": 8,
        "total_spent": 89200,
        "first_order": "2024-05-22",
        "last_order": "2025-09-18"
      },
      {
        "customer_id": 91,
        "customer_name": "Emily Wilson",
        "email": "emily@example.com",
        "order_count": 6,
        "total_spent": 72000,
        "first_order": "2024-07-10",
        "last_order": "2025-09-15"
      },
      {
        "customer_id": 28,
        "customer_name": "David Kim",
        "email": "david@example.com",
        "order_count": 5,
        "total_spent": 58900,
        "first_order": "2024-02-28",
        "last_order": "2025-08-30"
      },
      {
        "customer_id": 156,
        "customer_name": "Lisa Anderson",
        "email": "lisa@example.com",
        "order_count": 5,
        "total_spent": 45000,
        "first_order": "2024-09-05",
        "last_order": "2025-09-12"
      }
    ]
  }
}
```



---

## GET `/reports/sources`

**GET Get Source Report**

Retrieve order source/attribution data showing where orders originated from. Supports comparison against a prior period with fluctuation calculations.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `sourceReportData` (object) — Source attribution data
    - _(object)_
  - `fluctuations` (object) — Fluctuation data
    - _(object)_

  Example:

```json
{
  "sourceReportData": {
    "sources": [
      {
        "source": "direct",
        "orders": 150,
        "revenue": 720000,
        "percentage": 43.9
      },
      {
        "source": "google",
        "orders": 95,
        "revenue": 450000,
        "percentage": 27.8
      },
      {
        "source": "referral",
        "orders": 55,
        "revenue": 280000,
        "percentage": 16.1
      },
      {
        "source": "social",
        "orders": 42,
        "revenue": 180000,
        "percentage": 12.3
      }
    ],
    "total_orders": 342,
    "total_revenue": 1630000
  },
  "fluctuations": {
    "direct": {
      "value": 12.5,
      "direction": "up"
    },
    "google": {
      "value": 8.2,
      "direction": "up"
    },
    "referral": {
      "value": 22.4,
      "direction": "up"
    },
    "social": {
      "value": -5.1,
      "direction": "down"
    }
  }
}
```



---

## GET `/reports/subscription-chart`

**GET Get Subscription Chart**

Retrieve subscription data as time-series chart data, including total subscription counts and future installment projections. Supports comparison against a prior period.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[subscriptionType]` | string | no | Subscription type filter. Defaults to subscription. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `currentMetrics` (array<object>) — Current period subscription metrics
    - _(object)_
  - `compareMetrics` (array<object>) — Comparison period metrics
    - _(object)_
  - `summary` (object) — Summary with future installments and total subscriptions
    - _(object)_
  - `fluctuations` (array<object>) — Fluctuation data
    - _(object)_

  Example:

```json
{
  "currentMetrics": [
    {
      "year": "2025",
      "group": "2025-01",
      "subscriptions": 12,
      "mrr": 118800
    },
    {
      "year": "2025",
      "group": "2025-02",
      "subscriptions": 15,
      "mrr": 148500
    },
    {
      "year": "2025",
      "group": "2025-03",
      "subscriptions": 18,
      "mrr": 178200
    },
    {
      "year": "2025",
      "group": "2025-04",
      "subscriptions": 14,
      "mrr": 138600
    },
    {
      "year": "2025",
      "group": "2025-05",
      "subscriptions": 22,
      "mrr": 217800
    },
    {
      "year": "2025",
      "group": "2025-06",
      "subscriptions": 19,
      "mrr": 188100
    },
    {
      "year": "2025",
      "group": "2025-07",
      "subscriptions": 25,
      "mrr": 247500
    },
    {
      "year": "2025",
      "group": "2025-08",
      "subscriptions": 20,
      "mrr": 198000
    },
    {
      "year": "2025",
      "group": "2025-09",
      "subscriptions": 28,
      "mrr": 277200
    }
  ],
  "compareMetrics": [
    {
      "year": "2024",
      "group": "2024-01",
      "subscriptions": 8,
      "mrr": 79200
    },
    {
      "year": "2024",
      "group": "2024-02",
      "subscriptions": 10,
      "mrr": 99000
    },
    {
      "year": "2024",
      "group": "2024-03",
      "subscriptions": 12,
      "mrr": 118800
    }
  ],
  "summary": {
    "future_installments": 1138500,
    "total_subscriptions": 183,
    "active_subscriptions": 89,
    "canceled_subscriptions": 25,
    "mrr": 277200
  },
  "fluctuations": [
    {
      "key": "total_subscriptions",
      "value": 28.5,
      "direction": "up"
    },
    {
      "key": "mrr",
      "value": 35.2,
      "direction": "up"
    }
  ]
}
```



---

## GET `/reports/subscription-cohorts`

**GET Get Subscription Cohorts**

Retrieve cohort analysis data for subscriptions. Groups subscribers by their signup period and tracks retention over subsequent periods. Uses pre-generated retention snapshots for efficient querying.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[groupBy]` | string | no | Cohort grouping interval. |
| `params[metric]` | string | no | Metric to track (e.g., subscribers). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "cohorts": [
    {
      "month": "2025-01",
      "initial": 12,
      "month_1": 11,
      "month_2": 10,
      "month_3": 10,
      "month_4": 9,
      "month_5": 9,
      "month_6": 9,
      "retention_rate": 75
    },
    {
      "month": "2025-02",
      "initial": 15,
      "month_1": 14,
      "month_2": 13,
      "month_3": 12,
      "month_4": 12,
      "month_5": 11,
      "retention_rate": 73.3
    },
    {
      "month": "2025-03",
      "initial": 18,
      "month_1": 17,
      "month_2": 16,
      "month_3": 15,
      "month_4": 15,
      "retention_rate": 83.3
    },
    {
      "month": "2025-04",
      "initial": 14,
      "month_1": 13,
      "month_2": 12,
      "month_3": 12,
      "retention_rate": 85.7
    },
    {
      "month": "2025-05",
      "initial": 22,
      "month_1": 21,
      "month_2": 20,
      "retention_rate": 90.9
    },
    {
      "month": "2025-06",
      "initial": 19,
      "month_1": 18,
      "retention_rate": 94.7
    },
    {
      "month": "2025-07",
      "initial": 25,
      "retention_rate": 100
    }
  ],
  "average_retention": {
    "month_1": 94.5,
    "month_2": 91.2,
    "month_3": 87.8,
    "month_4": 85,
    "month_5": 82.5,
    "month_6": 75
  }
}
```



---

## GET `/reports/subscription-retention`

**GET Get Subscription Retention**

Retrieve subscription retention data showing the percentage of subscribers who remain active over successive billing periods.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `retention_data` (object) — Subscription retention data by billing period
    - _(object)_

  Example:

```json
{
  "retention_data": {
    "labels": [
      "Period 1",
      "Period 2",
      "Period 3",
      "Period 4",
      "Period 5",
      "Period 6",
      "Period 7",
      "Period 8",
      "Period 9",
      "Period 10",
      "Period 11",
      "Period 12"
    ],
    "retention_rates": [
      100,
      92,
      87,
      83,
      80,
      78,
      76,
      74,
      73,
      72,
      71,
      70
    ],
    "subscriber_counts": [
      183,
      168,
      159,
      152,
      146,
      143,
      139,
      135,
      134,
      132,
      130,
      128
    ],
    "churn_rates": [
      0,
      8,
      5.4,
      4.6,
      3.6,
      2.5,
      2.6,
      2.6,
      1.4,
      1.4,
      1.4,
      1.4
    ],
    "total_initial_subscribers": 183,
    "current_active": 128,
    "overall_retention_rate": 70
  }
}
```



---

## GET `/reports/top-products-sold`

**GET Get Top Products Sold**

Retrieve a list of top-selling products based on order item data, using the Resource API layer.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `top_products_sold` (array<object>) — List of top-selling products
    - _(object)_

  Example:

```json
{
  "top_products_sold": [
    {
      "product_id": 123,
      "title": "Developer Toolkit Pro",
      "total_sold": 142,
      "total_revenue": 680000,
      "average_price": 4789
    },
    {
      "product_id": 125,
      "title": "API Testing Suite",
      "total_sold": 98,
      "total_revenue": 290000,
      "average_price": 2959
    },
    {
      "product_id": 130,
      "title": "WordPress starter theme",
      "total_sold": 76,
      "total_revenue": 152000,
      "average_price": 2000
    },
    {
      "product_id": 128,
      "title": "Cloud Hosting Add-on",
      "total_sold": 65,
      "total_revenue": 97500,
      "average_price": 1500
    },
    {
      "product_id": 135,
      "title": "Premium Support Package",
      "total_sold": 42,
      "total_revenue": 626000,
      "average_price": 14905
    }
  ]
}
```



---

## GET `/reports/weeks-between-refund`

**GET Get Weeks Between Refund**

Retrieve analysis data showing the distribution of time (in weeks) between order placement and refund request.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |
| `params[groupKey]` | string | no | Grouping interval for data aggregation. |
| `params[currency]` | string | no | Currency code to filter by. |
| `params[filterMode]` | string | no | Payment mode filter. |
| `params[variation_ids]` | array<integer> | no | Array of product variation IDs to filter by. |
| `params[compareType]` | string | no | Comparison period type. |
| `params[compareDate]` | string | no | Custom comparison start date. Required when compareType is custom. |
| `params[paymentStatus]` | array<string> | no | Payment status filter. |
| `params[orderTypes]` | array<string> | no | Order type filter (e.g., one-time, subscription). |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (array<object>) — Weeks-between-refund distribution data
    - _(object)_

  Example:

```json
{
  "data": [
    {
      "weeks": "0-1",
      "count": 3,
      "percentage": 37.5,
      "amount": 28000
    },
    {
      "weeks": "1-2",
      "count": 2,
      "percentage": 25,
      "amount": 18000
    },
    {
      "weeks": "2-4",
      "count": 1,
      "percentage": 12.5,
      "amount": 9900
    },
    {
      "weeks": "4-8",
      "count": 1,
      "percentage": 12.5,
      "amount": 4900
    },
    {
      "weeks": "8+",
      "count": 1,
      "percentage": 12.5,
      "amount": 9200
    }
  ]
}
```



---
