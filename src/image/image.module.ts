import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadImageService } from '../application/image/upload-image.service';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ImageUploadModel } from '../infrastructure/image/entities/image-upload.model';

@Module({
  imports: [TypeOrmModule.forFeature([ImageUploadModel])],
  controllers: [ImageController],
  providers: [ImageService, UploadImageService],
  exports: [ImageService],
})
export class ImageModule {}
