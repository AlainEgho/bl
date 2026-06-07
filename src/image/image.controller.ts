import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UploadImageService } from '../application/image/upload-image.service';
import { ImageService } from './image.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Images')
@Controller()
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly uploadImage: UploadImageService,
  ) {}

  @Public()
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image and get a short link' })
  async uploadImageHandler(@UploadedFile() file: Express.Multer.File) {
    return this.uploadImage.execute(file);
  }

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
