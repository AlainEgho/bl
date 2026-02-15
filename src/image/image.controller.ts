import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ImageService } from './image.service';
import { Public } from '../auth/public.decorator';

@Controller()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Serve image by short code. No token required.
   * GET /i/:code → stream image from uploads path (from DB file_path).
   */
  @Public()
  @Get('i/:code')
  async serveImage(@Param('code') code: string, @Res() res: Response) {
    try {
      const { contentType, stream } =
        await this.imageService.serveByShortCode(code);
      res.setHeader('Content-Type', contentType);
      stream.on('error', () => res.destroy());
      stream.pipe(res);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new NotFoundException('Image not found');
    }
  }
}
