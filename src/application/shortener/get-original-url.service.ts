import { Inject, Injectable } from '@nestjs/common';
import { IShortenerRepository, SHORTENER_REPOSITORY } from '../../domain/shortener/shortener.repository.port';

@Injectable()
export class GetOriginalUrlService {
  constructor(
    @Inject(SHORTENER_REPOSITORY)
    private readonly repository: IShortenerRepository,
  ) {}

  async execute(shortCode: string): Promise<string | null> {
    const shortUrl = await this.repository.findByShortCode(shortCode);
    if (!shortUrl) return null;
    if (!shortUrl.active) return null;
    if (shortUrl.expiresAt != null && shortUrl.expiresAt < new Date()) return null;
    await this.repository.incrementClickCount(shortCode);
    return shortUrl.fullUrl;
  }
}
