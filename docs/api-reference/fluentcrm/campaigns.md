# FluentCRM API — Campaigns

32 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/campaigns/do-bulk-action`

**POST Bulk Action Campaigns**

Perform a bulk action on multiple campaigns. Supported actions: `delete_campaigns` to permanently delete selected campaigns and all associated data, `apply_labels` to attach labels to selected campaigns. Use `select_all` to apply the action to all campaigns.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action_name` (string) **required** _(enum: `delete_campaigns`, `apply_labels`)_ — The bulk action to perform.
- `campaign_ids` (array<integer>) — Array of campaign IDs to act on.
- `select_all` (string) _(enum: `true`, `false`)_ — Set to `true` to apply the action to all campaigns, ignoring `campaign_ids`.
- `labels` (array<integer>) — Label IDs to attach. Required when `action_name` is `apply_labels`.

Example:

```json
{
  "action_name": "delete_campaigns",
  "campaign_ids": [
    5,
    8,
    12
  ]
}
```


**Responses**

- **200** — Bulk action completed successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Selected Campaigns have been deleted permanently"
}
```


- **422** — Invalid action or missing required data.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please provide campaign IDs"
}
```



---

## POST `/campaigns`

**POST Create Campaign**

Create a new email campaign. If no title is provided, an auto-generated unique title (e.g., 'Untitled', 'Untitled 2') is assigned. The campaign is created in draft status and returned with its template and subjects relations loaded.

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- `title` (string) — Campaign title. Must be unique across all campaigns. If omitted or empty, an auto-generated title is assigned.

Example:

```json
{
  "title": "Spring Sale 2024"
}
```


**Responses**

- **200** — Campaign created successfully.

  Schema (`application/json`):

  - `id` (integer)
  - `title` (string)
  - `slug` (string)
  - `status` (string)
  - `template_id` (integer)
  - `email_subject` (string)
  - `email_pre_header` (string)
  - `email_body` (string)
  - `settings` (object)
    - _(object)_
  - `created_at` (string) _(format: date-time)_
  - `updated_at` (string) _(format: date-time)_
  - `template` (object)
    - _(object)_
  - `subjects` (array<object>)
    - _(object)_

  Example:

```json
{
  "id": 12,
  "title": "Spring Sale 2024",
  "slug": null,
  "status": "draft",
  "template_id": null,
  "email_subject": null,
  "email_pre_header": null,
  "email_body": null,
  "settings": {},
  "created_at": "2024-03-01 10:00:00",
  "updated_at": "2024-03-01 10:00:00",
  "template": null,
  "subjects": []
}
```


- **422** — Validation error (e.g., title is not unique).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## DELETE `/campaigns/{id}`

**DELETE Delete Campaign**

Permanently delete a campaign by ID. This removes the campaign and all associated data including campaign emails, URL metrics, and meta records.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID to delete. |


**Responses**

- **200** — Campaign deleted successfully.

  Schema (`application/json`):

  - `success` (boolean)

  Example:

```json
{
  "success": true
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## DELETE `/campaigns/{id}/emails`

**DELETE Delete Campaign Emails**

Delete specific campaign email records by their IDs. After deletion, the campaign's `recipients_count` is updated to reflect the remaining emails.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Request body** (`application/json`, required)

- `email_ids` (array<integer>) **required** — Array of campaign email IDs to delete.

Example:

```json
{
  "email_ids": [
    456,
    789,
    1012
  ]
}
```


**Responses**

- **200** — Campaign emails deleted successfully.

  Schema (`application/json`):

  - `message` (string)
  - `recipients_count` (integer) — Updated recipient count after deletion.

  Example:

```json
{
  "message": "Selected emails are deleted",
  "recipients_count": 1197
}
```



---

## POST `/campaigns/{id}/draft-recipients`

**POST Draft Campaign Recipients**

Save recipient selection settings for a campaign and calculate the estimated recipient count. Supports filtering by list/tag, dynamic segment, or advanced filters. Clears any previously processed campaign emails and resets the campaign to draft status.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Request body** (`application/json`, required)

- `sending_filter` (string) _(enum: `list_tag`, `dynamic_segment`, `advanced_filters`; default: `list_tag`)_ — Type of recipient filter.
- `subscribers` (object) — Included lists and tags for `list_tag` filter.
  - `lists` (array<integer>)
  - `tags` (array<integer>)
- `excludedSubscribers` (object) — Excluded lists and tags for `list_tag` filter.
  - `lists` (array<integer>)
  - `tags` (array<integer>)
- `dynamic_segment` (object) — Dynamic segment configuration for `dynamic_segment` filter.
  - `slug` (string)
  - `id` (integer)
- `advanced_filters` (array<object>) — Advanced filter groups for `advanced_filters` filter.
  - _(object)_

Example:

```json
{
  "sending_filter": "list_tag",
  "subscribers": {
    "lists": [
      1,
      2
    ],
    "tags": [
      3
    ]
  },
  "excludedSubscribers": {
    "tags": [
      5
    ]
  }
}
```


**Responses**

- **200** — Recipient settings saved successfully.

  Schema (`application/json`):

  - `message` (string)
  - `count` (integer) — Number of matching recipients.

  Example:

```json
{
  "message": "Recipient settings has been updated",
  "count": 850
}
```


- **422** — No subscribers found matching the filter.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry no subscribers found based on your selection"
}
```



