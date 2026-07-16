# FluentCRM API — Dynamic Segments

9 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/dynamic-segments`

**POST Create Dynamic Segment**

Create a new custom dynamic segment with filter conditions. The segment data is stored as a JSON-encoded string in the `segment` parameter. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `segment` (string) **required** — JSON-encoded segment object containing the title, conditions, and filter settings.

Example:

```json
{
  "segment": "{\"title\":\"Engaged Subscribers\",\"conditions\":[{\"field\":\"status\",\"operator\":\"whereIn\",\"value\":[\"subscribed\"]}],\"condition_match\":\"match_all\",\"email_activities\":{\"status\":\"no\",\"last_email_open\":{\"value\":0,\"operator\":\">=\"},\"last_email_link_click\":{\"value\":0,\"operator\":\">=\"},\"last_email_activity_match\":\"match_any\"}}"
}
```


**Responses**

- **200** — Segment created successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `segment` (CustomSegmentData)

  Example:

```json
{
  "message": "Segment has been created",
  "segment": {
    "id": 12,
    "slug": "custom_segment",
    "title": "Engaged Subscribers",
    "conditions": [
      {
        "field": "status",
        "operator": "whereIn",
        "value": [
          "subscribed"
        ]
      }
    ],
    "condition_match": "match_all",
    "email_activities": {
      "status": "no",
      "last_email_open": {
        "value": 0,
        "operator": ">="
      },
      "last_email_link_click": {
        "value": 0,
        "operator": ">="
      },
      "last_email_activity_match": "match_any"
    }
  }
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please provide segment title"
}
```



---

## DELETE `/dynamic-segments/{id}`

**DELETE Delete Dynamic Segment**

Permanently delete a custom dynamic segment by its ID. Only custom segments (stored in the Meta table) can be deleted. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the custom segment to delete. |


**Responses**

- **200** — Segment deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Selected segment has been deleted"
}
```


