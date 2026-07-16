# FluentCRM API — Global Search

1 endpoint. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/global-search`

**GET Global Search**

Search across subscribers, campaigns, funnels, and companies simultaneously. Results are permission-scoped: only entities the current user has access to are returned. Returns up to 100 results per category by default (filterable via hook).

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | yes | Search term. If empty, returns empty arrays for all categories. |
| `scope` | string | no | Limit search to a specific category. Defaults to `all`. |


**Responses**

- **200** — Search results grouped by category.

  Schema (`application/json`):

  - `subscribers` (array<SearchSubscriber>) — Matching subscribers. Only present if user has `fcrm_read_contacts` permission.
  - `campaigns` (array<SearchCampaign>) — Matching campaigns. Only present if user has `fcrm_read_emails` permission.
  - `funnels` (array<SearchFunnel>) — Matching automation funnels. Only present if user has `fcrm_read_funnels` permission.
  - `companies` (array<SearchCompany>) — Matching companies. Only present when the companies feature is enabled and user has `fcrm_manage_contact_cats` permission.

  Example:

```json
{
  "subscribers": [
    {
      "id": 42,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "photo": "https://www.gravatar.com/avatar/abc123"
    }
  ],
  "campaigns": [
    {
      "id": 5,
      "title": "Welcome Campaign",
      "status": "published"
    }
  ],
  "funnels": [
    {
      "id": 3,
      "title": "New User Onboarding",
      "status": "published"
    }
  ],
  "companies": [
    {
      "id": 1,
      "name": "Acme Corp",
      "logo": "https://example.com/logo.png"
    }
  ]
}
```



---