---

## POST `/campaigns/{id}/duplicate`

**POST Duplicate Campaign**

Create a duplicate of an existing campaign. The new campaign is created in draft status with a `[Duplicate]` title prefix. All email content, UTM settings, design template, settings, labels, and A/B test subjects are copied to the new campaign.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID to duplicate. |


**Responses**

- **200** — Campaign duplicated successfully.

  Schema (`application/json`):

  - `campaign` (object)
    - `id` (integer)
    - `title` (string)
    - `slug` (string)
    - `status` (string)
    - `email_subject` (string)
    - `email_pre_header` (string)
    - `email_body` (string)
    - `design_template` (string)
    - `settings` (object)
      - _(object)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
  - `message` (string)

  Example:

```json
{
  "campaign": {
    "id": 13,
    "title": "[Duplicate] Spring Sale 2024",
    "slug": "spring-sale-2024-1709312400",
    "status": "draft",
    "email_subject": "Don't miss our Spring Sale!",
    "email_pre_header": "Limited time offer",
    "email_body": "<p>Hello {{contact.first_name}}</p>",
    "design_template": "simple",
    "settings": {},
    "created_at": "2024-03-02 14:00:00",
    "updated_at": "2024-03-02 14:00:00"
  },
  "message": "Campaign has been successfully duplicated"
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/campaigns/estimated-contacts`

**POST Estimate Campaign Contacts**

Estimate the number of contacts that match the given segmentation settings. Supports filtering by list/tag, dynamic segment, or advanced filters. Useful for previewing audience size before sending a campaign.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `sending_filter` (string) _(enum: `list_tag`, `dynamic_segment`, `advanced_filters`; default: `list_tag`)_ — Type of filter to apply.
- `subscribers` (object) — List and tag selection for `list_tag` filter type.
  - `lists` (array<integer>)
  - `tags` (array<integer>)
- `excludedSubscribers` (object) — Exclusion list and tag selection for `list_tag` filter type.
  - `lists` (array<integer>)
  - `tags` (array<integer>)
- `dynamic_segment` (object) — Dynamic segment configuration for `dynamic_segment` filter type.
  - `slug` (string)
  - `id` (integer)
- `advanced_filters` (array<object>) — Advanced filter groups for `advanced_filters` filter type.
  - _(object)_

Example:

```json
{
  "sending_filter": "list_tag",
  "subscribers": {
    "lists": [
      1,
      2
    ],
    "tags": [
      3
    ]
  },
  "excludedSubscribers": {
    "tags": [
      5
    ]
  }
}
```


**Responses**

- **200** — Estimated contact count returned.

  Schema (`application/json`):

  - `count` (integer) — Estimated number of matching contacts.
  - `execution_time` (number) — Query execution time in seconds.

  Example:

```json
{
  "count": 1250,
  "execution_time": 0.045
}
```



---

## GET `/campaigns/{id}`

**GET Get Campaign**

Retrieve a single campaign by ID. Optionally include related data (template, subjects) via the `with` parameter. When `viewCampaign` is set, returns the campaign with its paginated emails. Also returns available email templates and the server's current time.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Include related data (e.g., `template`, `subjects`). |
| `viewCampaign` | string | no | If set, returns the campaign with paginated emails instead of the standard response. |


**Responses**

- **200** — Campaign retrieved successfully.

  Schema (`application/json`):

  - `campaign` (object) — The campaign data including `server_time`.
    - `id` (integer)
    - `title` (string)
    - `slug` (string)
    - `status` (string)
    - `template_id` (integer)
    - `email_subject` (string)
    - `email_pre_header` (string)
    - `email_body` (string)
    - `recipients_count` (integer)
    - `design_template` (string)
    - `scheduled_at` (string) _(format: date-time)_
    - `settings` (object)
      - _(object)_
    - `server_time` (string) _(format: date-time)_ — Current server time in WordPress timezone.
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
    - `template` (object)
      - _(object)_
    - `subjects` (array<object>)
      - _(object)_
  - `templates` (array<object>) — Available email templates (ID and title only).
    - `ID` (integer)
    - `post_title` (string)

  Example:

```json
{
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024",
    "slug": "spring-sale-2024",
    "status": "draft",
    "template_id": 5,
    "email_subject": "Don't miss our Spring Sale!",
    "email_pre_header": "Limited time offer",
    "email_body": "<p>Hello {{contact.first_name}}</p>",
    "recipients_count": 0,
    "design_template": "simple",
    "scheduled_at": null,
    "settings": {},
    "server_time": "2024-03-01 14:30:00",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00",
    "template": null,
    "subjects": []
  },
  "templates": [
    {
      "ID": 10,
      "post_title": "Basic Template"
    },
    {
      "ID": 8,
      "post_title": "Newsletter Template"
    }
  ]
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/campaigns/{id}/contacts-by-segment`

