import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
    app.enableCors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});


  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('MealWise API')
    .setDescription('Official API documentation for the MealWise food-tech backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;

await app.listen(port);

console.log(`🚀 MealWise backend running on port ${port}`);
console.log(`📘 Swagger documentation: /api/docs`);
}

bootstrap();
