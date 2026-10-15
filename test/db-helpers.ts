import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

// Wipes all rows (child tables first for the FKs) so every e2e suite
// starts from an empty test database. E2E suites share one test DB,
// so test:e2e runs --runInBand to keep suites from racing each other.
export async function truncateAll(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.comment.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.user.deleteMany();
}
