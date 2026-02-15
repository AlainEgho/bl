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
import { IS_PUBLIC_KEY } from './public.decorator';

export const AUTH_VALIDATE_TOKEN_URL = 'AUTH_VALIDATE_TOKEN_URL';

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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.getToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const url =
      this.config.get<string>(AUTH_VALIDATE_TOKEN_URL) ||
      'http://localhost:8081/api/auth/validate-token';

    try {
      const { data } = await axios.get<ValidateTokenResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      });

      if (!data?.data?.valid) {
        throw new UnauthorizedException('Token is invalid or expired');
      }

      (request as Request & { user: AuthUser }).user = {
        userId: data.data.userId,
        email: data.data.email,
      };
      return true;
    } catch (err: unknown) {
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
