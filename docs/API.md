# API reference

Base URL (default): `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api`

For Angular integration, suggested pages, and `HttpClient` examples, see **[ANGULAR.md](./ANGULAR.md)**.

---

## Endpoints summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/shorten` | Public* | Create a short URL |
| `GET` | `/s/:code` | Public | Redirect to original URL |
| `POST` | `/upload-image` | Public* | Upload image, get short link |
| `GET` | `/i/:code` | Public | Serve image by short code |
| `GET` | `/` | JWT (when enabled) | Hello / health |

\* Public while JWT guard is disabled for development.

---

## Create short URL

**`POST /shorten`**

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | yes | URL to shorten (max 2048). `https://` added if missing. |

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Response `200`**

```json
{
  "shortCode": "abc12XYZ",
  "shortUrl": "/s/abc12XYZ",
  "fullUrl": "https://example.com",
  "originalUrl": "https://example.com"
}
```

**Errors:** `400` invalid URL · `401` when JWT required and missing

---

## Redirect by short code

**`GET /s/:code`**

| Param | Description |
|-------|-------------|
| `code` | Short code from `POST /shorten` |

**Response:** `302` redirect to original URL  
**Errors:** `400` short link not found

```bash
curl -I http://localhost:3000/s/abc12XYZ
```

---

## Upload image

**`POST /upload-image`**

Multipart form field: **`image`** (JPEG, PNG, GIF, WebP; max 10 MB)

```bash
curl -X POST http://localhost:3000/upload-image \
  -F "image=@/path/to/photo.png"
```

**Response `200`**

```json
{
  "shortCode": "TNpQ1OAC",
  "imageUrl": "/i/TNpQ1OAC",
  "contentType": "image/png",
  "originalFileName": "photo.png"
}
```

Files are stored under `IMAGE_UPLOAD_ROOT` (default `./uploads/images`). Metadata is saved in the `image_uploads` table.

**Errors:** `400` missing file, invalid type, or too large · `401` when JWT required

---

## Serve image by short code

**`GET /i/:code`**

| Param | Description |
|-------|-------------|
| `code` | Short code from `POST /upload-image` |

**Response:** image bytes with matching `Content-Type`  
**Errors:** `404` unknown code or file missing on disk

```bash
# Browser
open http://localhost:3000/i/TNpQ1OAC
```

---

## Quick flows

**URL shortener**

1. `POST /shorten` → get `shortUrl`
2. Open `http://localhost:3000/s/<shortCode>` → redirected to original URL

**Image short link**

1. `POST /upload-image` → get `imageUrl`
2. Open `http://localhost:3000/i/<shortCode>` → image displayed
