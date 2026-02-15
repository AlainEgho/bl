import { Inject, Injectable } from '@nestjs/common';
import { ShortUrl } from '../../domain/shortener';
import { IShortenerRepository, SHORTENER_REPOSITORY } from '../../domain/shortener/shortener.repository.port';
import { CurrentUserService } from '../../auth/current-user.service';

const SHORT_CODE_LENGTH = 8;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export interface CreateShortUrlCommand {
  url: string;
  expiresAt?: Date | null;
  userId?: number | null;
}

export interface CreateShortUrlResult {
  shortCode: string;
  shortUrl: string;
  fullUrl: string;
}

@Injectable()
export class CreateShortUrlService {
  constructor(
    @Inject(SHORTENER_REPOSITORY)
    private readonly repository: IShortenerRepository,
    private readonly currentUser: CurrentUserService,
  ) {}

  async execute(command: CreateShortUrlCommand): Promise<CreateShortUrlResult> {
    const fullUrl = this.normalizeUrl(command.url);
    this.validateUrl(fullUrl);

    const shortCode = await this.generateUniqueShortCode();
    const now = new Date();
    const userId = command.userId ?? this.currentUser.getUserId() ?? null;
    const data: Omit<ShortUrl, 'id'> = {
      shortCode,
      fullUrl,
      userId,
      clickCount: 0,
      createdAt: now,
      expiresAt: command.expiresAt ?? null,
      active: true,
    };

    await this.repository.save(data);

    return {
      shortCode,
      shortUrl: `/s/${shortCode}`,
      fullUrl,
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
