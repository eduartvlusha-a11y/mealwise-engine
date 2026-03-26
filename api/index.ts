import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

let app;

export default async function handler(req, res) {
  if (!app) {
    app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
      .setTitle('MealWise API')
      .setDescription('MealWise Engine API Docs')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  }

  return app.getHttpAdapter().getInstance()(req, res);
}