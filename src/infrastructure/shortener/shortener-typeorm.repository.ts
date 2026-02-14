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

  async save(data: Omit<ShortUrl, 'id'>): Promise<ShortUrl> {
    const model = this.repo.create({
      shortCode: data.shortCode,
      fullUrl: data.fullUrl,
      user: data.userId != null ? { id: data.userId } : null,
      clickCount: data.clickCount,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt ?? null,
      active: data.active,
    });
    const saved = await this.repo.save(model);
    return this.toDomain(saved);
  }

  async findByShortCode(shortCode: string): Promise<ShortUrl | null> {
    const model = await this.repo.findOne({
      where: { shortCode },
      relations: ['user'],
    });
    if (!model) return null;
    return this.toDomain(model);
  }

  async existsShortCode(shortCode: string): Promise<boolean> {
    const count = await this.repo.count({ where: { shortCode } });
    return count > 0;
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    await this.repo.increment({ shortCode }, 'clickCount', 1);
  }

  private toDomain(model: ShortUrlModel): ShortUrl {
    const user = model.user as { id?: number } | null | undefined;
    const userId = user?.id ?? null;
    return new ShortUrl(
      model.id,
      model.shortCode,
      model.fullUrl,
      userId,
      model.clickCount,
      model.createdAt,
      model.expiresAt,
      model.active,
    );
  }
}
