import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { ImageUploadModel } from '../infrastructure/image/entities/image-upload.model';

export const IMAGE_UPLOAD_ROOT = 'IMAGE_UPLOAD_ROOT';

export interface ImageServeResult {
  fullPath: string;
  contentType: string;
  stream: fs.ReadStream;
}

@Injectable()
export class ImageService {
  private readonly uploadRoot: string;

  constructor(
    @InjectRepository(ImageUploadModel)
    private readonly repo: Repository<ImageUploadModel>,
    private readonly config: ConfigService,
  ) {
    this.uploadRoot =
      this.config.get<string>(IMAGE_UPLOAD_ROOT) ||
      'C:\\AI\\backend\\uploads\\images';
  }

  async serveByShortCode(shortCode: string): Promise<ImageServeResult> {
    const row = await this.repo.findOne({ where: { shortCode } });
    if (!row) {
      throw new NotFoundException('Image not found');
    }

    const fullPath = path.join(this.uploadRoot, row.filePath);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Image file not found');
    }

    const stream = fs.createReadStream(fullPath);
    return {
      fullPath,
      contentType: row.contentType,
      stream,
    };
  }
}