**GET Get Campaign Contacts by Segment**

Get a paginated list of contacts that match the campaign's recipient segment settings. Supports searching by name/email and sorting. Each contact includes their associated lists and tags.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search contacts by name or email. |
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Segmented contacts retrieved successfully.

  Schema (`application/json`):

  - `subscribers` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<object>)
      - `id` (integer)
      - `email` (string)
      - `first_name` (string)
      - `last_name` (string)
      - `status` (string)
      - `contact_type` (string)
      - `created_at` (string) _(format: date-time)_
      - `lists` (array<object>)
        - `id` (integer)
        - `title` (string)
      - `tags` (array<object>)
        - `id` (integer)
        - `title` (string)

  Example:

```json
{
  "subscribers": {
    "total": 850,
    "per_page": 15,
    "current_page": 1,
    "last_page": 57,
    "data": [
      {
        "id": 42,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "status": "subscribed",
        "contact_type": "lead",
        "created_at": "2024-01-15 08:00:00",
        "lists": [
          {
            "id": 1,
            "title": "Newsletter"
          }
        ],
        "tags": [
          {
            "id": 3,
            "title": "VIP"
          }
        ]
      }
    ]
  }
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/campaigns/{id}/emails`

**GET Get Campaign Emails**

Retrieve a paginated list of emails sent for a specific campaign. Supports filtering by engagement type (click, view, unopened, failed) and searching by subscriber details. Optionally includes the campaign data with tracking status.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filter_type` | string | no | Filter emails by engagement type. |
| `search` | string | no | Search by subscriber name or email. |
| `with_campaign` | string | no | Set to include the campaign object (with tracking status) in the response. |
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Campaign emails retrieved successfully.

  Schema (`application/json`):

  - `emails` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<object>)
      - `id` (integer)
      - `campaign_id` (integer)
      - `subscriber_id` (integer)
      - `email_subject` (string)
      - `email_pre_header` (string)
      - `status` (string) _(enum: `draft`, `pending`, `processing`, `scheduled`, `sent`, `failed`, `bounced`, `paused`)_
      - `is_open` (integer) — Number of times the email was opened.
      - `click_counter` (integer) — Number of link clicks.
      - `scheduled_at` (string) _(format: date-time)_
      - `created_at` (string) _(format: date-time)_
      - `updated_at` (string) _(format: date-time)_
      - `subscriber` (object)
        - `id` (integer)
        - `email` (string)
        - `first_name` (string)
        - `last_name` (string)
        - `status` (string)
  - `failed_counts` (integer) — Total number of failed emails for this campaign.
  - `campaign` (object) — Included only when `with_campaign` is set.
    - `id` (integer)
    - `title` (string)
    - `open_tracking_status` (string)
    - `click_tracking_status` (string)

  Example:

```json
{
  "emails": {
    "total": 1200,
    "per_page": 15,
    "current_page": 1,
    "last_page": 80,
    "data": [
      {
        "id": 456,
        "campaign_id": 12,
        "subscriber_id": 42,
        "email_subject": "Welcome aboard!",
        "email_pre_header": "We are glad to have you",
        "status": "sent",
        "is_open": 3,
        "click_counter": 2,
        "scheduled_at": "2024-03-01 10:00:00",
        "created_at": "2024-03-01 10:00:00",
        "updated_at": "2024-03-01 12:30:00",
        "subscriber": {
          "id": 42,
          "email": "john@example.com",
          "first_name": "John",
          "last_name": "Doe",
          "status": "subscribed"
        }
      }
    ]
  },
  "failed_counts": 5
}
```



---

## GET `/campaigns/{id}/link-report`

**GET Get Campaign Link Report**

Get a report of all tracked links in a campaign, including click counts for each URL. Also returns the click and open tracking status for the campaign.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Responses**

- **200** — Link report retrieved successfully.

  Schema (`application/json`):

  - `links` (array<object>) — Array of tracked links with click statistics.
    - `url` (string) _(format: uri)_
    - `total` (integer) — Total number of clicks.
    - `unique` (integer) — Number of unique clickers.
  - `click_status` (string) — Whether click tracking was enabled for this campaign (e.g., `yes`, `no`).
  - `open_status` (string) — Whether open tracking was enabled for this campaign (e.g., `yes`, `no`).

  Example:

```json
{
  "links": [
    {
      "url": "https://example.com/sale",
      "total": 245,
      "unique": 198
    },
    {
      "url": "https://example.com/blog",
      "total": 89,
      "unique": 72
    }
  ],
  "click_status": "yes",
  "open_status": "yes"
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/campaigns/{id}/overview_stats`

**GET Get Campaign Overview Stats**

Get overview statistics for a campaign including sent count, email status breakdown, and open/click analytics. This is a lighter-weight alternative to the full campaign status endpoint, suitable for dashboard widgets or summary views.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Responses**

- **200** — Overview statistics retrieved successfully.

  Schema (`application/json`):

  - `sent_count` (integer) — Total number of successfully sent emails.
  - `stat` (array<object>) — Email count grouped by status.
    - `status` (string)
    - `total` (integer)
  - `analytics` (object) — Open and click analytics.
    - `open` (object)
      - `total` (integer)
      - `subtitle` (string)
    - `click` (object)
      - `total` (integer)
      - `subtitle` (string)

  Example:

```json
{
  "sent_count": 1195,
  "stat": [
    {
      "status": "sent",
      "total": 1195
    },
    {
      "status": "failed",
      "total": 5
    }
  ],
  "analytics": {
    "open": {
      "total": 840,
      "subtitle": "70.3% open rate"
    },
    "click": {
      "total": 320,
      "subtitle": "26.8% click rate"
    }
  }
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/campaigns/{id}/processing-stat`

**GET Get Campaign Processing Stat**

Get the current processing status and statistics of a campaign being sent. This endpoint is polled during campaign sending to track progress. It processes a chunk of emails on each call and returns the updated campaign state, including whether the campaign has finished processing.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Responses**

- **200** — Processing statistics retrieved.

  Schema (`application/json`):

  - `campaign` (object)
    - `id` (integer)
    - `title` (string)
    - `status` (string)
    - `recipients_count` (integer)
    - `scheduling_range` (object) — Range schedule dates if the campaign uses range scheduling.
      - _(object)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
  - `reload` (boolean) — If true, the campaign is no longer processing and the UI should reload.
  - `didRun` (boolean) — Whether email processing was executed on this request.
  - `scheduling_method` (string) — The method used for scheduling (e.g., `wp_remote_post`, `action_scheduler`).

  Example:

```json
{
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024",
    "status": "processing",
    "recipients_count": 850,
    "scheduling_range": null,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 14:05:00"
  },
  "didRun": true,
  "scheduling_method": "wp_remote_post"
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/campaigns/{id}/estimated-recipients-count`

**GET Get Campaign Recipients Count**

Get the estimated number of recipients for a campaign. For draft, processing, or pending-scheduled campaigns, this dynamically counts matching subscribers. For sent/archived campaigns, it returns the stored `recipients_count` value.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Responses**

- **200** — Recipient count retrieved successfully.

  Schema (`application/json`):

  - `estimated_count` (integer) — Estimated number of recipients.

  Example:

```json
{
  "estimated_count": 1250
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/campaigns/{id}/revenues`

**GET Get Campaign Revenues**

Get a paginated list of revenue (orders) attributed to a campaign. Supports WooCommerce and Easy Digital Downloads. Returns order details including buyer name, status, date, and formatted total. Returns an empty array if no e-commerce plugin is active.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of orders per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Revenue report retrieved successfully.

  Schema (`application/json`):

  - `orders` (array<object>)
    - `id` (integer) — Order ID.
    - `title` (string) — Order title with buyer name (may contain HTML link).
    - `status` (string) — Order status label.
    - `date` (string) — Formatted order date.
    - `total` (string) — Formatted order total with currency.
  - `labels` (object) — Column labels for the orders table.
    - `id` (string)
    - `title` (string)
    - `status` (string)
    - `date` (string)
    - `total` (string)
  - `total` (integer) — Total number of orders attributed to this campaign.

  Example:

```json
{
  "orders": [
    {
      "id": 1234,
      "title": "<a href=\"/wp-admin/post.php?post=1234&action=edit\"><strong>#1234 John Doe</strong></a>",
      "status": "Completed",
      "date": "Mar 1, 2024",
      "total": "$99.00"
    }
  ],
  "labels": {
    "id": "ID",
    "title": "Title",
    "status": "Status",
    "date": "Date",
    "total": "Total"
  },
  "total": 15
}
```



---

## GET `/campaigns/{id}/share-url`

**GET Get Campaign Share URL**

Get the public shareable URL for a campaign. This URL allows viewing the campaign email in a web browser without authentication.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Responses**

- **200** — Share URL retrieved successfully.

  Schema (`application/json`):

  - `sharable_url` (string) _(format: uri)_ — Public URL to view the campaign email.

  Example:

```json
{
  "sharable_url": "https://example.com/?fluentcrm=1&route=email&hash=abc123def456"
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/campaigns/{id}/status`

**GET Get Campaign Status**

Get the comprehensive status and analytics of a campaign. This is the primary endpoint for the campaign status/reporting page. Returns campaign details, email delivery statistics broken down by status, sent count, open/click analytics (for archived campaigns), and A/B subject line performance. For working campaigns, it also manages stuck email recovery and automatic archival.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `request_counter` | integer | no | Counter for polling requests. Used internally to trigger periodic cleanup of stuck emails (every 4th request). |


**Responses**

- **200** — Campaign status retrieved successfully.

  Schema (`application/json`):

  - `current_timestamp` (string) _(format: date-time)_ — Current server timestamp.
  - `stat` (array<object>) — Email count grouped by status.
    - `status` (string)
    - `total` (integer)
  - `campaign` (object)
    - `id` (integer)
    - `title` (string)
    - `status` (string)
    - `recipients_count` (integer)
    - `scheduled_at` (string) _(format: date-time)_
    - `settings` (object)
      - _(object)_
    - `sent_by` (string) — Display name and email of the user who sent the campaign.
    - `open_tracking_status` (string) — Whether open tracking is enabled. Only present for archived campaigns.
    - `click_tracking_status` (string) — Whether click tracking is enabled. Only present for archived campaigns.
    - `scheduling_range` (object)
      - _(object)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
  - `sent_count` (integer) — Total number of successfully sent emails.
  - `analytics` (object) — Open and click analytics. Populated only for archived campaigns.
    - `open` (object)
      - `total` (integer)
      - `subtitle` (string)
    - `click` (object)
      - `total` (integer)
      - `subtitle` (string)
  - `subject_analytics` (object) — A/B test subject line performance. Populated only for archived campaigns with multiple subjects.
    - _(object)_

  Example:

```json
{
  "current_timestamp": "2024-03-02 14:30:00",
  "stat": [
    {
      "status": "sent",
      "total": 1195
    },
    {
      "status": "failed",
      "total": 5
    }
  ],
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024",
    "status": "archived",
    "recipients_count": 1200,
    "scheduled_at": "2024-03-01 10:00:00",
    "settings": {},
    "sent_by": "Admin User (admin@example.com)",
    "open_tracking_status": "yes",
    "click_tracking_status": "yes",
    "created_at": "2024-02-28 08:00:00",
    "updated_at": "2024-03-01 10:30:00"
  },
  "sent_count": 1195,
  "analytics": {
    "open": {
      "total": 840,
      "subtitle": "70.3% open rate"
    },
    "click": {
      "total": 320,
      "subtitle": "26.8% click rate"
    }
  },
  "subject_analytics": {}
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/campaigns/{id}/unsubscribers`

**GET Get Campaign Unsubscribers**

Get a paginated list of contacts who unsubscribed as a result of this campaign. Each record includes the subscriber details and their unsubscribe reason.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Unsubscribers list retrieved successfully.

  Schema (`application/json`):

  - `unsubscribes` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<object>)
      - `id` (integer)
      - `campaign_id` (integer)
      - `subscriber_id` (integer)
      - `type` (string)
      - `created_at` (string) _(format: date-time)_
      - `subscriber` (object)
        - `id` (integer)
        - `email` (string)
        - `first_name` (string)
        - `last_name` (string)
        - `status` (string)
        - `reason` (string) — Unsubscribe reason provided by the contact.

  Example:

```json
{
  "unsubscribes": {
    "total": 8,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 100,
        "campaign_id": 12,
        "subscriber_id": 55,
        "type": "unsubscribe",
        "created_at": "2024-03-01 14:30:00",
        "subscriber": {
          "id": 55,
          "email": "jane@example.com",
          "first_name": "Jane",
          "last_name": "Smith",
          "status": "unsubscribed",
          "reason": "Too many emails"
        }
      }
    ]
  }
}
```



---

## GET `/campaigns`

**GET List Campaigns**

Retrieve a paginated list of email campaigns. Supports filtering by status, search term, labels, and sorting. Optionally includes campaign statistics.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `searchBy` | string | no | Search campaigns by title. |
| `statuses[]` | array<string> | no | Filter by campaign statuses. |
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `with[]` | array<string> | no | Include related data. Use `stats` to include campaign statistics and labels. |
| `labels[]` | array<integer> | no | Filter by label IDs. |
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Paginated list of campaigns.

  Schema (`application/json`):

  - `campaigns` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<Campaign>)

  Example:

```json
{
  "campaigns": {
    "total": 25,
    "per_page": 15,
    "current_page": 1,
    "last_page": 2,
    "data": [
      {
        "id": 1,
        "title": "Welcome Campaign",
        "slug": "welcome-campaign",
        "status": "archived",
        "template_id": 5,
        "email_subject": "Welcome aboard!",
        "email_pre_header": "We are glad to have you",
        "email_body": "<p>Hello {{contact.first_name}}</p>",
        "recipients_count": 1200,
        "utm_status": 0,
        "utm_source": "",
        "utm_medium": "",
        "utm_campaign": "",
        "utm_term": "",
        "utm_content": "",
        "design_template": "simple",
        "scheduled_at": "2024-03-01 10:00:00",
        "settings": {},
        "created_at": "2024-02-28 08:00:00",
        "updated_at": "2024-03-01 10:30:00",
        "stats": {
          "total": 1200,
          "sent": 1195,
          "failed": 5,
          "clicks": 320,
          "views": 840
        },
        "next_step": "3",
        "labels": [
          {
            "id": 1,
            "title": "Onboarding"
          }
        ]
      }
    ]
  }
}
```



---

## POST `/campaigns/{id}/pause`

**POST Pause Campaign**

Pause a currently working campaign. Only campaigns with status `working` can be paused. All pending, scheduled, and scheduling emails are set to `paused` status.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID to pause. |


**Responses**

- **200** — Campaign paused successfully.

  Schema (`application/json`):

  - `message` (string)
  - `campaign` (object)
    - `id` (integer)
    - `title` (string)
    - `status` (string)
    - `recipients_count` (integer)
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "message": "Campaign has been successfully marked as paused",
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024",
    "status": "paused",
    "recipients_count": 1200,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 15:00:00"
  }
}
```


- **422** — Campaign is not in working state.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "You can only pause a campaign if it is on \"Working\" state, Please reload this page"
}
```



---

## GET `/campaigns/emails/{email_id}/preview`

**GET Preview Campaign Email**

Preview a specific sent campaign email by its email ID. Returns the rendered email data including subject, body, and click tracking information.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email_id` | integer | yes | The campaign email ID to preview. |


**Responses**

- **200** — Email preview data retrieved successfully.

  Schema (`application/json`):

  - `info` (object) — The CampaignEmail record.
    - `id` (integer)
    - `campaign_id` (integer)
    - `subscriber_id` (integer)
    - `email_subject` (string)
    - `email_pre_header` (string)
    - `email_body` (string)
    - `status` (string)
    - `is_open` (integer)
    - `click_counter` (integer)
    - `scheduled_at` (string) _(format: date-time)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
  - `email` (object) — Rendered email preview data.
    - `email_subject` (string)
    - `email_body` (string)
    - `clicks` (array<object>)
      - `url` (string)
      - `counter` (integer)

  Example:

```json
{
  "info": {
    "id": 456,
    "campaign_id": 12,
    "subscriber_id": 42,
    "email_subject": "Welcome aboard!",
    "email_pre_header": "We are glad to have you",
    "status": "sent",
    "is_open": 3,
    "click_counter": 2,
    "scheduled_at": "2024-03-01 10:00:00",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 12:30:00"
  },
  "email": {
    "email_subject": "Welcome aboard!",
    "email_body": "<html><body><p>Hello John!</p></body></html>",
    "clicks": [
      {
        "url": "https://example.com/offer",
        "counter": 2
      }
    ]
  }
}
```


- **404** — Campaign email not found.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/campaigns/email-preview-html`

**POST Preview Campaign Email HTML**

Generate a rendered HTML preview of a campaign email. Can preview either a saved campaign (by campaign_id) or unsaved campaign data passed in the request body. SmartCodes and template rendering are applied. Optionally preview as a specific contact.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `campaign_id` (integer) — ID of a saved campaign to preview. If omitted, the `campaign` object is used instead.
- `campaign` (object) — Unsaved campaign data to preview. Used when `campaign_id` is not provided.
  - `email_body` (string)
  - `email_pre_header` (string)
  - `design_template` (string)
  - `settings` (object)
    - _(object)_
  - `post_content` (string) — Alternative field for email_body.
  - `post_excerpt` (string) — Alternative field for email_pre_header.
- `contact_id` (integer) — Optional contact ID to use for SmartCode replacements in the preview.
- `disable_subscriber` (string) _(enum: `yes`, `no`)_ — Set to `yes` to disable subscriber-specific SmartCode parsing.

Example:

```json
{
  "campaign_id": 12
}
```


**Responses**

- **200** — Email preview HTML generated successfully.

  Schema (`application/json`):

  - `preview_html` (string) — Fully rendered HTML of the email.

  Example:

```json
{
  "preview_html": "<html><body><p>Hello John, Welcome aboard!</p></body></html>"
}
```



---

## POST `/campaigns/{id}/resume`

**POST Resume Campaign**

Resume a paused campaign. Only campaigns with status `paused` can be resumed. The campaign status is set back to `working` and all paused emails are rescheduled.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID to resume. |


**Responses**

- **200** — Campaign resumed successfully.

  Schema (`application/json`):

  - `message` (string)
  - `campaign` (object)
    - `id` (integer)
    - `title` (string)
    - `status` (string)
    - `recipients_count` (integer)
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "message": "Campaign has been successfully resumed",
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024",
    "status": "working",
    "recipients_count": 1200,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 16:00:00"
  }
}
```


- **422** — Campaign is not in paused state.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "You can only resume a campaign if it is on \"paused\" state, Please reload this page"
}
```



---

## POST `/campaigns/{id}/revenues/resync`

**POST Resync Campaign Revenues**

Re-synchronize the revenue data for a campaign by recalculating totals from WooCommerce orders. Updates the `_campaign_revenue` meta with fresh order totals. Only works with WooCommerce.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Responses**

- **200** — Revenue re-synced successfully or no revenue/orders found.

  Schema (`application/json`):

  - `message` (string)
  - `total` (string) — Formatted total revenue amount. Only present when re-sync is successful.

  Example:

```json
{
  "message": "Revenue has been re-synced successfully",
  "total": "4950.00"
}
```



---

## POST `/campaigns/{id}/schedule`

**POST Schedule Campaign**

Schedule a campaign for sending. Supports three modes: instant sending (omit `scheduled_at`), scheduled sending (single datetime), and range-scheduled sending (array of two datetimes for staggered delivery). The campaign must be in draft status. Clears any previously processed emails before scheduling.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID to schedule. |


**Request body** (`application/json`)

- `scheduled_at` (any) — When to send the campaign. Omit for instant sending.
- `sending_type` (string) _(enum: `schedule`, `range_schedule`; default: `schedule`)_ — Sending type. Use `range_schedule` when `scheduled_at` is an array of two datetimes.

Example:

```json
{
  "scheduled_at": "2024-03-15 09:00:00",
  "sending_type": "schedule"
}
```


**Responses**

- **200** — Campaign scheduled or sending started.

  Schema (`application/json`):

  - `campaign` (object)
    - `id` (integer)
    - `title` (string)
    - `status` (string) _(enum: `pending-scheduled`, `processing`)_ — `pending-scheduled` for scheduled sends, `processing` for instant sends.
    - `scheduled_at` (string) _(format: date-time)_
    - `recipients_count` (integer)
    - `settings` (object)
      - _(object)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
  - `message` (string)
  - `current_timestamp` (string) _(format: date-time)_

  Example:

```json
{
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024",
    "status": "pending-scheduled",
    "scheduled_at": "2024-03-15 09:00:00",
    "recipients_count": 0,
    "settings": {
      "sending_type": "schedule",
      "click_tracker": "yes",
      "open_tracker": "yes"
    },
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 14:00:00"
  },
  "message": "Your campaign email has been scheduled",
  "current_timestamp": "2024-03-02 14:00:00"
}
```


- **422** — Campaign is not in draft status or invalid schedule date.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Campaign status is not in draft status. Please reload the page"
}
```



