import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';
import { setupSwagger } from './config/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  setupSwagger(app);
  const origins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  app.enableCors({ origin: origins });
  const port = Number.parseInt(process.env['PORT'] ?? '3000', 10);
  await app.listen(Number.isNaN(port) ? 3000 : port);
}

void bootstrap();