- **422** — Invalid segment ID.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry! No segment found"
}
```



---

## POST `/dynamic-segments/duplicate/{id}`

**POST Duplicate Dynamic Segment**

Create a copy of an existing custom dynamic segment. The duplicated segment will have `[Duplicate]` prepended to its title. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the custom segment to duplicate. |


**Responses**

- **200** — Segment duplicated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `segment_id` (integer) — ID of the newly created duplicate segment.

  Example:

```json
{
  "message": "Segment successfully duplicated",
  "segment_id": 18
}
```



---

## POST `/dynamic-segments/estimated-contacts`

**POST Estimate Dynamic Segment Contacts**

Get the estimated number of contacts matching a set of segment filter conditions. Useful for previewing a segment before creating or updating it. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `filters` (object) **required** — Filter configuration object containing conditions and email activity settings.
  - `conditions` (array<object>) — Array of filter conditions.
    - `field` (string) — Field to filter on.
    - `operator` (string) — Comparison operator.
    - `value` (any) — Value to compare against.
  - `condition_match` (string) _(enum: `match_all`, `match_any`)_ — How to combine conditions.
  - `email_activities` (object) — Email activity filter settings.
    - _(object)_

Example:

```json
{
  "filters": {
    "conditions": [
      {
        "field": "status",
        "operator": "whereIn",
        "value": [
          "subscribed"
        ]
      },
      {
        "field": "created_at",
        "operator": ">=",
        "value": 30
      }
    ],
    "condition_match": "match_all",
    "email_activities": {
      "status": "no",
      "last_email_open": {
        "value": 0,
        "operator": ">="
      },
      "last_email_link_click": {
        "value": 0,
        "operator": ">="
      },
      "last_email_activity_match": "match_any"
    }
  }
}
```


**Responses**

- **200** — Estimated contact count.

  Schema (`application/json`):

  - `count` (integer) — Number of contacts matching the provided filters.

  Example:

```json
{
  "count": 245
}
```



---

## GET `/dynamic-segments/custom-fields`

**GET Get Dynamic Segment Custom Fields**

Retrieve the available filter field definitions and default settings for building custom dynamic segment conditions. Returns field types, operators, and options for constructing segment filters. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Filter field definitions and default settings.

  Schema (`application/json`):

  - `fields` (array<FieldGroup>) — Array of field group definitions. Each group contains a set of filterable fields with their types, operators, and options.
  - `settings_defaults` (object) — Default settings object for initializing a new custom segment.
    - `conditions` (array<object>) — Default empty conditions array.
      - `field` (string)
      - `operator` (string)
      - `value` (string)
    - `condition_match` (string) _(enum: `match_all`, `match_any`)_ — Default condition match type.
    - `email_activities` (object) — Default email activity filter settings.
      - `status` (string) _(enum: `yes`, `no`)_
      - `last_email_open` (object)
        - `value` (integer)
        - `operator` (string)
      - `last_email_link_click` (object)
        - `value` (integer)
        - `operator` (string)
      - `last_email_activity_match` (string) _(enum: `match_all`, `match_any`)_

  Example:

```json
{
  "fields": [
    {
      "type": "condition_blocks",
      "key": "conditions",
      "heading": "Conditions",
      "label": "Select conditions which will define this segment. All Conditions will be applied to filter",
      "fields": {
        "email": {
          "type": "text",
          "label": "Contact Email",
          "operators": {
            "=": "Equal",
            "!=": "Not Equal",
            "LIKE": "Contains",
            "NOT LIKE": "Not Contains"
          },
          "value": ""
        },
        "first_name": {
          "type": "text",
          "label": "First Name",
          "operators": {
            "=": "Equal",
            "!=": "Not Equal",
            "LIKE": "Contains",
            "NOT LIKE": "Not Contains"
          },
          "value": ""
        },
        "status": {
          "type": "select",
          "is_multiple": true,
          "label": "Subscription Status",
          "operators": {
            "whereIn": "In",
            "whereNotIn": "Not In"
          },
          "value": [],
          "options": {
            "subscribed": "Subscribed",
            "unsubscribed": "Unsubscribed",
            "pending": "Pending",
            "bounced": "Bounced",
            "complained": "Complained"
          }
        },
        "tags": {
          "type": "select",
          "is_multiple": true,
          "label": "Tags",
          "operators": {
            "whereIn": "In",
            "whereNotIn": "Not In"
          },
          "value": [],
          "options": {
            "1": "VIP Customer",
            "2": "Newsletter"
          }
        },
        "lists": {
          "type": "select",
          "is_multiple": true,
          "label": "Lists",
          "operators": {
            "whereIn": "In",
            "whereNotIn": "Not In"
          },
          "value": [],
          "options": {
            "1": "Main List",
            "2": "Promotions"
          }
        }
      }
    },
    {
      "type": "activities_blocks",
      "key": "email_activities",
      "heading": "Filter By Email Activities",
      "label": "Filter your contacts by from email open or email link click metrics. Leave the values blank for not applying",
      "fields": {
        "status": {
          "type": "yes_no_check",
          "label": "Enable Last Email Activity Filter"
        },
        "last_email_open": {
          "type": "days_ago_with_operator",
          "label": "Last Email Open",
          "options": {
            ">=": "Within",
            "<=": "Before"
          },
          "inline_help": "Keep days 0/Blank for disable"
        },
        "last_email_link_click": {
          "type": "days_ago_with_operator",
          "label": "Last Email Link Clicked",
          "options": {
            ">=": "Within",
            "<=": "Before"
          },
          "inline_help": "Keep days 0/Blank for disable"
        },
        "last_email_activity_match": {
          "heading": "Match Type",
          "label": "Should Match Both Open & Click Condition?",
          "options": {
            "match_all": "Match Both Open and Click Condition",
            "match_any": "Match Any One Condition"
          }
        }
      }
    }
  ],
  "settings_defaults": {
    "conditions": [
      {
        "field": "",
        "operator": "",
        "value": ""
      }
    ],
    "condition_match": "match_all",
    "email_activities": {
      "status": "no",
      "last_email_open": {
        "value": 0,
        "operator": ">="
      },
      "last_email_link_click": {
        "value": 0,
        "operator": ">="
      },
      "last_email_activity_match": "match_any"
    }
  }
}
```



---

## GET `/dynamic-segments/stats`

**GET Get Dynamic Segment Stats**

Retrieve contact count statistics for all registered dynamic segments. Returns a map of segment keys to their subscriber counts. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Segment statistics keyed by `{slug}_{id}`.

  Schema (`application/json`):

  - `stats` (object,null) — Map of segment keys (`{slug}_{id}`) to subscriber counts. Returns `null` if no segments have data.

  Example:

```json
{
  "stats": {
    "wordpress_users_0": 150,
    "custom_segment_12": 85,
    "custom_segment_15": 42
  }
}
```



---

## GET `/dynamic-segments/{slug}/subscribers/{id}`

**GET Get Dynamic Segment Subscribers**

Retrieve a paginated list of subscribers belonging to a specific dynamic segment. Supports sorting, searching, and optional custom field inclusion. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | string | yes | The slug of the dynamic segment type (e.g., `custom_segment`, `wordpress_users`). |
| `id` | integer | yes | The ID of the segment. Use `0` for built-in segments that have no specific ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search subscribers by name or email. |
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `custom_fields` | string | no | Set to `true` to include custom field values for each subscriber. |
| `has_commerce` | boolean | no | If truthy, includes commerce data for each subscriber (requires a commerce provider like WooCommerce). |
| `per_page` | integer | no | Number of subscribers per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Segment details and paginated list of subscribers.

  Schema (`application/json`):

  - `segment` (object) — The resolved segment data, including its model query result.
    - _(object)_
  - `subscribers` (object) — Paginated list of subscribers in the segment.
    - `total` (integer) — Total number of subscribers in the segment.
    - `per_page` (integer) — Number of subscribers per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<SegmentSubscriber>) — Array of subscriber objects with related tags, lists, and optionally companies.

  Example:

```json
{
  "segment": {
    "slug": "custom_segment",
    "title": "Engaged Subscribers",
    "id": 12
  },
  "subscribers": {
    "total": 85,
    "per_page": 15,
    "current_page": 1,
    "last_page": 6,
    "next_page_url": "?page=2",
    "prev_page_url": null,
    "from": 1,
    "to": 15,
    "data": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "status": "subscribed",
        "created_at": "2024-01-15 10:30:00",
        "tags": [],
        "lists": []
      }
    ]
  }
}
```



---

## GET `/dynamic-segments`

**GET List Dynamic Segments**

Retrieve all registered dynamic segments. Returns both built-in segments (e.g., WordPress Users, WooCommerce Customers) and custom segments created via the API. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Responses**

- **200** — List of all dynamic segments.

  Schema (`application/json`):

  - `dynamic_segments` (array<DynamicSegment>) — Array of dynamic segment objects.

  Example:

```json
{
  "dynamic_segments": [
    {
      "slug": "wordpress_users",
      "title": "WordPress Users",
      "subtitle": "All WordPress Users",
      "id": 0,
      "count": 150
    },
    {
      "slug": "custom_segment",
      "title": "Engaged Subscribers",
      "subtitle": "Custom Segment",
      "id": 12,
      "count": 85
    }
  ]
}
```



---

## PUT `/dynamic-segments/{id}`

**PUT Update Dynamic Segment**

Update an existing custom dynamic segment's title, conditions, and filter settings. The segment data is sent as a JSON-encoded string. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the custom segment to update. |


**Request body** (`application/json`, required)

- `segment` (string) **required** — JSON-encoded segment object containing the updated title, conditions, and filter settings.

Example:

```json
{
  "segment": "{\"title\":\"Highly Engaged Subscribers\",\"conditions\":[{\"field\":\"status\",\"operator\":\"whereIn\",\"value\":[\"subscribed\"]},{\"field\":\"last_activity\",\"operator\":\">=\",\"value\":7}],\"condition_match\":\"match_all\",\"email_activities\":{\"status\":\"yes\",\"last_email_open\":{\"value\":14,\"operator\":\">=\"},\"last_email_link_click\":{\"value\":0,\"operator\":\">=\"},\"last_email_activity_match\":\"match_any\"}}"
}
```


**Responses**

- **200** — Segment updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `segment` (object) — The updated segment data object with the assigned ID.
    - `id` (integer) — Segment ID.
    - `title` (string) — Updated segment title.
    - `conditions` (array<object>) — Updated filter conditions.
      - _(object)_
    - `condition_match` (string) _(enum: `match_all`, `match_any`)_
    - `email_activities` (object) — Updated email activity filter settings.
      - _(object)_

  Example:

```json
{
  "message": "Segment has been updated",
  "segment": {
    "id": 12,
    "title": "Highly Engaged Subscribers",
    "conditions": [
      {
        "field": "status",
        "operator": "whereIn",
        "value": [
          "subscribed"
        ]
      },
      {
        "field": "last_activity",
        "operator": ">=",
        "value": 7
      }
    ],
    "condition_match": "match_all",
    "email_activities": {
      "status": "yes",
      "last_email_open": {
        "value": 14,
        "operator": ">="
      },
      "last_email_link_click": {
        "value": 0,
        "operator": ">="
      },
      "last_email_activity_match": "match_any"
    }
  }
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please provide segment title"
}
```



---