---

## POST `/campaigns/send-test-email`

**POST Send Campaign Test Email**

Send a test email for a campaign. Can send a test from either a saved campaign (by campaign_id) or from unsaved campaign data passed in the request body. The email subject is prefixed with 'TEST: '. If no email address is provided, it sends to the current user's email.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `test_campaign` (string) _(enum: `yes`, `no`)_ — Set to `yes` to send test from unsaved campaign data passed in `campaign` field. Set to `no` or omit to use a saved campaign via `campaign_id`.
- `campaign_id` (integer) — ID of the saved campaign to send a test for. Used when `test_campaign` is not `yes`.
- `campaign` (object) — Unsaved campaign data. Used when `test_campaign` is `yes`.
  - `email_subject` (string)
  - `email_pre_header` (string)
  - `email_body` (string)
  - `design_template` (string)
  - `settings` (object)
    - _(object)_
- `email` (string) _(format: email)_ — Recipient email address for the test. Defaults to the current user's email if not provided.

Example:

```json
{
  "test_campaign": "no",
  "campaign_id": 12,
  "email": "test@example.com"
}
```


**Responses**

- **200** — Test email sent successfully.

  Schema (`application/json`):

  - `message` (string)
  - `result` (object) — Mailer send result.
    - _(object)_

  Example:

