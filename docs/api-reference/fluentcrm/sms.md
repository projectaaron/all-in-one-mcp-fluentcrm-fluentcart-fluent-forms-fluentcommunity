# FluentCRM API — SMS (Pro)

24 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/sms/campaigns/do-bulk-action`

**POST Bulk Action on SMS Campaigns**

Perform bulk actions on multiple SMS campaigns. Supported actions: `delete_campaigns` (permanently deletes campaigns and their data) and `apply_labels` (attaches labels to campaigns). Use `select_all` to target all campaigns. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action_name` (string) **required** _(enum: `delete_campaigns`, `apply_labels`)_ — The bulk action to perform.
- `campaign_ids` (array<integer>) **required** — Array of campaign IDs to act on. Ignored if `select_all` is `true`.
- `select_all` (string) _(enum: `true`, `false`)_ — Set to `true` to apply action to all SMS campaigns.
- `labels` (array<integer>) — Array of label IDs to attach (required when `action_name` is `apply_labels`).

Example:

```json
{
  "action_name": "delete_campaigns",
  "campaign_ids": [
    1,
    3,
    5
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
  "message": "Selected Campaigns has been deleted permanently"
}
```


- **422** — No campaign IDs provided, missing labels, or invalid action name.

---

## POST `/sms/campaigns`

**POST Create SMS Campaign**

Create a new SMS campaign. The campaign is created in `draft` status. The message content allows only anchor (`<a>`) tags for links; all other HTML is stripped. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** — Campaign title.
- `message_content` (string) **required** — SMS message body. Only `<a>` tags with href, title, and target attributes are allowed; all other HTML is stripped.

Example:

```json
{
  "title": "Summer Sale SMS",
  "message_content": "Don't miss our summer sale! Visit https://example.com for details."
}
```


**Responses**

- **200** — SMS campaign created successfully.

  Schema (`application/json`):

  - `campaign` (SmsCampaign)
  - `message` (string)

  Example:

```json
{
  "campaign": {
    "id": 5,
    "title": "Summer Sale SMS",
    "message_content": "Don't miss our summer sale! Visit https://example.com for details.",
    "status": "draft",
    "type": "campaign",
    "created_at": "2024-05-28 08:00:00",
    "updated_at": "2024-05-28 08:00:00"
  },
  "message": "SMS Campaign created successfully"
}
```


- **422** — Validation error (missing title or message_content).

---

## DELETE `/sms/campaigns/{id}`

**DELETE Delete SMS Campaign**

Permanently delete an SMS campaign and all its associated data (messages, meta, etc.). **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


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

---

## DELETE `/sms/messages`

**DELETE Delete SMS Messages**

Delete multiple SMS messages by their IDs. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `ids` (array<integer>) **required** — Array of SMS message IDs to delete.

Example:

```json
{
  "ids": [
    101,
    102,
    103
  ]
}
```


**Responses**

- **200** — Messages deleted successfully.

  Schema (`application/json`):

  - `message` (string)
  - `deleted_count` (integer) — Number of messages actually deleted.

  Example:

```json
{
  "message": "3 SMS messages deleted successfully",
  "deleted_count": 3
}
```


- **400** — No SMS message IDs provided.

---

## POST `/sms/campaigns/{id}/tag-actions`

**POST Apply Tag Actions to SMS Campaign Recipients**

Add or remove tags for recipients of an archived SMS campaign. Processes recipients in batches (default 50 per page). Filter recipients by activity type (all recipients, sent, failed, delivered). Only subscribed contacts are affected. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. Must be in `archived` status. |


**Request body** (`application/json`, required)

- `action_type` (string) **required** _(enum: `add_tags`, `remove_tags`)_ — Whether to add or remove tags.
- `tags` (array<integer>) **required** — Array of tag IDs to add or remove.
- `activity_type` (string) **required** _(enum: `all_recipients`, `sms_sent`, `sms_failed`, `sms_delivered`)_ — Filter recipients by SMS activity type.
- `processing_page` (integer) **required** — Batch page number (1-based). On page 1, a total count is returned. Continue incrementing until `has_more` is false.

Example:

```json
{
  "action_type": "add_tags",
  "tags": [
    3,
    7
  ],
  "activity_type": "sms_sent",
  "processing_page": 1
}
```


