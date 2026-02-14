import { Module } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { CreateShortUrlService } from '../application/shortener/create-short-url.service';
import { GetOriginalUrlService } from '../application/shortener/get-original-url.service';
import { ShortenerRepository } from '../infrastructure/shortener/shortener.repository';
import { SHORTENER_REPOSITORY } from '../domain/shortener/shortener.repository.port';

@Module({
  controllers: [ShortenerController],
  providers: [
    CreateShortUrlService,
    GetOriginalUrlService,
    {
      provide: SHORTENER_REPOSITORY,
      useClass: ShortenerRepository,
    },
  ],
})
export class ShortenerModule {}
