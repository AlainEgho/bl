import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortenerController } from './shortener.controller';
import { CreateShortUrlService } from '../application/shortener/create-short-url.service';
import { GetOriginalUrlService } from '../application/shortener/get-original-url.service';
import { ShortenerTypeOrmRepository } from '../infrastructure/shortener/shortener-typeorm.repository';
import { ShortUrlModel } from '../infrastructure/shortener/entities/short-url.model';
import { SHORTENER_REPOSITORY } from '../domain/shortener/shortener.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([ShortUrlModel])],
  controllers: [ShortenerController],
  providers: [
    CreateShortUrlService,
    GetOriginalUrlService,
    {
      provide: SHORTENER_REPOSITORY,
      useClass: ShortenerTypeOrmRepository,
    },
  ],
})
export class ShortenerModule {}