**Responses**

- **200** — Batch processing result.

  Schema (`application/json`):

  - `processed_page` (integer) — The page number that was just processed.
  - `processed_contacts` (integer) — Number of contacts processed in this batch.
  - `has_more` (boolean) — Whether there are more batches to process.
  - `total_count` (integer) — Total number of matching recipients (only returned on page 1).

  Example:

```json
{
  "processed_page": 1,
  "processed_contacts": 50,
  "has_more": true,
  "total_count": 480
}
```


- **404** — Campaign not found.
- **422** — Campaign is not in `archived` status, or validation error.

---

## POST `/sms/campaigns/{id}/duplicate`

**POST Duplicate SMS Campaign**

Create a duplicate of an existing SMS campaign. The new campaign is created in `draft` status with the title prefixed by `[Duplicate]`. Labels from the original campaign are copied to the duplicate. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID to duplicate. |


**Responses**

- **200** — Campaign duplicated successfully.

  Schema (`application/json`):

  - `campaign` (SmsCampaign)
  - `message` (string)

  Example:

```json
{
  "campaign": {
    "id": 6,
    "title": "[Duplicate] Summer Sale SMS",
    "message_content": "Don't miss our summer sale!",
    "status": "draft",
    "type": "campaign",
    "created_at": "2024-06-02 10:00:00",
    "updated_at": "2024-06-02 10:00:00"
  },
  "message": "Campaign has been successfully duplicated"
}
```


- **404** — Campaign not found.

---

## POST `/sms/campaigns/estimated-contacts`

**POST Estimate SMS Campaign Contacts**

Estimate the number of contacts that match the given segment/filter criteria for an SMS campaign. Supports three filter modes: `list_tag` (lists and tags), `dynamic_segment`, and `advanced_filters`. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `sending_filter` (string) _(enum: `list_tag`, `dynamic_segment`, `advanced_filters`; default: `list_tag`)_ — Filter type for selecting contacts.
- `subscribers` (object) — Subscriber inclusion settings (used with `list_tag` filter). Contains `lists` and `tags` arrays.
  - `lists` (array<integer>)
  - `tags` (array<integer>)
- `excludedSubscribers` (object) — Subscriber exclusion settings (used with `list_tag` filter). Contains `lists` and `tags` arrays.
  - `lists` (array<integer>)
  - `tags` (array<integer>)
- `dynamic_segment` (object) — Dynamic segment configuration (used with `dynamic_segment` filter).
  - _(object)_
- `advanced_filters` (array<object>) — Advanced filter groups (used with `advanced_filters` filter).
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
    "lists": [],
    "tags": [
      5
    ]
  }
}
```


**Responses**

- **200** — Contact count estimation.

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

## GET `/sms/campaigns/{id}`

**GET Get SMS Campaign**

Retrieve a single SMS campaign by ID. The response includes the current server time. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Responses**

- **200** — SMS campaign details.

  Schema (`application/json`):

  - `campaign` (any)

  Example:

```json
{
  "campaign": {
    "id": 5,
    "title": "Summer Sale SMS",
    "message_content": "Don't miss our summer sale!",
    "status": "draft",
    "type": "campaign",
    "recipients_count": 0,
    "scheduled_at": null,
    "settings": {},
    "created_at": "2024-05-28 08:00:00",
    "updated_at": "2024-05-28 08:00:00",
    "server_time": "2024-06-01 14:30:00"
  }
}
```


- **404** — Campaign not found.

---

## GET `/sms/campaigns/{id}/processing-stat`

**GET Get SMS Campaign Processing Status**

Get the processing status of an SMS campaign that is being prepared for sending. If the campaign is in `pending-scheduled` status and its scheduled time is within 6 minutes, it transitions to `processing`. Returns whether the client should reload for updated data. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Responses**

- **200** — Processing status.

  Schema (`application/json`):

  - `reload` (boolean) — If `true`, the campaign is no longer processing and the client should reload the full status.
  - `campaign` (SmsCampaign)
  - `didRun` (boolean) — Whether any processing was done in this request (currently always `false` for SMS).
  - `scheduling_method` (string) — The sending type: `instant`, `schedule`, or empty string.

  Example:

```json
{
  "reload": false,
  "campaign": {
    "id": 5,
    "title": "Summer Sale SMS",
    "status": "processing",
    "type": "campaign",
    "recipients_count": 200
  },
  "didRun": false,
  "scheduling_method": "schedule"
}
```


- **404** — Campaign not found.

---

## GET `/sms/campaigns/{id}/recipients`

**GET Get SMS Campaign Recipients**

Retrieve a paginated list of SMS message recipients for a specific campaign. Supports filtering by message status (sent, failed, delivered) and searching by subscriber details. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filter_type` | string | no | Filter recipients by message status or activity. |
| `search` | string | no | Search recipients by subscriber name, email, or other fields. |
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Paginated list of campaign recipients.

  Schema (`application/json`):

  - `recipients` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<SmsMessage>)
  - `failed_counts` (integer) — Total number of failed messages for this campaign.

  Example:

