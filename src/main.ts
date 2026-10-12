import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const fields: Record<string, string[]> = {};
        errors.forEach(
          (e) => (fields[e.property] = Object.values(e.constraints ?? {})),
        );
        return new UnprocessableEntityException({
          statusCode: 422,
          message: 'Validation failed',
          errors: fields,
        });
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();