```json
{
  "message": "Test email successfully sent to test@example.com, The dynamic tags may not be replaced in the test email",
  "result": {}
}
```


- **422** — No subscriber found to send test.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No subscriber found to send test. Please add atleast one contact as subscribed status"
}
```



---

## POST `/campaigns/{id}/un-schedule`

**POST Un-Schedule Campaign**

Cancel a scheduled campaign and revert it to draft status. Only campaigns with status `scheduled`, `pending-scheduled`, or `processing` (before the scheduled time) can be un-scheduled. All associated campaign emails are deleted.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID to un-schedule. |


**Responses**

- **200** — Campaign un-scheduled successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Campaign has been successfully un-scheduled"
}
```


- **422** — Campaign is not in a valid state for un-scheduling.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "You can only un-schedule a campaign if it is on \"scheduled\" state, Please reload this page"
}
```



---

## PUT `/campaigns/{id}`

**PUT Update Campaign**

Update an existing campaign. Supports updating title, email content, UTM parameters, template, settings, and A/B test subjects. When `next_step` is provided, it advances the campaign wizard and performs step-specific validation (e.g., compliance checks for unsubscribe links on step 2).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID to update. |


**Request body** (`application/json`, required)

- `title` (string) **required** — Campaign title. Must be unique across campaigns (excluding this campaign).
- `slug` (string)
- `template_id` (integer)
- `email_subject` (string)
- `email_pre_header` (string)
- `email_body` (string)
- `utm_status` (integer) _(enum: `0`, `1`)_
- `utm_source` (string)
- `utm_medium` (string)
- `utm_campaign` (string)
- `utm_term` (string)
- `utm_content` (string)
- `scheduled_at` (string) _(format: date-time)_
- `design_template` (string) — Email design template type (e.g., `simple`, `plain`, `raw_html`, `visual_builder`).
- `settings` (object) — Campaign settings including template config, mailer settings, etc.
  - _(object)_
- `update_subjects` (boolean) — If true, syncs A/B test subjects from the `subjects` array.
- `subjects` (array<object>) — A/B test subject lines. Only processed when `update_subjects` is true.
  - `key` (string)
  - `value` (string)
- `next_step` (integer) — Advance the campaign wizard to this step. Step 1 = compose, Step 2 = subjects/compliance.

Example:

```json
{
  "title": "Spring Sale 2024",
  "email_subject": "Don't miss our Spring Sale!",
  "email_pre_header": "Limited time offer",
  "email_body": "<p>Hello {{contact.first_name}}, check out our sale!</p>",
  "design_template": "simple",
  "next_step": 2
}
```


**Responses**

- **200** — Campaign updated successfully.

  Schema (`application/json`):

  - `campaign` (object)
    - `id` (integer)
    - `title` (string)
    - `status` (string)
    - `email_subject` (string)
    - `email_pre_header` (string)
    - `email_body` (string)
    - `design_template` (string)
    - `settings` (object)
      - _(object)_
    - `subjects` (array<object>)
      - _(object)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024",
    "status": "draft",
    "email_subject": "Don't miss our Spring Sale!",
    "email_pre_header": "Limited time offer",
    "design_template": "simple",
    "settings": {},
    "subjects": [],
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 14:00:00"
  }
}
```


