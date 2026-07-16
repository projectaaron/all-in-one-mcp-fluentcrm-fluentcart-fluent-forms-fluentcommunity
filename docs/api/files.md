# FluentCart API — Files

5 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [API index](./README.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## DELETE `/files/delete`

**DELETE Delete File**

Delete a file from the specified storage driver. For the local driver, this requires the `manage_options` WordPress capability.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `file_path` | string | yes | The path of the file to delete (relative to the storage directory). |
| `driver` | string | yes | Storage driver where the file is stored (e.g., `local`, `s3`). |
| `bucket` | string | no | The bucket name (required for cloud storage drivers). |


**Responses**

- **200** — File deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message
  - `driver` (string) — Storage driver used
  - `path` (string) — Path of the deleted file

  Example:

```json
{
  "message": "File Deleted Successfully",
  "driver": "local",
  "path": "my-ebook__fluent-cart__.1710345600.pdf"
}
```


- **403** — Permission denied.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "You are not allowed to delete file"
}
```


- **404** — File not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "File not found"
}
```



---

## GET `/files/bucket-list`

**GET Get Bucket List**

Retrieve the list of available storage buckets for a given driver. Useful for cloud storage drivers (e.g., S3) that organize files into buckets.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `driver` | string | no | Storage driver to query (default: uses the first active driver). |


**Responses**

- **200** — Successful response. Returns default bucket and list of available buckets.

  Schema (`application/json`):

  - `default_bucket` (string) — The default bucket name
  - `buckets` (array<Bucket>)

  Example:

```json
{
  "default_bucket": "my-store-files",
  "buckets": [
    {
      "label": "my-store-files",
      "value": "my-store-files"
    },
    {
      "label": "my-store-backups",
      "value": "my-store-backups"
    }
  ]
}
```



---

## GET `/files`

**GET List Files**

Retrieve a list of files from the specified storage driver. Returns file metadata including name, size, driver, and bucket information.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `driver` | string | no | Storage driver to use (default: `local`). Supported values depend on configured storage drivers (e.g., `local`, `s3`). |
| `search` | string | no | Filter files by name (case-insensitive substring match). |
| `per_page` | integer | no | Maximum number of files to return (default: `10`). |


**Responses**

- **200** — Successful response. Returns a list of files.

  Schema (`application/json`):

  - `files` (array<File>)

  Example:

```json
{
  "files": [
    {
      "name": "ebook__fluent-cart__.1710345600.pdf",
      "size": 2048576,
      "driver": "local",
      "bucket": ""
    },
    {
      "name": "software-v2__fluent-cart__.1710345700.zip",
      "size": 10485760,
      "driver": "local",
      "bucket": ""
    }
  ]
}
```



---

## POST `/upload-editor-file`

**POST Upload Editor File**

Upload an image file for use in the content editor (e.g., product descriptions). The image is uploaded to the WordPress Media Library via `media_handle_upload`. Only image files are accepted.

**Auth:** ApplicationPasswords

**Request body** (`multipart/form-data`, required)

- _$ref: UploadEditorFileRequest_

**Responses**

- **200** — Image uploaded successfully. Returns WordPress attachment data.

  Schema (`application/json`):

  - _$ref: WordPressAttachment_

  Example:

```json
{
  "id": 456,
  "title": "product-banner",
  "filename": "product-banner.jpg",
  "url": "https://example.com/wp-content/uploads/2025/01/product-banner.jpg",
  "link": "https://example.com/?attachment_id=456",
  "alt": "",
  "author": "1",
  "description": "",
  "caption": "",
  "name": "product-banner",
  "status": "inherit",
  "uploadedTo": 0,
  "date": "2025-01-15T12:00:00.000Z",
  "modified": "2025-01-15T12:00:00.000Z",
  "menuOrder": 0,
  "mime": "image/jpeg",
  "type": "image",
  "subtype": "jpeg",
  "icon": "https://example.com/wp-includes/images/media/default.png",
  "dateFormatted": "January 15, 2025",
  "filesizeInBytes": 204800,
  "filesizeHumanReadable": "200 KB",
  "sizes": {
    "thumbnail": {
      "url": "https://example.com/wp-content/uploads/2025/01/product-banner-150x150.jpg",
      "height": 150,
      "width": 150
    },
    "medium": {
      "url": "https://example.com/wp-content/uploads/2025/01/product-banner-300x200.jpg",
      "height": 200,
      "width": 300
    },
    "full": {
      "url": "https://example.com/wp-content/uploads/2025/01/product-banner.jpg",
      "height": 800,
      "width": 1200
    }
  },
  "height": 800,
  "width": 1200
}
```


- **400** — Bad request - non-image file or no file attached.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "success": false,
  "data": {
    "message": "Invalid request. Please check your input and try again."
  }
}
```



---

## POST `/files/upload`

**POST Upload File**

Upload a downloadable file to the specified storage driver. The file is stored with a unique name appended with a timestamp to prevent collisions.

**Auth:** ApplicationPasswords

**Request body** (`multipart/form-data`, required)

- _$ref: UploadFileRequest_

**Responses**

- **200** — File uploaded successfully.

  Schema (`application/json`):

  - `message` (string) — Success message
  - `path` (string) — Uploaded file path with timestamp
  - `file` (File)

  Example:

```json
{
  "message": "File Uploaded Successfully",
  "path": "my-ebook__fluent-cart__.1710345600.pdf",
  "file": {
    "driver": "local",
    "size": 2048576,
    "name": "my-ebook__fluent-cart__.1710345600.pdf",
    "bucket": ""
  }
}
```


- **400** — Bad request - validation error or file empty.

  Schema (`application/json`):

  - `message` (string) — Error message
  - `additional` (string) — Additional error information

  Example:

```json
{
  "message": "Failed To Upload File",
  "additional": "File is empty"
}
```



---
