import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });
  const logger = new Logger('Bootstrap');

  // ── Security ──────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────────
  // Exclude the root health check so Railway's health probe can reach /
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  // ── Validation ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger (always enabled — useful for Railway testing) ──────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SBT Billing API')
    .setDescription(
      'Sri Balamurugan Tanker Welding — Billing Management System API',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication & Authorization')
    .addTag('Bills', 'Invoice Management')
    .addTag('Customers', 'Transport Companies')
    .addTag('Services', 'Welding Works Master List')
    .addTag('Analytics', 'Reports & Dashboard')
    .addTag('Gallery', 'Reference Images')
    .addTag('Enquiries', 'Landing Page Contact Forms')
    .addTag('Health', 'System Health')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ── Root health probe (for Railway / uptime monitors) ─────────
  // Railway probes GET / before routing traffic. Without this,
  // Railway marks the deployment unhealthy even though NestJS is running.
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (_req: unknown, res: { json: (body: object) => void }) => {
    res.json({ status: 'ok', service: 'SBT Backend', timestamp: new Date().toISOString() });
  });

  // ── Start — MUST bind to 0.0.0.0 for Railway ─────────────────
  // Railway's reverse proxy forwards external traffic to the container
  // on the PORT env var. Node.js defaults to 127.0.0.1 (loopback only),
  // which means Railway's proxy cannot reach it from outside the container.
  // '0.0.0.0' binds to ALL network interfaces, making the port reachable.
  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SBT Backend running on port ${port} (0.0.0.0)`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
  logger.log(`🔗 Public URL: https://twa-production-cf73.up.railway.app/api/v1`);
}

bootstrap();
