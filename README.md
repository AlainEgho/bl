# shortener

A NestJS URL shortener with clean architecture and an Angular frontend.

## Project layout

- **Root** – NestJS API (port 3000)
- **frontend/** – Angular app (port 4200)

## Setup

**Backend (NestJS):**
```bash
npm install
```

**MySQL (required for the API):**  
Install MySQL and create a database named `shortener`. Copy `.env.example` to `.env` and set your DB credentials. See [docs/MYSQL.md](docs/MYSQL.md) for install steps.

**Frontend (Angular):**
```bash
cd frontend && npm install
```

## Run

**1. Start the API** (from project root):
```bash
npm run start:dev
```
API: **http://localhost:3000**

**2. Start the Angular app** (in another terminal):
```bash
cd frontend && npm start
```
UI: **http://localhost:4200**

Use the UI to shorten URLs; it talks to the API. CORS is enabled for `http://localhost:4200`.

## Tests

```bash
# run all unit tests
npm test

# run tests in watch mode
npm run test:watch

# run tests with coverage
npm run test:cov
```

Coverage report is generated in the `coverage/` directory (open `coverage/lcov-report/index.html` in a browser).

## Documentation

- **[docs/API.md](docs/API.md)** – API reference: create short URL and redirect by short code.
- **[docs/LOGGING.md](docs/LOGGING.md)** – Request/response logging (console + file, configurable).

## API overview

| Method | Path        | Description                |
|--------|-------------|----------------------------|
| POST   | `/shorten`  | Create a short URL          |
| GET    | `/s/:code`  | Redirect to original URL   |

Example: create a short link and use it:

```bash
# Create
curl -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d "{\"url\": \"https://example.com\"}"

# Redirect (use the shortCode from the response in the path)
# Open in browser: http://localhost:3000/s/<shortCode>
```
