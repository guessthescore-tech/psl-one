import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { parseCorsOrigins } from './env';

async function bootstrap() {
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';
  // trustProxy must be true behind a load balancer so Fastify resolves req.ip
  // from the X-Forwarded-For header set by the LB — not from the spoofable
  // raw header injected by arbitrary clients.  In local development (no proxy),
  // leave it false so req.ip is always the socket address.
  const trustProxy = nodeEnv !== 'development' && nodeEnv !== 'test';
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ trustProxy }));

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const corsOrigins = parseCorsOrigins(process.env['CORS_ORIGINS'], nodeEnv);
  app.enableCors({ origin: corsOrigins, credentials: true });

  // Security headers — applied to every response.
  // HSTS is omitted in development/test (HTTP only); staging/production set it via HTTPS termination.
  app.getHttpAdapter().getInstance().addHook(
    'onSend',
    async (_request: unknown, reply: { header: (k: string, v: string) => void; removeHeader: (k: string) => void }) => {
      reply.header('X-Content-Type-Options', 'nosniff');
      reply.header('X-Frame-Options', 'DENY');
      reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      reply.header('X-XSS-Protection', '0');
      reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      reply.removeHeader('x-powered-by');
    },
  );

  app.enableShutdownHooks();

  const port = parseInt(process.env['PORT'] ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