```json
{
  "recipients": {
    "total": 500,
    "per_page": 15,
    "current_page": 1,
    "last_page": 34,
    "data": [
      {
        "id": 101,
        "subscriber_id": 42,
        "campaign_id": 5,
        "mobile_number": "+1234567890",
        "message_content": "Don't miss our summer sale!",
        "status": "sent",
        "sms_type": "campaign",
        "sent_at": "2024-06-01 10:01:00",
        "created_at": "2024-06-01 10:00:00",
        "subscriber": {
          "id": 42,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com"
        }
      }
    ]
  },
  "failed_counts": 5
}
```


- **404** — Campaign not found.

---

## GET `/sms/campaigns/{id}/estimated-recipients-count`

**GET Get SMS Campaign Recipients Count**

Get the estimated number of recipients for an SMS campaign. For campaigns in `draft`, `processing`, or `pending-scheduled` status, a live count is computed from the subscriber model. For other statuses, the stored `recipients_count` is returned. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Responses**

- **200** — Estimated recipients count.

  Schema (`application/json`):

  - `estimated_count` (integer) — Estimated number of recipients.

  Example:

```json
{
  "estimated_count": 450
}
```


- **404** — Campaign not found.

---

## GET `/sms/campaigns/{id}/status`

**GET Get SMS Campaign Status**

Get the current sending status of an SMS campaign, including message statistics, sent count, and analytics. For `working` campaigns, this endpoint also performs housekeeping: resets stale processing messages, schedules recovery batch sends, and auto-archives completed campaigns. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `request_counter` | integer | no | Poll counter used to trigger periodic cleanup of stale processing messages (runs every 4th request). |


**Responses**

- **200** — Campaign status with message statistics.

  Schema (`application/json`):

  - `current_timestamp` (string) _(format: date-time)_ — Current server timestamp.
  - `stat` (array<object>) — Array of message status counts.
    - `status` (string)
    - `total` (integer)
  - `campaign` (SmsCampaign)
  - `sent_count` (integer) — Total number of successfully sent messages.
  - `analytics` (object) — Campaign analytics (reserved for future use).
    - _(object)_

  Example:

```json
{
  "current_timestamp": "2024-06-01 14:00:00",
  "stat": [
    {
      "status": "sent",
      "total": 480
    },
    {
      "status": "failed",
      "total": 5
    },
    {
      "status": "pending",
      "total": 15
    }
  ],
  "campaign": {
    "id": 5,
    "title": "Summer Sale SMS",
    "status": "working",
    "type": "campaign",
    "recipients_count": 500,
    "sent_by": "Admin User (admin@example.com)"
  },
  "sent_count": 480,
  "analytics": {}
}
```


- **404** — Campaign not found.

---

## GET `/sms/subscribers/{id}/logs`

**GET Get Subscriber SMS Logs**

Retrieve paginated SMS message logs for a specific subscriber/contact. Each log entry includes the message content, phone number, timestamps, and type. Supports filtering by SMS type and ordering. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Subscriber (contact) ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number. |
| `filter` | string | no | Filter by SMS type. Use `all` to show all types. |
| `order` | string | no | Sort direction by created_at. |


**Responses**

- **200** — Paginated SMS logs for the subscriber.

  Schema (`application/json`):

  - `logs` (object)
    - `data` (array<SmsLog>)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)

  Example:

