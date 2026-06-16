import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS liberado para o frontend conseguir consumir a API
  app.enableCors();

  // Validação global com class-validator
  // whitelist: true remove campos que não estão no DTO
  // transform: true transforma payloads automaticamente para as classes DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Configuração do Swagger para documentação interativa
  const config = new DocumentBuilder()
    .setTitle('Newsletter API')
    .setDescription('API do sistema de curadoria de notícias com IA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API rodando na porta: ${port}`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/api`);
}
bootstrap();
