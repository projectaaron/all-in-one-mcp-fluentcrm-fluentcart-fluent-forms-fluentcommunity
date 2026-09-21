# FluentCart API — Reports

43 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## GET `/reports/country-heat-map`

**GET Get Country Heat Map**

Retrieve order counts grouped by billing country for world map / heat map visualization.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/customer-report`

**GET Get Customer Report**

Retrieve customer acquisition and activity data as time-series chart data with summary statistics. Supports comparison against a prior period with fluctuation calculations.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/daily-signups`

**GET Get Daily Signups**

Retrieve daily subscription signup counts over the specified date range.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/dashboard-stats`

**GET Get Dashboard Stats**

Retrieve key dashboard statistics including total orders, paid orders, paid order items, and total paid amounts. Automatically calculates comparison against the equivalent prior period based on the selected date range.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/fetch-new-vs-returning-customer`

**GET Get New vs Returning Customers**

Compare orders from new customers versus returning customers over the given period.

**Access policy:** `ReportPolicy`

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

  - `newVsReturning` (array<NewVsReturningRow>) — Two rows: one for new customers, one for returning customers.

  Example:

```json
{
  "newVsReturning": [
    {
      "customer_type": "new",
      "customer_count": 32,
      "order_count": 38,
      "net_sales": 261500,
      "average_net": 6882,
      "gross_sales": 285000,
      "average_gross": 7500
    },
    {
      "customer_type": "returning",
      "customer_count": 183,
      "order_count": 304,
      "net_sales": 889000,
      "average_net": 2924,
      "gross_sales": 965000,
      "average_gross": 3174
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

## GET `/reports/fetch-order-by-group`

**GET Get Orders by Group**

Retrieve order data broken down by a specified grouping dimension (e.g., payment method, country, payment status).

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/fetch-report-by-day-and-hour`

**GET Get Report by Day and Hour**

Retrieve a heatmap-style report showing order distribution by day of the week and hour of the day.

**Access policy:** `ReportPolicy`

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

  - `orderByDayAndHour` (array<object>) — One row per hour of the day (24 rows), with an order count per day of the week.
    - `hour` (string) — Hour label, e.g. `9 AM`.
    - `Sunday` (integer)
    - `Monday` (integer)
    - `Tuesday` (integer)
    - `Wednesday` (integer)
    - `Thursday` (integer)
    - `Friday` (integer)
    - `Saturday` (integer)
  - `grossSaleByDay` (array<object>) — One row per day of the week (1=Sunday ... 7=Saturday) with gross sale totals.
    - `day` (integer) — Day of week, 1=Sunday through 7=Saturday.
    - `gross_sale` (number) — Gross sale total for the day, in major currency units (e.g. dollars).
    - `order_count` (integer)
  - `grossSaleByHour` (array<object>) — One row per hour of the day (24 rows) with gross sale totals.
    - `hour` (string) — Hour label, e.g. `9 AM`.
    - `gross_sale` (number) — Gross sale total for the hour, in major currency units (e.g. dollars).
    - `order_count` (integer)

  Example:

```json
{
  "orderByDayAndHour": [
    {
      "hour": "9 AM",
      "Sunday": 0,
      "Monday": 18,
      "Tuesday": 12,
      "Wednesday": 15,
      "Thursday": 0,
      "Friday": 0,
      "Saturday": 0
    },
    {
      "hour": "10 AM",
      "Sunday": 0,
      "Monday": 24,
      "Tuesday": 28,
      "Wednesday": 0,
      "Thursday": 25,
      "Friday": 0,
      "Saturday": 0
    },
    {
      "hour": "2 PM",
      "Sunday": 0,
      "Monday": 22,
      "Tuesday": 0,
      "Wednesday": 19,
      "Thursday": 0,
      "Friday": 0,
      "Saturday": 0
    }
  ],
  "grossSaleByDay": [
    {
      "day": 1,
      "gross_sale": 542,
      "order_count": 8
    },
    {
      "day": 2,
      "gross_sale": 1284.5,
      "order_count": 21
    },
    {
      "day": 3,
      "gross_sale": 998,
      "order_count": 16
    }
  ],
  "grossSaleByHour": [
    {
      "hour": "9 AM",
      "gross_sale": 320,
      "order_count": 5
    },
    {
      "hour": "10 AM",
      "gross_sale": 610,
      "order_count": 9
    },
    {
      "hour": "2 PM",
      "gross_sale": 415,
      "order_count": 6
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

## GET `/reports/fetch-report-meta`

**GET Get Report Meta**

Retrieve metadata for the reporting interface, including available currencies, the earliest order date, and store mode.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/fetch-top-sold-products`

