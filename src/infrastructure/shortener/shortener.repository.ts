import { ShortUrl } from '../../domain/shortener';
import { IShortenerRepository } from '../../domain/shortener/shortener.repository.port';

export class ShortenerRepository implements IShortenerRepository {
  private readonly store = new Map<string, ShortUrl>();
  private readonly byCode = new Map<string, ShortUrl>();

  async save(shortUrl: ShortUrl): Promise<ShortUrl> {
    this.store.set(shortUrl.id, shortUrl);
    this.byCode.set(shortUrl.shortCode, shortUrl);
    return shortUrl;
  }

  async findByShortCode(shortCode: string): Promise<ShortUrl | null> {
    return this.byCode.get(shortCode) ?? null;
  }

  async existsShortCode(shortCode: string): Promise<boolean> {
    return this.byCode.has(shortCode);
  }
}