- **422** — Validation error or compliance check failed.

  Schema (`application/json`):

  - `message` (string)
  - `compliance_failed` (boolean) — True when the email body is missing required unsubscribe or manage subscription links.

  Example:

```json
{
  "compliance_failed": true,
  "message": "##crm.manage_subscription_url## or ##crm.unsubscribe_url## or {{crm_global_email_footer}} string is required for compliance."
}
```



---

## PUT `/campaigns/{id}/update-labels`

**PUT Update Campaign Labels**

Update the labels (tags/categories) attached to a campaign. Currently supports the `detach` action to remove specified labels from the campaign.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `detach`)_ — The action to perform on labels.
- `label_ids` (array<integer>) **required** — Array of label IDs to detach.

Example:

```json
{
  "action": "detach",
  "label_ids": [
    1,
    3
  ]
}
```


**Responses**

- **200** — Labels updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Labels has been updated"
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/campaigns/{id}/step`

**POST Update Campaign Step**

Update the current wizard step for a campaign. This sets the `_next_config_step` campaign meta value, which tracks how far the user has progressed through the campaign setup wizard.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Request body** (`application/json`, required)

- `next_step` (integer) **required** — The step number to set (e.g., 1 = compose, 2 = subjects, 3 = recipients, 4 = review).

Example:

```json
{
  "next_step": 2
}
```


**Responses**

- **200** — Step updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "step saved"
}
```