**GET Get Top Sold Products**

Retrieve a ranked list of the best-selling products within the specified date range.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/fetch-top-sold-variants`

**GET Get Top Sold Variants**

Retrieve a ranked list of the best-selling product variants within the specified date range.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/future-renewals`

**GET Get Future Renewals**

Retrieve projected future subscription renewal data.

**Access policy:** `ReportPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[startDate]` | string | no | Start date for the report period. |
| `params[endDate]` | string | no | End date for the report period. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `totalProjected` (integer) — Sum of all projected renewal amounts across the period, in cents
  - `totalRenewals` (integer) — Total count of projected renewals across the period
  - `projections` (array<object>) — Renewals and projected revenue grouped by month
    - `group` (string) — Month bucket, formatted Y-m
    - `renewals_count` (integer)
    - `projected_amount` (integer) — Projected renewal amount for this month, in cents
  - `period` (array<string>) — [start, end] datetime strings of the report window
  - `groupBy` (string) — Grouping granularity (currently always "monthly")

  Example:

```json
{
  "totalProjected": 148500,
  "totalRenewals": 15,
  "projections": [
    {
      "group": "2026-08",
      "renewals_count": 5,
      "projected_amount": 49500
    },
    {
      "group": "2026-09",
      "renewals_count": 6,
      "projected_amount": 59400
    },
    {
      "group": "2026-10",
      "renewals_count": 4,
      "projected_amount": 39600
    }
  ],
  "period": [
    "2026-08-17 00:00:00",
    "2026-11-17 23:59:59"
  ],
  "groupBy": "monthly"
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

## POST `/reports/retention-snapshots/generate`

**POST Generate Retention Snapshots**

Trigger generation of retention snapshot data. If Action Scheduler is available, the job runs in the background; otherwise it runs synchronously.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/get-dashboard-summary`

**GET Get Dashboard Summary**

Retrieve a high-level summary of the store including product counts and coupon statistics.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/overview`

**GET Get Revenue Overview**

Retrieve a comprehensive year-over-year revenue overview comparing the last 12 months against the same months in the prior year. Includes monthly breakdowns, quarterly aggregations, and top revenue-generating countries.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/get-recent-activities`

**GET Get Recent Activities**

Retrieve the 10 most recent activity log entries, optionally filtered by time period.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/get-recent-orders`

**GET Get Recent Orders**

Retrieve the 10 most recent orders for the dashboard with basic customer and order information.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/revenue`

**GET Get Revenue Data**

Retrieve detailed revenue data grouped by the specified interval, with optional comparison against a prior period. Includes summary totals, period-over-period fluctuations, and the applied group key.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/item-count-distribution`

**GET Get Item Count Distribution**

Retrieve the distribution of orders by the number of items per order (e.g., how many orders have 1 item, 2 items, etc.).

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/license-chart`

**GET Get License Line Chart**

Retrieve license creation/activation data as time-series chart data, grouped by the specified interval.

**Also used by the licensing UI.** Retrieve license data formatted for a line chart visualization.

**Access policy:** `ReportPolicy`

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
| `params` | object | yes | Request parameters object containing filters, date range, and grouping |
| `params[filters]` | object | no | Filter criteria |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `lineChartData` (array<object>)
    - `date` (string) — Date bucket (Y-m-d), present when groupKey is "daily"
    - `year` (integer) — Present when groupKey is "monthly" or "yearly"
    - `month` (integer) — Present when groupKey is "monthly"
    - `license_count` (integer) — Number of licenses created in this bucket

  Example:

