import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { EnvKeyEnum } from './app/enum/env-key.enum';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const maxPayloadSize = configService.get(EnvKeyEnum.MaxPayloadSize);

  app.enableCors();
  app.use(bodyParser.json({ limit: maxPayloadSize }));
  app.use(bodyParser.urlencoded({ limit: maxPayloadSize, extended: true }));

  const options = new DocumentBuilder()
    .setTitle(configService.get(EnvKeyEnum.SwaggerTitle))
    .setDescription(configService.get(EnvKeyEnum.SwaggerDescription))
    .setVersion(configService.get(EnvKeyEnum.SwaggerVersion))
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup(configService.get(EnvKeyEnum.SwaggerUri), app, document);

  await app.listen(3000);
}

bootstrap();