```json
{
  "logs": {
    "data": [
      {
        "id": 1,
        "subscriber_id": 42,
        "campaign_id": 5,
        "mobile_number": "+1234567890",
        "message_content": "Don't miss our summer sale!",
        "message": "Don't miss our summer sale!",
        "from": "+1234567890",
        "date": "06/01/2024",
        "time": "10:01",
        "type": "campaign",
        "status": "sent",
        "sms_type": "campaign",
        "sent_at": "2024-06-01 10:01:00",
        "created_at": "2024-06-01 10:00:00"
      }
    ],
    "total": 15,
    "per_page": 20,
    "current_page": 1,
    "last_page": 1
  }
}
```


- **404** — Subscriber not found.

---

## GET `/sms/subscribers/{id}/stats`

**GET Get Subscriber SMS Statistics**

Retrieve SMS statistics for a specific subscriber/contact, including total message counts broken down by type (campaign, automation, custom) and status (sent, delivered, failed, pending). **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Subscriber (contact) ID. |


**Responses**

- **200** — SMS statistics for the subscriber.

  Schema (`application/json`):

  - `stats` (object)
    - `total_messages` (integer) — Total SMS messages sent to this subscriber.
    - `campaign_messages` (integer) — Messages sent via campaigns.
    - `automation_messages` (integer) — Messages sent via automations.
    - `custom_sms` (integer) — Custom (one-off) messages.
    - `sent_messages` (integer) — Messages with `sent` status.
    - `delivered_messages` (integer) — Messages with `delivered` status.
    - `failed_messages` (integer) — Messages with `failed` status.
    - `pending_messages` (integer) — Messages with `pending` status.
    - `last_sent` (string) _(format: date-time)_ — Timestamp of the most recently sent SMS.

  Example:

```json
{
  "stats": {
    "total_messages": 25,
    "campaign_messages": 15,
    "automation_messages": 8,
    "custom_sms": 2,
    "sent_messages": 22,
    "delivered_messages": 20,
    "failed_messages": 1,
    "pending_messages": 2,
    "last_sent": "2024-06-01 10:01:00"
  }
}
```


- **404** — Subscriber not found.

---

## GET `/sms/campaigns`

**GET List SMS Campaigns**

Retrieve a paginated list of SMS campaigns. Supports filtering by status, search term, labels, and sorting. Optionally includes campaign statistics and labels. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `searchBy` | string | no | Search campaigns by title. |
| `statuses[]` | array<string> | no | Filter by campaign statuses. |
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `with[]` | array<string> | no | Include related data. Use `stats` to include next step config and formatted labels. |
| `labels[]` | array<integer> | no | Filter by label term IDs. |
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Paginated list of SMS campaigns.

  Schema (`application/json`):

  - `campaigns` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<SmsCampaign>)

  Example:

```json
{
  "campaigns": {
    "total": 12,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "title": "Summer Sale SMS",
        "message_content": "Don't miss our summer sale! Visit https://example.com",
        "status": "archived",
        "type": "campaign",
        "recipients_count": 500,
        "scheduled_at": "2024-06-01 10:00:00",
        "settings": {},
        "created_at": "2024-05-28 08:00:00",
        "updated_at": "2024-06-01 10:30:00",
        "next_step": "3",
        "labels": [
          {
            "id": 1,
            "title": "Promotions"
          }
        ]
      }
    ]
  }
}
```



---

## GET `/sms/messages`

**GET List All SMS Messages**

Retrieve a paginated list of all SMS messages across all campaigns and types. Supports filtering by status and searching by message content, phone number, or subscriber details. Also returns status counts for filter dropdowns. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number. |
| `status` | string | no | Filter by message status. Use empty string or `all` to show all statuses. |
| `search` | string | no | Search by message content, phone number, or subscriber details (name, email). |


**Responses**

- **200** — Paginated list of SMS messages with status counts.

  Schema (`application/json`):

  - `sms` (object)
    - `data` (array<SmsMessage>)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `from` (integer)
    - `to` (integer)
    - `next_page_url` (string)
    - `prev_page_url` (string)
  - `statuses` (array<object>) — Available status filters with counts.
    - `value` (string)
    - `label` (string)
    - `count` (integer)

  Example:

