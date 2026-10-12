import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const port = Number.parseInt(process.env['PORT'] ?? '3000', 10);
  await app.listen(Number.isNaN(port) ? 3000 : port);
}

void bootstrap();
