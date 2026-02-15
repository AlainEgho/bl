import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ImageUploadModel } from '../infrastructure/image/entities/image-upload.model';

@Module({
  imports: [TypeOrmModule.forFeature([ImageUploadModel])],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
