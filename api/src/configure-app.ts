import {
  INestApplication,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const error of errors) {
    const path =
      parentPath.length > 0
        ? `${parentPath}.${error.property}`
        : error.property;
    if (error.constraints) {
      fields[path] = Object.values(error.constraints);
    }
    if (error.children !== undefined && error.children.length > 0) {
      const nested = flattenValidationErrors(error.children, path);
      for (const [key, messages] of Object.entries(nested)) {
        fields[key] = messages;
      }
    }
  }
  return fields;
}

export function buildValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
      return new UnprocessableEntityException({
        statusCode: 422,
        message: 'Validation failed',
        errors: flattenValidationErrors(errors),
      });
    },
  });
}

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(buildValidationPipe());
}
