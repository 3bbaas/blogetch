import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Blogetch API')
    .setDescription(
      [
        'REST API for Blogetch — a small gazette of slow stories.',
        '',
        '- **Blogs** live at `/api/blogs` (plural, not `posts`).',
        '- **Comments** live at `/api/blogs/:blogId/comments`.',
        '- `PUT /api/blogs/:id` is a **partial update**; `authorId` is always taken from the token, never the body.',
        '',
        'Get a token from `POST /api/auth/login`, then click **Authorize** and paste it.',
        'Validation failures return **422** with a field-level `errors` map.',
      ].join('\n'),
    )
    .setVersion('0.0.1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .addTag('auth', 'Registration, login and the current user')
    .addTag('blogs', 'Create, read, update and delete stories')
    .addTag('comments', 'Letters attached to a story')
    .addTag('health', 'Liveness probe')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: { persistAuthorization: true },
  });
}
