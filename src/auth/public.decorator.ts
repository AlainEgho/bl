import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Use on routes that should skip token validation (e.g. redirect /s/:code, health).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
