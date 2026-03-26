import { NestFactory } from '@nestjs/core';
import { SwaggerModuleOnly } from '../src/swagger.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import serverless from 'serverless-http';

let server;

async function bootstrap() {
  const app = await NestFactory.create(SwaggerModuleOnly, {
    logger: false,
  });

  const config = new DocumentBuilder()
    .setTitle('MealWise API')
    .setDescription('MealWise Engine API Docs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 🔥 IMPORTANT — move this AFTER swagger
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}

export default async function handler(req, res) {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
}