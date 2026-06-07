import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { CreateShortUrlService } from '../application/shortener/create-short-url.service';
import { GetOriginalUrlService } from '../application/shortener/get-original-url.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Shortener')
@Controller()
export class ShortenerController {
  constructor(
    private readonly createShortUrl: CreateShortUrlService,
    private readonly getOriginalUrl: GetOriginalUrlService,
  ) {}

  @Public()
  @Post('shorten')
  @ApiOperation({ summary: 'Create a short URL' })
  async shorten(@Body() dto: CreateShortUrlDto) {
    try {
      const result = await this.createShortUrl.execute({ url: dto.url });
      return { ...result, originalUrl: result.fullUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid request';
      throw new BadRequestException(message);
    }
  }

  @Public()
  @Get('s/:code')
  @ApiOperation({ summary: 'Redirect to original URL by short code' })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const originalUrl = await this.getOriginalUrl.execute(code);
    if (!originalUrl) {
      throw new BadRequestException('Short link not found');
    }
    return res.redirect(302, originalUrl);
  }
}
