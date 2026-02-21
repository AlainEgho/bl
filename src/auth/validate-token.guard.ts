import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import axios from 'axios';
import * as https from 'node:https';
import { IS_PUBLIC_KEY } from './public.decorator';

export const AUTH_VALIDATE_TOKEN_URL = 'AUTH_VALIDATE_TOKEN_URL';
/** Set to '1' or 'true' to skip TLS verification for HTTPS auth URL (e.g. self-signed certs). Dev only. */
export const AUTH_VALIDATE_INSECURE_SSL = 'false';

export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  data: {
    valid: boolean;
    userId: number;
    email: string;
  };
}

export interface AuthUser {
  userId: number;
  email: string;
}

@Injectable()
export class ValidateTokenGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    console.log('[ValidateTokenGuard] 1. Entry', {
      path: request.path,
      method: request.method,
    });

    if (request.path?.startsWith('/api')) {
      console.log('[ValidateTokenGuard] 2. Skip: path starts with /api');
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      console.log('[ValidateTokenGuard] 3. Skip: route is @Public()');
      return true;
    }

    const token = this.getToken(request);
    console.log('[ValidateTokenGuard] 4. Token', {
      present: !!token,
      length: token?.length ?? 0,
    });
    if (!token) {
      console.log('[ValidateTokenGuard] 4b. Reject: missing token');
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const url =
      this.config.get<string>(AUTH_VALIDATE_TOKEN_URL) ||
      'https://localhost:8081/api/auth/validate-token';
    const insecure =true;
    const httpsAgent =
      url.startsWith('https://') && insecure
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined;
    console.log('[ValidateTokenGuard] 5. Config', {
      url,
      insecureSSL: insecure,
      usingHttpsAgent: !!httpsAgent,
    });

    try {
      console.log('[ValidateTokenGuard] 6. Calling auth API...');
      const { data } = await axios.get<ValidateTokenResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
        httpsAgent,
      });

      console.log('[ValidateTokenGuard] 7. Auth response', {
        success: data?.success,
        valid: data?.data?.valid,
        userId: data?.data?.userId,
        email: data?.data?.email ? '(set)' : '(missing)',
      });

      if (!data?.data?.valid) {
        console.log('[ValidateTokenGuard] 7b. Reject: data.valid is false');
        throw new UnauthorizedException('Token is invalid or expired');
      }

      (request as Request & { user: AuthUser }).user = {
        userId: data.data.userId,
        email: data.data.email,
      };
      console.log('[ValidateTokenGuard] 8. Success: user attached to request');
      return true;
    } catch (err: unknown) {
      const causeMessage =
        err instanceof Error &&
        'cause' in err &&
        err.cause instanceof Error
          ? err.cause.message
          : undefined;
      console.log('[ValidateTokenGuard] 9. Catch', {
        isUnauthorized: err instanceof UnauthorizedException,
        message: err instanceof Error ? err.message : String(err),
        cause: causeMessage,
        axiosResponse: axios.isAxiosError(err)
          ? { status: err.response?.status, data: err.response?.data }
          : undefined,
      });
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException(
        'Token validation failed',
        { cause: err as Error },
      );
    }
  }

  private getToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return null;
  }
}
