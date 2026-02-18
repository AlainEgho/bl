import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ImageService } from './image.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Images')
@Controller()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Public()
  @Get('i/:code')
  @ApiOperation({ summary: 'Serve image by short code (no auth)' })
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
