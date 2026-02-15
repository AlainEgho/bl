import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuthUser } from './validate-token.guard';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserService {
  constructor(
    @Inject(REQUEST) private readonly request: Request & { user?: AuthUser },
  ) {}

  getUserId(): number | null {
    return this.request.user?.userId ?? null;
  }

  getEmail(): string | null {
    return this.request.user?.email ?? null;
  }

  getUser(): AuthUser | null {
    return this.request.user ?? null;
  }
}
