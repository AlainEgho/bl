# API request/response logging

All HTTP requests and responses are logged for debugging and auditing.

## Console output

- **REQUEST** (debug): method, URL, query, body, headers (sensitive ones redacted), IP, user-agent.
- **RESPONSE** (debug): method, URL, status code, duration (ms), response body.
- **One-line summary** (info): `METHOD /path STATUS DURATIONms`.

Set `LOG_LEVEL=debug` (default) to see full request/response in the console. Use `LOG_LEVEL=info` to see only the one-line summary.

## File output

When `LOG_TO_FILE=true` (default), each log entry is also appended to a file as JSON.

| Env var       | Default  | Description              |
|---------------|----------|--------------------------|
| `LOG_TO_FILE` | `true`   | Set to `false` to disable file logging. |
| `LOG_DIR`     | `logs`   | Directory for log files (relative to project root). |
| `LOG_FILE`    | `api.log` | Log file name.          |
| `LOG_LEVEL`   | `debug`  | `error`, `warn`, `info`, `debug`. |

Example `.env`:

```env
LOG_LEVEL=debug
LOG_TO_FILE=true
LOG_DIR=logs
LOG_FILE=api.log
```

Log file path: `logs/api.log` (or `LOG_DIR/LOG_FILE`). The `logs/` directory is created automatically and is in `.gitignore`.

## Changing behavior later

- To log only to console: set `LOG_TO_FILE=false`.
- To reduce console noise: set `LOG_LEVEL=info` (file still gets all levels if you change the logger).
- To change the file path: set `LOG_DIR` and/or `LOG_FILE`.
- Sensitive headers (`authorization`, `cookie`) are always redacted in logs.