---

## PUT `/campaigns/{id}/title`

**PUT Update Campaign Title**

Update only the title of a campaign. For scheduled campaigns, optionally update the scheduled time as well. When the scheduled time changes, all unsent email records are rescheduled to the new time.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Request body** (`application/json`, required)

- `title` (string) **required** — New campaign title.
- `scheduled_at` (string) _(format: date-time)_ — New scheduled time. Only applicable for campaigns with `scheduled` status.

Example:

```json
{
  "title": "Spring Sale 2024 - Final",
  "scheduled_at": "2024-03-15 09:00:00"
}
```


**Responses**

- **200** — Campaign title updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `campaign` (object)
    - `id` (integer)
    - `title` (string)
    - `status` (string)
    - `scheduled_at` (string) _(format: date-time)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "message": "Campaign has been updated",
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024 - Final",
    "status": "scheduled",
    "scheduled_at": "2024-03-15 09:00:00",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 14:30:00"
  }
}
```



---

## POST `/campaigns/update-single-campaign`

**POST Update Single Campaign (Simulate)**

Update a campaign using a POST request instead of PUT. This is a convenience endpoint that internally delegates to the campaign update logic. The campaign ID is passed in the request body rather than the URL path. Useful when method override is not available.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `campaign_id` (integer) **required** — The campaign ID to update.
- `title` (string) **required** — Campaign title. Must be unique across campaigns.
- `slug` (string)
- `template_id` (integer)
- `email_subject` (string)
- `email_pre_header` (string)
- `email_body` (string)
- `utm_status` (integer) _(enum: `0`, `1`)_
- `utm_source` (string)
- `utm_medium` (string)
- `utm_campaign` (string)
- `utm_term` (string)
- `utm_content` (string)
- `scheduled_at` (string) _(format: date-time)_
- `design_template` (string)
- `settings` (object)
  - _(object)_
- `update_subjects` (boolean) — If true, also syncs A/B test subjects.
- `subjects` (array<object>) — A/B test subject lines. Only processed when `update_subjects` is true.
  - _(object)_
- `next_step` (integer) — Update the campaign wizard step. Steps: 1 = compose, 2 = subjects/compliance.

Example:

```json
{
  "campaign_id": 12,
  "title": "Spring Sale 2024 - Updated",
  "email_subject": "Don't miss our Spring Sale!",
  "email_body": "<p>Hello {{contact.first_name}}</p>",
  "next_step": 2
}
```


**Responses**

- **200** — Campaign updated successfully.

  Schema (`application/json`):

  - `campaign` (Campaign)

  Example:

```json
{
  "campaign": {
    "id": 12,
    "title": "Spring Sale 2024 - Updated",
    "status": "draft",
    "email_subject": "Don't miss our Spring Sale!",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 14:00:00"
  }
}
```


- **422** — Validation error or compliance check failed.

  Schema (`application/json`):

  - `message` (string)
  - `compliance_failed` (boolean)

---
