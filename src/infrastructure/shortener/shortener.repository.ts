import { ShortUrl } from '../../domain/shortener';
import { IShortenerRepository } from '../../domain/shortener/shortener.repository.port';

export class ShortenerRepository implements IShortenerRepository {
  private readonly store = new Map<number, ShortUrl>();
  private readonly byCode = new Map<string, ShortUrl>();
  private nextId = 1;

  async save(data: Omit<ShortUrl, 'id'>): Promise<ShortUrl> {
    const id = this.nextId++;
    const shortUrl = new ShortUrl(
      id,
      data.shortCode,
      data.fullUrl,
      data.userId,
      data.clickCount,
      data.createdAt,
      data.expiresAt,
      data.active,
    );
    this.store.set(id, shortUrl);
    this.byCode.set(data.shortCode, shortUrl);
    return shortUrl;
  }

  async findByShortCode(shortCode: string): Promise<ShortUrl | null> {
    return this.byCode.get(shortCode) ?? null;
  }

  async existsShortCode(shortCode: string): Promise<boolean> {
    return this.byCode.has(shortCode);
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    const existing = this.byCode.get(shortCode);
    if (existing) {
      const updated = new ShortUrl(
        existing.id,
        existing.shortCode,
        existing.fullUrl,
        existing.userId,
        existing.clickCount + 1,
        existing.createdAt,
        existing.expiresAt,
        existing.active,
      );
      this.store.set(existing.id, updated);
      this.byCode.set(shortCode, updated);
    }
  }
}
