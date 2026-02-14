# URL Shortener API

Base URL (default): `http://localhost:3000`

---

## Create short URL

Creates a short link for a given URL.

**Endpoint:** `POST /shorten`

**Request body:**

| Field | Type   | Required | Description                    |
|-------|--------|----------|--------------------------------|
| url   | string | yes      | The URL to shorten (max 2048). |

**Example request:**

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Example response (200):**

```json
{
  "shortCode": "abc12XYZ",
  "shortUrl": "/s/abc12XYZ",
  "originalUrl": "https://example.com"
}
```

**Notes:**

- If `url` does not start with `http://` or `https://`, `https://` is added.
- `shortUrl` is the path only; prepend your base URL (e.g. `http://localhost:3000`) to get the full link.

**Error responses:**

- **400** – Invalid or missing URL (e.g. `{"url": "not-a-url"}`).
- **400** – Validation failed (e.g. empty body or invalid JSON).

---

## Redirect by short code

Redirects the client to the original URL for a given short code.

**Endpoint:** `GET /s/:code`

**Parameters:**

| Name | Type   | Description   |
|------|--------|---------------|
| code | string | Short code.   |

**Example request:**

```bash
curl -I http://localhost:3000/s/abc12XYZ
```

**Response:**

- **302** – Redirect to the original URL (`Location` header set).
- **400** – Short link not found (invalid or unknown `code`).

**Example (browser or follow redirects):**

Open in browser: `http://localhost:3000/s/abc12XYZ` → you are redirected to the original URL.

---

## Quick usage flow

1. Create a short link:
   ```bash
   curl -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d "{\"url\": \"https://example.com\"}"
   ```
2. Use the returned `shortUrl` (e.g. `/s/abc12XYZ`) as path, or open `http://localhost:3000/s/abc12XYZ` to be redirected.
