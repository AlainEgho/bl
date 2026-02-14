import { ShortUrl } from './short-url.entity';

export const SHORTENER_REPOSITORY = Symbol('SHORTENER_REPOSITORY');

export interface IShortenerRepository {
  save(shortUrl: Omit<ShortUrl, 'id'>): Promise<ShortUrl>;
  findByShortCode(shortCode: string): Promise<ShortUrl | null>;
  existsShortCode(shortCode: string): Promise<boolean>;
  incrementClickCount(shortCode: string): Promise<void>;
}