```json
{
  "lineChartData": [
    {
      "date": "2026-08-01",
      "license_count": 4
    },
    {
      "date": "2026-08-02",
      "license_count": 7
    },
    {
      "date": "2026-08-03",
      "license_count": 2
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

## GET `/reports/license-pie-chart`

**GET Get License Pie Chart**

Retrieve license distribution data suitable for pie/donut chart visualization (e.g., active vs expired vs revoked).

**Also used by the licensing UI.** Retrieve license data formatted for a pie chart visualization.

**Access policy:** `ReportPolicy`

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
| `params` | object | yes | Request parameters object containing filters and date range |
| `params[filters]` | object | no | Filter criteria |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `pieChartData` (array<LicensePieChartSlice>) — License activation distribution by product, one entry per product that has licenses

  Example:

```json
{
  "pieChartData": [
    {
      "product_id": "10",
      "post_title": "FluentCart Pro",
      "activation_count": "198",
      "percentage": "80.82"
    },
    {
      "product_id": "14",
      "post_title": "FluentCart Pro Add-on",
      "activation_count": "47",
      "percentage": "19.18"
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

## GET `/reports/license-summary`

**GET Get License Summary**

Retrieve summary statistics for licenses (total, active, inactive, expired, total activated sites, and licensed product count). Note: the date range parameters are accepted but the current counts are not filtered by them.

**Also used by the licensing UI.** Retrieve a summary of license statistics.

**Access policy:** `ReportPolicy`

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
| `params` | object | yes | Request parameters object containing filters and date range |
| `params[filters]` | object | no | Filter criteria |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `summaryData` (object) — License summary statistics
    - `totalLicense` (integer) — Total number of licenses issued
    - `totalActiveLicense` (integer) — Number of licenses with status 'active'
    - `totalInactiveLicense` (integer) — Number of licenses with status 'disabled'
    - `totalExpiredLicense` (integer) — Number of licenses with status 'expired'
    - `totalActivatedSites` (string) — Sum of activation_count across all licenses (site activations), returned as a numeric string
    - `totalLicensedProducts` (integer) — Number of products that have license settings configured

  Example:

```json
{
  "summaryData": {
    "totalLicense": 245,
    "totalActiveLicense": 198,
    "totalInactiveLicense": 12,
    "totalExpiredLicense": 32,
    "totalActivatedSites": "412",
    "totalLicensedProducts": 3
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

## GET `/reports/order-chart`

**GET Get Order Chart**

Retrieve order count and statistics as time-series chart data, with optional comparison against a prior period. Includes summary totals and fluctuation calculations.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/order-completion-time`

**GET Get Order Completion Time**

Retrieve statistics on how long orders take to be completed (time between creation and completion).

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/order-value-distribution`

**GET Get Order Value Distribution**

Retrieve the distribution of orders by their total value, showing how orders are spread across different price ranges.

**Access policy:** `ReportPolicy`

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

  - `data` (object) — Order counts bucketed by fixed $100-wide order-value ranges (order total_amount, in dollars).
    - `0-100` (integer) — Order count for orders totaling $0–$100.
    - `100-200` (integer) — Order count for orders totaling $100–$200.
    - `200-300` (integer) — Order count for orders totaling $200–$300.
    - `300-400` (integer) — Order count for orders totaling $300–$400.
    - `400-500` (integer) — Order count for orders totaling $400–$500.
    - `500-600` (integer) — Order count for orders totaling $500–$600.
    - `600-700` (integer) — Order count for orders totaling $600–$700.
    - `700-800` (integer) — Order count for orders totaling $700–$800.
    - `800-900` (integer) — Order count for orders totaling $800–$900.
    - `900-1000` (integer) — Order count for orders totaling $900–$1000.
    - `1000+` (integer) — Order count for orders totaling more than $1000.

  Example:

```json
{
  "data": {
    "0-100": 28,
    "100-200": 82,
    "200-300": 45,
    "300-400": 30,
    "400-500": 22,
    "500-600": 15,
    "600-700": 10,
    "700-800": 6,
    "800-900": 4,
    "900-1000": 3,
    "1000+": 6
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

## GET `/reports/product-performance`

**GET Get Product Performance**

Retrieve a ranked performance chart of top-performing products within the specified date range.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/product-report`

**GET Get Product Report**

Retrieve product-level report data as time-series chart data with summary statistics. Supports comparison against a prior period with fluctuation calculations.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/quick-order-stats`

**GET Get Quick Order Stats**

Retrieve quick summary statistics for orders within a specified range, with automatic comparison against the equivalent prior period.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/refund-chart`

**GET Get Refund Chart**

Retrieve refund data as time-series chart data with summary totals. Supports comparison against a prior period with fluctuation calculations.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/refund-data-by-group`

**GET Get Refund Data by Group**

Retrieve refund data broken down by a grouping dimension (e.g., payment method, country).

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/report-overview`

**GET Get Report Overview**

Retrieve an aggregated report overview including order summary statistics and breakdowns by payment method.

**Access policy:** `ReportPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[created_at]` | object | no | Date filter with column, operator, and value keys. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `_deprecated` (string) — Present because this endpoint is deprecated since v1.4. Use GET /reports/overview instead.
  - `data` (object) — Aggregated order totals for the filtered period. Note: values are numeric strings (raw SQL aggregate results) and amounts are in cents.
    - `total_sales` (string) — Total sales amount, in cents.
    - `net_sales` (string) — Net sales amount (after discounts), in cents.
    - `total_discounts` (string) — Total discount amount, in cents.
    - `total_shipping_tax` (string) — Total shipping tax amount, in cents.
    - `average_order_value` (string) — Average order value, in cents.
    - `customer_order_count` (string) — Number of orders counted.
  - `orders_by_payment_method` (array<object>) — Order counts and transaction totals broken down by payment method.
    - `payment_method` (string)
    - `order_count` (string)
    - `transactions` (string) — Total transaction amount for this payment method, in cents.

  Example:

```json
{
  "_deprecated": "This endpoint is deprecated since v1.4 and will be removed in a future release. Use GET /fluent-cart/v2/reports/overview instead.",
  "data": {
    "total_sales": "1086707",
    "net_sales": "1009851",
    "total_discounts": "76856",
    "total_shipping_tax": "0",
    "average_order_value": "229.5051",
    "customer_order_count": "473"
  },
  "orders_by_payment_method": [
    {
      "payment_method": "stripe",
      "order_count": "421",
      "transactions": "880637"
    },
    {
      "payment_method": "offline_payment",
      "order_count": "52",
      "transactions": "26970"
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

## GET `/reports/retention-chart`

**GET Get Retention Chart**

Retrieve subscription retention data as chart data, showing how many subscribers remain active over time.

**Access policy:** `ReportPolicy`

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

  - `chartData` (RetentionChartData)

  Example:

```json
{
  "chartData": {
    "day_7": 12,
    "day_15": 9,
    "day_30": 24,
    "day_90": 41,
    "day_180": 33,
    "day_365": 28,
    "more_than_year": 36
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

## GET `/reports/retention-snapshots/status`

**GET Check Retention Snapshot Status**

Check the status of a previously queued retention snapshot generation job.

**Access policy:** `ReportPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[job_id]` | integer | yes | The job ID returned from the retention-snapshots/generate endpoint. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `success` (boolean) — Whether the lookup was successful. `false` when `params[job_id]` is missing or no job is found for that ID — in that case `status` and `data` are omitted.
  - `status` (string) _(enum: `running`, `completed`, `failed`)_ — Job status. Only present when a valid job was found (i.e. when `success` is true, or when `success` is false because the job was not found — see `job_id` in that case).
  - `message` (string) — Status message
  - `job_id` (string) — Echoes back `params[job_id]`. Only present in the 'job not found' error response.
  - `stats` (object) — Snapshot generation statistics. Only present once the job has reached `completed` or `failed` status.
    - _(object)_
  - `data` (object) — Raw job record as stored for this job ID. Present whenever a job was found (running, completed, or failed).
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

## GET `/reports/revenue-by-group`

**GET Get Revenue by Group**

Retrieve revenue data broken down by a specific grouping dimension (e.g., payment method, billing country).

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/sales-growth`

**GET Get Sales Growth**

Retrieve sales growth data over a specified period. Filters to orders with successful payment and order statuses.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/sales-growth-chart`

**GET Get Sales Growth Chart**

Retrieve time-series chart data for sales growth on the dashboard, showing order counts and net revenue grouped by the specified interval.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/sales-report`

**GET Get Sales Report**

Retrieve comprehensive sales report data with multiple graph metrics (revenue, orders, items, etc.) broken down by the specified time interval. Supports comparison against a prior period with fluctuation calculations.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/search-repeat-customer`

**GET Search Repeat Customers**

Search and paginate through customers who have made multiple purchases.

**Access policy:** `ReportPolicy`

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
    - `last_page` (integer)
    - `data` (array<object>)
      - _(object)_
    - `first_page_url` (string)
    - `from` (integer)
    - `last_page_url` (string)
    - `links` (array<object>)
      - `url` (string)
      - `label` (string)
      - `active` (boolean)
    - `next_page_url` (string)
    - `path` (string)
    - `prev_page_url` (string)
    - `to` (integer)

  Example:

```json
{
  "repeat_customers": {
    "total": 183,
    "per_page": 15,
    "current_page": 1,
    "last_page": 13,
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
    ],
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/reports/search-repeat-customer/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/reports/search-repeat-customer/?page=13",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/reports/search-repeat-customer/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/reports/search-repeat-customer/?page=2",
        "label": "2",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/reports/search-repeat-customer/?page=2",
        "label": "pagination.next",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/reports/search-repeat-customer/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/reports/search-repeat-customer",
    "prev_page_url": null,
    "to": 15
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

## GET `/reports/sources`

**GET Get Source Report**

Retrieve order source/attribution data showing where orders originated from. Supports comparison against a prior period with fluctuation calculations.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/subscription-chart`

**GET Get Subscription Chart**

Retrieve subscription data as time-series chart data, including total subscription counts and future installment projections. Supports comparison against a prior period.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/subscription-cohorts`

**GET Get Subscription Cohorts**

Retrieve cohort analysis data for subscriptions. Groups subscribers by their signup period and tracks retention over subsequent periods. Uses pre-generated retention snapshots for efficient querying.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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

## GET `/reports/subscription-retention`

**GET Get Subscription Retention**

Retrieve subscription retention data showing the percentage of subscribers who remain active over successive billing periods.

**Access policy:** `ReportPolicy`

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

  - `retention_data` (array<SubscriptionRetentionPeriod>) — Monthly subscription retention statistics, one entry per calendar month in the requested date range.

  Example:

```json
{
  "retention_data": [
    {
      "day": "2026-06-30",
      "week": "2026-26",
      "group": "2026-06",
      "year": "2026",
      "new_subscriptions": 24,
      "new_subscriptions_mrr": 1176,
      "churned_subscriptions": 6,
      "churned_subscriptions_mrr": 294,
      "active_subscriptions": "382",
      "active_paid_subscriptions": "382",
      "active_free_subscriptions": "0",
      "mrr": "41258.75",
      "retention_rate": 98.4,
      "retention_rate_money": 98.9,
      "period_gross": 1176,
      "period_subscriptions": 24
    },
    {
      "day": "2026-07-31",
      "week": "2026-31",
      "group": "2026-07",
      "year": "2026",
      "new_subscriptions": 31,
      "new_subscriptions_mrr": 1519,
      "churned_subscriptions": 4,
      "churned_subscriptions_mrr": 196,
      "active_subscriptions": "409",
      "active_paid_subscriptions": "409",
      "active_free_subscriptions": "0",
      "mrr": "44232.75",
      "retention_rate": 99.1,
      "retention_rate_money": 99.3,
      "period_gross": 1519,
      "period_subscriptions": 31
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

## GET `/reports/top-products-sold`

**GET Get Top Products Sold**

**Deprecated since v1.4** — use `GET /reports/fetch-top-sold-products` instead. Retrieve the top 5 products by total quantity sold, using the Resource API layer. The response always includes a `_deprecated` notice alongside the data.

**Access policy:** `ReportPolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `_deprecated` (string) — Deprecation notice always included in the response.
  - `top_products_sold` (array<TopProductSoldRow>) — Top 5 products by total quantity sold (descending).

  Example:

```json
{
  "_deprecated": "This endpoint is deprecated since v1.4 and will be removed in a future release. Use GET /fluent-cart/v2/reports/fetch-top-sold-products instead.",
  "top_products_sold": [
    {
      "post_id": 123,
      "total_sold": 142,
      "product": {
        "ID": 123,
        "post_title": "Developer Toolkit Pro"
      }
    },
    {
      "post_id": 125,
      "total_sold": 98,
      "product": {
        "ID": 125,
        "post_title": "API Testing Suite"
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

## GET `/reports/weeks-between-refund`

**GET Get Weeks Between Refund**

Retrieve analysis data showing the distribution of time (in weeks) between order placement and refund request.

**Access policy:** `ReportPolicy`

**Access policy:** `ReportPolicy`

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
