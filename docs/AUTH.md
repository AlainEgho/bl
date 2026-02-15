# Token validation and current user

Every request (except those marked `@Public()`) is validated against your auth API before the controller runs.

## Flow

1. **Request** includes header: `Authorization: Bearer <token>`.
2. **ValidateTokenGuard** calls `GET http://localhost:8081/api/auth/validate-token` with that header.
3. If the response has **`data.valid === false`** → request is rejected with **401 Unauthorized**.
4. If **`data.valid === true`** → **`userId`** and **`email`** from `data` are stored on the request and the request continues.
5. **CurrentUserService** (injectable in any service) exposes **`getUserId()`** and **`getEmail()`** for the current request.

## Using the current user in services

Inject **CurrentUserService** and read the validated user:

```ts
import { CurrentUserService } from '../auth/current-user.service';

@Injectable()
export class SomeService {
  constructor(private readonly currentUser: CurrentUserService) {}

  doSomething() {
    const userId = this.currentUser.getUserId();   // number | null
    const email = this.currentUser.getEmail();    // string | null
    const user = this.currentUser.getUser();      // { userId, email } | null
  }
}
```

**CreateShortUrlService** already uses it: new short links get the current user’s **userId** when the token is valid.

## Public routes

Routes that must work **without** a token (e.g. redirect for short links) are marked with **`@Public()`**:

```ts
import { Public } from '../auth/public.decorator';

@Public()
@Get('s/:code')
async redirect(...) { ... }
```

Currently **`GET /s/:code`** is public so redirects work without auth.

## Configuration

Optional in `.env`:

- **AUTH_VALIDATE_TOKEN_URL** – default: `http://localhost:8081/api/auth/validate-token`

Your auth API must return JSON like:

```json
{
  "success": true,
  "message": "Token validation result",
  "data": {
    "valid": true,
    "userId": 1,
    "email": "admin@example.com"
  }
}
```

If **`data.valid`** is `false` or the request fails, the guard returns **401**.
