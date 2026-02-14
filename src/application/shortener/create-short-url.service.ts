import { Inject, Injectable } from '@nestjs/common';
import { ShortUrl } from '../../domain/shortener';
import { IShortenerRepository, SHORTENER_REPOSITORY } from '../../domain/shortener/shortener.repository.port';

const SHORT_CODE_LENGTH = 8;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export interface CreateShortUrlCommand {
  url: string;
}

export interface CreateShortUrlResult {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
}

@Injectable()
export class CreateShortUrlService {
  constructor(
    @Inject(SHORTENER_REPOSITORY)
    private readonly repository: IShortenerRepository,
  ) {}

  async execute(command: CreateShortUrlCommand): Promise<CreateShortUrlResult> {
    const originalUrl = this.normalizeUrl(command.url);
    this.validateUrl(originalUrl);

    const shortCode = await this.generateUniqueShortCode();
    const id = crypto.randomUUID();
    const shortUrl = new ShortUrl(id, shortCode, originalUrl, new Date());

    await this.repository.save(shortUrl);

    return {
      shortCode,
      shortUrl: `/s/${shortCode}`,
      originalUrl,
    };
  }

  private normalizeUrl(url: string): string {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL');
    }
  }

  private randomShortCode(): string {
    let code = '';
    for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return code;
  }

  private async generateUniqueShortCode(): Promise<string> {
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      const code = this.randomShortCode();
      const exists = await this.repository.existsShortCode(code);
      if (!exists) return code;
    }
    throw new Error('Could not generate unique short code');
  }
}
