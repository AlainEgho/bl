import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { CurrentUserService } from '../../auth/current-user.service';
import { ImageUploadModel } from '../../infrastructure/image/entities/image-upload.model';
import { IMAGE_UPLOAD_ROOT } from '../../image/image.service';

const SHORT_CODE_LENGTH = 8;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

export interface UploadImageResult {
  shortCode: string;
  imageUrl: string;
  contentType: string;
  originalFileName: string | null;
}

@Injectable()
export class UploadImageService {
  private readonly uploadRoot: string;

  constructor(
    @InjectRepository(ImageUploadModel)
    private readonly repo: Repository<ImageUploadModel>,
    private readonly config: ConfigService,
    private readonly currentUser: CurrentUserService,
  ) {
    this.uploadRoot =
      this.config.get<string>(IMAGE_UPLOAD_ROOT) ||
      path.join(process.cwd(), 'uploads', 'images');
  }

  async execute(file: Express.Multer.File): Promise<UploadImageResult> {
    this.validateFile(file);

    const shortCode = await this.generateUniqueShortCode();
    const userId = this.currentUser.getUserId() ?? 0;
    const extension = this.resolveExtension(file);
    const relativePath = path.join(String(userId), `${shortCode}${extension}`);
    const fullPath = path.join(this.uploadRoot, relativePath);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, file.buffer);

    await this.repo.save({
      shortCode,
      filePath: relativePath.replace(/\\/g, '/'),
      contentType: file.mimetype,
      originalFileName: file.originalname || null,
      userId,
    });

    return {
      shortCode,
      imageUrl: `/i/${shortCode}`,
      contentType: file.mimetype,
      originalFileName: file.originalname || null,
    };
  }

  private validateFile(file: Express.Multer.File | undefined): void {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Image must be 10 MB or smaller');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, GIF, and WebP images are allowed',
      );
    }
  }

  private resolveExtension(file: Express.Multer.File): string {
    const fromMime = MIME_TO_EXT[file.mimetype];
    if (fromMime) return fromMime;

    const fromName = path.extname(file.originalname || '').toLowerCase();
    if (fromName) return fromName;

    return '.bin';
  }

  private randomShortCode(): string {
    let code = '';
    for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return code;
  }

  private async generateUniqueShortCode(): Promise<string> {
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      const code = this.randomShortCode();
      const exists = await this.repo.exists({ where: { shortCode: code } });
      if (!exists) return code;
    }
    throw new BadRequestException('Could not generate unique short code');
  }
}
