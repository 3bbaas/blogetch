import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { seedAdmin } from '../prisma/seed';

export async function truncateAll(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.comment.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.user.deleteMany();
  const email = process.env['ADMIN_EMAIL'] ?? '';
  const password = process.env['ADMIN_PASSWORD'] ?? '';
  await seedAdmin(prisma, email, password);
}
