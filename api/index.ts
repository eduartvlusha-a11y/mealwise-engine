import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import serverless from 'serverless-http';
import * as swaggerUi from 'swagger-ui-dist';
import * as express from 'express';

let server;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  const config = new DocumentBuilder()
    .setTitle('MealWise API')
    .setDescription('MealWise Engine API Docs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const expressApp = app.getHttpAdapter().getInstance();

  // 🔥 Serve Swagger manually
  expressApp.use('/api/docs', express.static(swaggerUi.getAbsoluteFSPath()));

  expressApp.get('/api/docs', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MealWise API</title>
          <link rel="stylesheet" href="/api/docs/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="/api/docs/swagger-ui-bundle.js"></script>
          <script>
            SwaggerUIBundle({
              url: '/api-json',
              dom_id: '#swagger-ui',
            });
          </script>
        </body>
      </html>
    `);
  });

  // expose JSON
  app.getHttpAdapter().getInstance().get('/api-json', (req, res) => {
    res.json(document);
  });

  await app.init();

  return serverless(expressApp);
}

export default async function handler(req, res) {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
}