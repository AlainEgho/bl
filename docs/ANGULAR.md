# Angular frontend integration

Guide for building and testing the Angular app against the Shortener API (URL shortener + image short links).

---

## Stack overview

| Component | URL | Port |
|-----------|-----|------|
| NestJS API | `http://localhost:3000` | 3000 |
| Angular app | `http://localhost:4200` | 4200 |
| Swagger (API docs) | `http://localhost:3000/api` | 3000 |

CORS is enabled for `http://localhost:4200` with credentials. Start the API before the Angular app.

```bash
# Terminal 1 – API
npm run start:dev

# Terminal 2 – Angular (when frontend/ exists)
cd frontend && npm start
```

---

## API endpoints (full list)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/shorten` | Public* | Create a short URL |
| `GET` | `/s/:code` | Public | Redirect to the original URL (302) |
| `POST` | `/upload-image` | Public* | Upload an image, get a short link |
| `GET` | `/i/:code` | Public | Serve the image file |
| `GET` | `/` | JWT (when enabled) | Health / hello endpoint |
| `GET` | `/api` | — | Swagger UI (not for Angular `HttpClient`) |

\* JWT is currently disabled for development. When re-enabled, send `Authorization: Bearer <token>` on `POST /shorten` and `POST /upload-image`. Redirect and image serve stay public.

---

## URL shortener

### Create short link — `POST /shorten`

**Request**

```http
POST /shorten
Content-Type: application/json

{
  "url": "https://example.com"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `url` | string | yes | Valid URL, max 2048 chars. `https://` is added if missing. |

**Response `200`**

```json
{
  "shortCode": "mIE94Gom",
  "shortUrl": "/s/mIE94Gom",
  "fullUrl": "https://example.com",
  "originalUrl": "https://example.com"
}
```

| Field | Description |
|-------|-------------|
| `shortCode` | Unique code for the link |
| `shortUrl` | Path only — prepend API base URL for the full link |
| `fullUrl` / `originalUrl` | Normalized destination URL |

**Full short link for sharing**

```
http://localhost:3000/s/mIE94Gom
```

**Errors**

| Status | When |
|--------|------|
| `400` | Invalid URL, empty body, validation failed |
| `401` | Missing/invalid JWT (when auth is enabled) |

---

### Redirect — `GET /s/:code`

Opens the original URL. Returns **302** with `Location` header.

**Angular note:** Use `window.open(apiUrl + shortUrl)` or an `<a [href]="fullShortUrl">` — do not call this with `HttpClient` expecting JSON.

```html
<a [href]="apiBaseUrl + result.shortUrl" target="_blank">Open short link</a>
```

**Errors**

| Status | When |
|--------|------|
| `400` | Short code not found |

---

## Image short links

### Upload image — `POST /upload-image`

**Request**

```http
POST /upload-image
Content-Type: multipart/form-data

image: <file>
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `image` | file | yes | JPEG, PNG, GIF, or WebP; max 10 MB |

**Response `200`**

```json
{
  "shortCode": "TNpQ1OAC",
  "imageUrl": "/i/TNpQ1OAC",
  "contentType": "image/png",
  "originalFileName": "photo.png"
}
```

**Full image link for sharing**

```
http://localhost:3000/i/TNpQ1OAC
```

**Errors**

| Status | When |
|--------|------|
| `400` | No file, wrong type, or file too large |
| `401` | Missing/invalid JWT (when auth is enabled) |

---

### Serve image — `GET /i/:code`

Returns the image bytes with the correct `Content-Type`. Use directly in `<img>`:

```html
<img [src]="apiBaseUrl + result.imageUrl" [alt]="result.originalFileName" />
```

**Errors**

| Status | When |
|--------|------|
| `404` | Unknown code or missing file on disk |

---

## Suggested Angular pages (for testing)

Use these routes when building the `frontend/` app. Each page maps to one API feature.

| Route | Page name | Purpose | API used |
|-------|-----------|---------|----------|
| `/` | Home | Links to all test pages, API status | `GET /` (optional) |
| `/shorten` | URL Shortener | Form: paste URL → show short link + copy button | `POST /shorten` |
| `/shorten/test` | Test redirect | Input short code or open last created link | `GET /s/:code` (browser navigation) |
| `/images/upload` | Image upload | File picker, preview, upload, show link | `POST /upload-image` |
| `/images/view/:code` | Image viewer | Display image by code from route param | `GET /i/:code` (via `<img src>`) |
| `/images/view` | Image lookup | Input short code → navigate to viewer | — |
| `/docs` | API docs (optional) | iframe or link to Swagger | `http://localhost:3000/api` |

### Example `app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'shorten', loadComponent: () => import('./pages/shorten/shorten.component').then(m => m.ShortenComponent) },
  { path: 'shorten/test', loadComponent: () => import('./pages/shorten-test/shorten-test.component').then(m => m.ShortenTestComponent) },
  { path: 'images/upload', loadComponent: () => import('./pages/image-upload/image-upload.component').then(m => m.ImageUploadComponent) },
  { path: 'images/view', loadComponent: () => import('./pages/image-lookup/image-lookup.component').then(m => m.ImageLookupComponent) },
  { path: 'images/view/:code', loadComponent: () => import('./pages/image-view/image-view.component').then(m => m.ImageViewComponent) },
  { path: '**', redirectTo: '' },
];
```

---

## Angular setup

### Environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
};
```

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-api.example.com',
};
```

### TypeScript models

```typescript
// src/app/models/shortener.model.ts
export interface CreateShortUrlRequest {
  url: string;
}

