import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('BazMartBackend');
  const app = await NestFactory.create(AppModule);

  // Enable CORS specifically for Flutter Web (port 4000) and Next.js Admin (port 4002)
  app.enableCors({
    origin: [
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      'http://localhost:4002',
      'http://127.0.0.1:4002',
      'http://localhost',
      '*',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Strictly bind to Port 4001 (Port 3000 is permanently reserved and never touched)
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4001;
  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(` BazMart Production-Grade NestJS API running on:`);
  logger.log(` http://localhost:${port}/api/v1`);
  logger.log(` CORS enabled for: http://localhost:4000`);
  logger.log(` Port 3000 is untouched and preserved.`);
  logger.log(`=======================================================`);
}

bootstrap();
