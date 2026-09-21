# FluentCRM API — Custom Fields

3 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/custom-fields/contacts`

**GET Get Contact Custom Fields**

Retrieve all globally defined custom contact fields. Optionally include field type definitions and field group information by passing the `with[]` parameter.

By default the response contains only `fields`. Request `field_types` and/or `field_groups` through `with[]` to get the metadata needed to render a field editor.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `CustomFieldsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Include additional data. Supported values: `field_types` (available field type definitions), `field_groups` (field group names). |


**Responses**

- **200** — Custom fields retrieved successfully.

  Schema (`application/json`):

  - `fields` (array<CustomField>) — Array of custom field definitions.
  - `field_types` (object) — Available field type definitions. Returned **only** when `with[]=field_types` is requested.
    - _(object)_
  - `field_groups` (array<object>) — Available field group definitions. Returned **only** when `with[]=field_groups` is requested.
    - `slug` (string) — Group slug identifier.
    - `title` (string) — Human-readable group title.

  Example:

```json
{
  "fields": [
    {
      "label": "Company Name",
      "slug": "company_name",
      "type": "text",
      "group": "default",
      "options": []
    },
    {
      "label": "Subscription Plan",
      "slug": "subscription_plan",
      "type": "select-one",
      "group": "default",
      "options": [
        "Free",
        "Pro",
        "Enterprise"
      ]
    }
  ],
  "field_types": {
    "text": {
      "type": "text",
      "label": "Single Line Text",
      "value_type": "string"
    },
    "textarea": {
      "type": "textarea",
      "label": "Multi Line Text",
      "value_type": "string"
    },
    "number": {
      "type": "number",
      "label": "Numeric Field",
      "value_type": "numeric"
    },
    "single-select": {
      "type": "select-one",
      "label": "Select choice",
      "value_type": "string"
    },
    "multi-select": {
      "type": "select-multi",
      "label": "Multiple Select choice",
      "value_type": "array"
    },
    "radio": {
      "type": "radio",
      "label": "Radio Choice",
      "value_type": "string"
    },
    "checkbox": {
      "type": "checkbox",
      "label": "Checkboxes",
      "value_type": "array"
    },
    "date": {
      "type": "date",
      "label": "Date",
      "value_type": "date"
    },
    "date_time": {
      "type": "date_time",
      "label": "Date and Time",
      "value_type": "datetime"
    }
  },
  "field_groups": [
    {
      "slug": "default",
      "title": "Custom Profile Data"
    }
  ]
}
```



---

## PUT `/custom-fields/contacts`

**PUT Save Contact Custom Fields**

Save (replace) all custom contact field definitions. This overwrites the entire set of custom fields. Each field without a `slug` will have one auto-generated from its label. Duplicate slugs are deduplicated automatically.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `CustomFieldsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `fields` (array<object>) **required** — Complete array of custom field definitions to save. This replaces all existing fields.
  - `label` (string) — Human-readable field label.
  - `slug` (string) — Unique field identifier/slug. Auto-generated from label if not provided.
  - `type` (string) _(enum: `text`, `textarea`, `number`, `select-one`, `select-multi`, `radio`, `checkbox`, `date`, `date_time`)_ — Field type.
  - `group` (string) — Field group name for organizing fields into sections.
  - `options` (array<string>) — Available options for select, radio, and checkbox field types.

Example:

```json
{
  "fields": [
    {
      "label": "Company Name",
      "slug": "company_name",
      "type": "text",
      "group": "default",
      "options": []
    },
    {
      "label": "Subscription Plan",
      "slug": "subscription_plan",
      "type": "select-one",
      "group": "default",
      "options": [
        "Free",
        "Pro",
        "Enterprise"
      ]
    },
    {
      "label": "Interests",
      "slug": "interests",
      "type": "checkbox",
      "group": "default",
      "options": [
        "Marketing",
        "Development",
        "Design"
      ]
    }
  ]
}
```


**Responses**

- **200** — Custom fields saved successfully.

  Schema (`application/json`):

  - `fields` (array<object>) — The saved custom field definitions (with any auto-generated slugs applied).
    - `label` (string) — Human-readable field label.
    - `slug` (string) — Unique field identifier/slug. Auto-generated from label if not provided.
    - `type` (string) _(enum: `text`, `textarea`, `number`, `select-one`, `select-multi`, `radio`, `checkbox`, `date`, `date_time`)_ — Field type.
    - `group` (string) — Field group name for organizing fields into sections.
    - `options` (array<string>) — Available options for select, radio, and checkbox field types.
  - `message` (string) — Success message.

  Example:

```json
{
  "fields": [
    {
      "label": "Company Name",
      "slug": "company_name",
      "type": "text",
      "group": "default",
      "options": []
    },
    {
      "label": "Subscription Plan",
      "slug": "subscription_plan",
      "type": "select-one",
      "group": "default",
      "options": [
        "Free",
        "Pro",
        "Enterprise"
      ]
    },
    {
      "label": "Interests",
      "slug": "interests",
      "type": "checkbox",
      "group": "default",
      "options": [
        "Marketing",
        "Development",
        "Design"
      ]
    }
  ],
  "message": "Fields saved successfully!"
}
```



---

## PUT `/custom-fields/contacts/update_group_name`

**PUT Update Custom Field Group Name**

Rename a custom field group. All custom fields currently assigned to the old group name will be updated to use the new group name. Both names are sanitized server-side.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `CustomFieldsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `old_name` (string) **required** — The current group name to rename.
- `new_name` (string) **required** — The new group name.

Example:

```json
{
  "old_name": "Custom Profile Data",
  "new_name": "Contact Details"
}
```


**Responses**

- **200** — Group name updated successfully.

  Schema (`application/json`):

  - `fields` (array<object>) — All custom field definitions with the updated group name applied.
    - `label` (string) — Human-readable field label.
    - `slug` (string) — Unique field identifier/slug. Auto-generated from label if not provided.
    - `type` (string) _(enum: `text`, `textarea`, `number`, `select-one`, `select-multi`, `radio`, `checkbox`, `date`, `date_time`)_ — Field type.
    - `group` (string) — Field group name for organizing fields into sections.
    - `options` (array<string>) — Available options for select, radio, and checkbox field types.
  - `message` (string) — Success message.

  Example:

```json
{
  "fields": [
    {
      "label": "Company Name",
      "slug": "company_name",
      "type": "text",
      "group": "Contact Details",
      "options": []
    },
    {
      "label": "Subscription Plan",
      "slug": "subscription_plan",
      "type": "select-one",
      "group": "Contact Details",
      "options": [
        "Free",
        "Pro",
        "Enterprise"
      ]
    }
  ],
  "message": "Group name updated successfully!"
}
```



---