```json
{
  "sms": {
    "data": [
      {
        "id": 101,
        "subscriber_id": 42,
        "campaign_id": 5,
        "mobile_number": "+1234567890",
        "message_content": "Don't miss our summer sale!",
        "status": "sent",
        "sms_type": "campaign",
        "sent_at": "2024-06-01 10:01:00",
        "created_at": "2024-06-01 10:00:00",
        "subscriber": {
          "id": 42,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com"
        },
        "campaign": {
          "id": 5,
          "title": "Summer Sale SMS"
        }
      }
    ],
    "total": 150,
    "per_page": 10,
    "current_page": 1,
    "last_page": 15,
    "from": 1,
    "to": 10,
    "next_page_url": "...?page=2",
    "prev_page_url": null
  },
  "statuses": [
    {
      "value": "pending",
      "label": "Pending",
      "count": 5
    },
    {
      "value": "sent",
      "label": "Sent",
      "count": 130
    },
    {
      "value": "delivered",
      "label": "Delivered",
      "count": 120
    },
    {
      "value": "failed",
      "label": "Failed",
      "count": 10
    },
    {
      "value": "cancelled",
      "label": "Cancelled",
      "count": 5
    }
  ]
}
```



---

## POST `/sms/campaigns/{id}/pause`

**POST Pause SMS Campaign**

Pause an actively sending SMS campaign. The campaign must be in `working` status. All pending/scheduled/scheduling messages are set to `paused`. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Responses**

- **200** — Campaign paused successfully.

  Schema (`application/json`):

  - `message` (string)
  - `campaign` (SmsCampaign)

  Example:

```json
{
  "message": "Campaign has been successfully marked as paused",
  "campaign": {
    "id": 5,
    "title": "Summer Sale SMS",
    "status": "paused",
    "type": "campaign"
  }
}
```


- **404** — Campaign not found.
- **422** — Campaign is not in `working` status.

---

## POST `/sms/messages/{id}/resend`

**POST Resend SMS Message**

Resend a specific SMS message by creating a new message entry with the same content and queuing it for delivery via Action Scheduler. The subscriber must still have a valid phone number and the message content must not exceed 1600 characters. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Original SMS message ID to resend. |


**Responses**

- **200** — SMS queued for resending.

  Schema (`application/json`):

  - `message` (string)
  - `new_message_id` (integer) — ID of the newly created message entry.

  Example:

```json
{
  "message": "SMS message has been queued for resending",
  "new_message_id": 205
}
```


- **400** — Subscriber has no phone number or message exceeds 1600 characters.
- **404** — SMS message or subscriber not found.
- **500** — Failed to queue SMS for resending.

---

## POST `/sms/campaigns/{id}/resume`

**POST Resume SMS Campaign**

Resume a paused SMS campaign. The campaign must be in `paused` status. All paused messages are re-scheduled and batch sending is triggered via Action Scheduler. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Responses**

- **200** — Campaign resumed successfully.

  Schema (`application/json`):

  - `message` (string)
  - `campaign` (SmsCampaign)

  Example:

```json
{
  "message": "Campaign has been successfully resumed",
  "campaign": {
    "id": 5,
    "title": "Summer Sale SMS",
    "status": "working",
    "type": "campaign"
  }
}
```


- **404** — Campaign not found.
- **422** — Campaign is not in `paused` status.

---

## POST `/sms/campaigns/{id}/schedule`

**POST Schedule SMS Campaign**

Schedule an SMS campaign for sending. The campaign must be in `draft` status. If `scheduled_at` is provided, the campaign is scheduled for that time. If omitted, the campaign starts sending within 5 minutes (instant send with admin cancel window). Accepts Unix timestamps, MySQL datetime strings, and ISO-8601 strings. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Request body** (`application/json`)

- `scheduled_at` (string) — Schedule date/time. Accepts MySQL datetime (e.g. `2024-06-01 10:00:00`), Unix timestamp, or ISO-8601 string. Omit for instant sending.
- `sending_type` (string) _(enum: `schedule`; default: `schedule`)_ — Sending type. Currently only `schedule` is supported.

Example:

```json
{
  "scheduled_at": "2024-06-01 10:00:00",
  "sending_type": "schedule"
}
```


**Responses**

- **200** — Campaign scheduled successfully.

  Schema (`application/json`):

  - `campaign` (SmsCampaign)
  - `message` (string)
  - `current_timestamp` (string) _(format: date-time)_ — Current server timestamp.

  Example:

