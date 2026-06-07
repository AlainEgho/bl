import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShortenerModule } from './shortener/shortener.module';
import { ShortUrlModel } from './infrastructure/shortener/entities/short-url.model';
import { ImageUploadModel } from './infrastructure/image/entities/image-upload.model';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 3306)),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', 'egho'),
        database: config.get('DB_DATABASE', 'backend'),
        entities: [ShortUrlModel, ImageUploadModel],
        synchronize: config.get('NODE_ENV') !== 'production',
  // 🌟 SECURE TLS CONFIGURATION FOR MYSQL
  extra: {
    ssl: {
      ca: process.env.DB_CA_CERT, // Reads raw string directly
      rejectUnauthorized: true,  // Enforce strict certificate matching
    },
  },

      }),
      inject: [ConfigService],
    }),
    ShortenerModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
