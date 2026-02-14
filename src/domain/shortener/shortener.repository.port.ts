import { ShortUrl } from './short-url.entity';

export const SHORTENER_REPOSITORY = Symbol('SHORTENER_REPOSITORY');

export interface IShortenerRepository {
  save(shortUrl: ShortUrl): Promise<ShortUrl>;
  findByShortCode(shortCode: string): Promise<ShortUrl | null>;
  existsShortCode(shortCode: string): Promise<boolean>;
}
