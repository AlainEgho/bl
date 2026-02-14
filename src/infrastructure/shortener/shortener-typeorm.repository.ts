import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortUrl } from '../../domain/shortener';
import { IShortenerRepository } from '../../domain/shortener/shortener.repository.port';
import { ShortUrlModel } from './entities/short-url.model';

@Injectable()
export class ShortenerTypeOrmRepository implements IShortenerRepository {
  constructor(
    @InjectRepository(ShortUrlModel)
    private readonly repo: Repository<ShortUrlModel>,
  ) {}

  async save(shortUrl: ShortUrl): Promise<ShortUrl> {
    const model: ShortUrlModel = {
      id: shortUrl.id,
      shortCode: shortUrl.shortCode,
      originalUrl: shortUrl.originalUrl,
      createdAt: shortUrl.createdAt,
    };
    await this.repo.save(model);
    return shortUrl;
  }

  async findByShortCode(shortCode: string): Promise<ShortUrl | null> {
    const model = await this.repo.findOne({ where: { shortCode } });
    if (!model) return null;
    return new ShortUrl(
      model.id,
      model.shortCode,
      model.originalUrl,
      model.createdAt,
    );
  }

  async existsShortCode(shortCode: string): Promise<boolean> {
    const count = await this.repo.count({ where: { shortCode } });
    return count > 0;
  }
}