export interface CreateShortUrlResponse {
  shortCode: string;
  shortUrl: string;
  fullUrl: string;
  originalUrl: string;
}

// src/app/models/image.model.ts
export interface UploadImageResponse {
  shortCode: string;
  imageUrl: string;
  contentType: string;
  originalFileName: string | null;
}
```

### API service

```typescript
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateShortUrlRequest, CreateShortUrlResponse } from '../models/shortener.model';
import { UploadImageResponse } from '../models/image.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  /** Optional: attach JWT when auth is re-enabled */
  private authHeaders(): HttpHeaders | undefined {
    const token = localStorage.getItem('access_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  createShortUrl(body: CreateShortUrlRequest): Observable<CreateShortUrlResponse> {
    return this.http.post<CreateShortUrlResponse>(
      `${this.base}/shorten`,
      body,
      { headers: this.authHeaders() },
    );
  }

  uploadImage(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<UploadImageResponse>(
      `${this.base}/upload-image`,
      formData,
      { headers: this.authHeaders() },
    );
  }

  /** Full URL for redirect links (open in browser or new tab) */
  shortLinkUrl(shortUrl: string): string {
    return `${this.base}${shortUrl}`;
  }

  /** Full URL for <img [src]> */
  imageUrl(imageUrl: string): string {
    return `${this.base}${imageUrl}`;
  }
}
```

Register `HttpClient` in `app.config.ts`:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig = {
  providers: [provideHttpClient()],
};
```

### URL shortener component (example)

```typescript
// shorten.component.ts (simplified)
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CreateShortUrlResponse } from '../../models/shortener.model';

@Component({
  selector: 'app-shorten',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1>URL Shortener</h1>
    <input [(ngModel)]="url" placeholder="https://example.com" />
    <button (click)="submit()" [disabled]="!url">Shorten</button>

    @if (result) {
      <p>Short link: <a [href]="api.shortLinkUrl(result.shortUrl)" target="_blank">
        {{ api.shortLinkUrl(result.shortUrl) }}
      </a></p>
      <p>Code: {{ result.shortCode }}</p>
    }
  `,
})
export class ShortenComponent {
  url = '';
  result: CreateShortUrlResponse | null = null;

  constructor(readonly api: ApiService) {}

  submit(): void {
    this.api.createShortUrl({ url: this.url }).subscribe({
      next: (res) => (this.result = res),
      error: (err) => console.error(err),
    });
  }
}
```

### Image upload component (example)

```typescript
// image-upload.component.ts (simplified)
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UploadImageResponse } from '../../models/image.model';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  template: `
    <h1>Image upload</h1>
    <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" (change)="onFile($event)" />
    @if (preview) {
      <img [src]="preview" alt="Preview" style="max-width: 300px" />
    }
    <button (click)="upload()" [disabled]="!file">Upload</button>

    @if (result) {
      <p>Image link: <a [href]="api.imageUrl(result.imageUrl)" target="_blank">
        {{ api.imageUrl(result.imageUrl) }}
      </a></p>
      <img [src]="api.imageUrl(result.imageUrl)" [alt]="result.originalFileName ?? 'Uploaded'" />
    }
  `,
})
export class ImageUploadComponent {
  file: File | null = null;
  preview: string | null = null;
  result: UploadImageResponse | null = null;

  constructor(readonly api: ApiService) {}

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
    this.result = null;
    if (this.file) {
      this.preview = URL.createObjectURL(this.file);
    }
  }

  upload(): void {
    if (!this.file) return;
    this.api.uploadImage(this.file).subscribe({
      next: (res) => (this.result = res),
      error: (err) => console.error(err),
    });
  }
}
```

**Important:** Do not set `Content-Type` manually on `FormData` requests — the browser sets the multipart boundary.

---

## Manual testing checklist

### URL shortener

- [ ] `POST /shorten` with valid URL → receive `shortCode` and `shortUrl`
- [ ] `POST /shorten` with `example.com` (no scheme) → `https://` added
- [ ] `POST /shorten` with invalid URL → `400`
- [ ] Open `http://localhost:3000/s/<shortCode>` in browser → redirects to original site
- [ ] Angular `/shorten` page: submit form, copy link, open in new tab

### Image short links

- [ ] `POST /upload-image` with PNG/JPEG → receive `imageUrl`
- [ ] `POST /upload-image` without file → `400`
- [ ] `POST /upload-image` with non-image file → `400`
- [ ] Open `http://localhost:3000/i/<shortCode>` → image displays
- [ ] Angular `/images/upload`: pick file, preview, upload, image renders
- [ ] Angular `/images/view/:code`: load page with known code → image renders

### curl quick tests

```bash
# Shorten
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Redirect (follow or check Location header)
curl -I http://localhost:3000/s/<shortCode>

# Upload image
curl -X POST http://localhost:3000/upload-image \
  -F "image=@/path/to/photo.png"

# View image
curl -o out.png http://localhost:3000/i/<shortCode>
```

---

## Auth (when re-enabled)

When JWT validation is turned back on:

1. Store the token after login (e.g. `localStorage.setItem('access_token', token)`).
2. Send `Authorization: Bearer <token>` on `POST /shorten` and `POST /upload-image`.
3. `GET /s/:code` and `GET /i/:code` remain public.

See [AUTH.md](./AUTH.md) for backend auth details.

---

## Related docs

- [API.md](./API.md) — REST reference (shortener + images)
- [AUTH.md](./AUTH.md) — JWT validation flow
- [MYSQL.md](./MYSQL.md) — Database setup
- [LOGGING.md](./LOGGING.md) — Request logging
