import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpLoggerMiddleware } from './logging/http-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  app.use(new HttpLoggerMiddleware().use.bind(new HttpLoggerMiddleware()));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  //test
  
   app.enableCors({ origin: 'https://ux-seven-phi.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
     credentials:true,
                   allowedHeaders: 'Content-Type, Authorization, Accept, X-Requested-With, Content-Length, X-CSRF-Token, Accept-Version, Content-MD5, Date, X-Api-Version',

  });
//app.enableCors(); 
  // app.enableCors({
  //   origin: ['https://ux-seven-phi.vercel.app'], // Echoes back whatever origin requested access dynamically
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  //   allowedHeaders: '*',
  // });

  // const config = new DocumentBuilder()
  //   .setTitle('Shortener API')
  //   .setDescription('URL shortener and image serve API. Use **Authorize** to add a Bearer token for protected endpoints.')
  //   .setVersion('1.0')
  //   .addBearerAuth(
  //     { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization' },
  //     'JWT',
  //   )
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
