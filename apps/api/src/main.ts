import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({ origin: ['http://localhost:3001'], credentials: true });
  app.enableShutdownHooks();

  const port = parseInt(process.env['PORT'] ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
