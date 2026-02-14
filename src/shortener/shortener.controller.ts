import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { CreateShortUrlService } from '../application/shortener/create-short-url.service';
import { GetOriginalUrlService } from '../application/shortener/get-original-url.service';

@Controller()
export class ShortenerController {
  constructor(
    private readonly createShortUrl: CreateShortUrlService,
    private readonly getOriginalUrl: GetOriginalUrlService,
  ) {}

  @Post('shorten')
  async shorten(@Body() dto: CreateShortUrlDto) {
    try {
      return await this.createShortUrl.execute({ url: dto.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid request';
      throw new BadRequestException(message);
    }
  }

  @Get('s/:code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const originalUrl = await this.getOriginalUrl.execute(code);
    if (!originalUrl) {
      throw new BadRequestException('Short link not found');
    }
    return res.redirect(302, originalUrl);
  }
}