```json
{
  "campaign": {
    "id": 5,
    "title": "Summer Sale SMS",
    "status": "pending-scheduled",
    "scheduled_at": "2024-06-01 10:00:00",
    "recipients_count": 0
  },
  "message": "Your sms campaign has been scheduled",
  "current_timestamp": "2024-05-30 14:00:00"
}
```


- **404** — Campaign not found.
- **422** — Campaign is not in draft status or invalid schedule date.

---

## POST `/sms/subscribers/{id}/send`

**POST Send Custom SMS to Subscriber**

Send a custom (one-off) SMS message to a specific subscriber/contact. The SMS module must be active and the subscriber must have a phone number. Maximum message length is 1600 characters (up to 10 SMS segments). The message is queued via Action Scheduler for near-immediate delivery. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Subscriber (contact) ID. |


**Request body** (`application/json`, required)

- `message` (string) **required** _(maxLength: 1600)_ — SMS message body. Maximum 1600 characters.
- `from_number` (string) — Optional sender phone number/ID.

Example:

```json
{
  "message": "Hi John, your order #1234 has been shipped! Track it at https://example.com/track/1234"
}
```


**Responses**

- **200** — SMS queued for sending.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Custom SMS will be sent shortly"
}
```


- **400** — SMS module not active, message is required, subscriber has no phone number, or message exceeds 1600 characters.
- **404** — Subscriber not found.
- **500** — Internal error while preparing SMS.

---

## POST `/sms/campaigns/{id}/unschedule`

**POST Unschedule SMS Campaign**

Unschedule a previously scheduled SMS campaign, reverting it to `draft` status. All generated SMS messages for this campaign are deleted. The campaign must be in `scheduled`, `pending-scheduled`, or `processing` status (and for `processing`, the scheduled time must still be in the future). **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Responses**

- **200** — Campaign unscheduled successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "SMS Campaign has been successfully un-scheduled"
}
```


- **404** — Campaign not found.
- **422** — Campaign is not in a valid state for unscheduling.

---

## PUT `/sms/campaigns/{id}`

**PUT Update SMS Campaign**

Update an existing SMS campaign. Only `title`, `message_content`, and `settings` can be updated. An optional `next_step` value can be stored as campaign meta. The message content allows only anchor (`<a>`) tags; all other HTML is stripped. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Request body** (`application/json`, required)

- `title` (string) **required** — Campaign title.
- `message_content` (string) **required** — SMS message body. Only `<a>` tags are allowed.
- `settings` (object) — Optional campaign settings object.
  - _(object)_
- `next_step` (string) — Optional next configuration step identifier, stored as campaign meta.

Example:

```json
{
  "title": "Summer Sale SMS (Updated)",
  "message_content": "Updated: Don't miss our summer sale! Visit https://example.com",
  "settings": {
    "sending_filter": "list_tag"
  },
  "next_step": "3"
}
```


**Responses**

- **200** — SMS campaign updated successfully.

  Schema (`application/json`):

  - `campaign` (SmsCampaign)
  - `message` (string)

  Example:

```json
{
  "campaign": {
    "id": 5,
    "title": "Summer Sale SMS (Updated)",
    "message_content": "Updated: Don't miss our summer sale! Visit https://example.com",
    "status": "draft",
    "type": "campaign",
    "created_at": "2024-05-28 08:00:00",
    "updated_at": "2024-05-29 10:00:00"
  },
  "message": "SMS Campaign Updated successfully"
}
```


- **404** — Campaign not found.
- **422** — Validation error (missing title or message_content).

---

## PUT `/sms/{id}/update-labels`

**PUT Update SMS Campaign Labels**

Attach or detach labels from an SMS campaign. Use the `action` parameter to specify `attach` or `detach`. **PRO** (requires FluentCampaign Pro SMS module).

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | SMS campaign ID. |


**Request body** (`application/json`, required)

- `action` (string) _(enum: `attach`, `detach`; default: `detach`)_ — Whether to attach or detach the labels.
- `label_ids` (array<integer>) **required** — Array of label term IDs to attach or detach.

Example:

```json
{
  "action": "attach",
  "label_ids": [
    1,
    3,
    5
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
- **422** — No valid label IDs provided.

---
