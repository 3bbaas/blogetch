
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type BlogCategory } from '../src/generated/prisma/client';

function requiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: requiredEnv('DATABASE_URL'),
  });
  return new PrismaClient({ adapter });
}

export async function seedAdmin(
  prisma: PrismaClient,
  email: string,
  password: string,
): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: 'Admin', email, passwordHash, role: 'admin' },
  });
}

async function seedSamples(prisma: PrismaClient): Promise<void> {
  const authors = [
    { name: 'Ada', email: 'ada@example.com' },
    { name: 'Sara', email: 'sara@example.com' },
  ];
  for (const author of authors) {
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.user.upsert({
      where: { email: author.email },
      update: {},
      create: { ...author, passwordHash, role: 'author' },
    });
  }

  const blogs: Array<{
    title: string;
    content: string;
    category: BlogCategory;
    authorEmail: string;
  }> = [
    {
      title: 'Hello, Blogetch',
      content: 'Welcome to the sample blog content.',
      category: 'Technology',
      authorEmail: 'ada@example.com',
    },
    {
      title: 'Morning Routines',
      content: 'How to start the day right.',
      category: 'Lifestyle',
      authorEmail: 'ada@example.com',
    },
    {
      title: 'Learning TypeScript',
      content: 'Types make APIs safer.',
      category: 'Education',
      authorEmail: 'sara@example.com',
    },
    {
      title: 'Startup Basics',
      content: 'Notes on running a small business.',
      category: 'Business',
      authorEmail: 'sara@example.com',
    },
    {
      title: 'The James Webb Era',
      content: 'What the new telescopes found.',
      category: 'Science',
      authorEmail: 'ada@example.com',
    },
    {
      title: 'Deep Dives into Postgres',
      content: 'Indexes, transactions, and more.',
      category: 'Technology',
      authorEmail: 'sara@example.com',
    },
    {
      title: 'Weekend Hiking',
      content: 'Trails worth your time.',
      category: 'Other',
      authorEmail: 'sara@example.com',
    },
    {
      title: 'Study Habits',
      content: 'Spaced repetition works.',
      category: 'Education',
      authorEmail: 'ada@example.com',
    },
  ];

  for (const blog of blogs) {
    const author = await prisma.user.findUniqueOrThrow({
      where: { email: blog.authorEmail },
      select: { id: true },
    });
    const existing = await prisma.blog.findFirst({
      where: { title: blog.title, authorId: author.id },
      select: { id: true },
    });
    const blogId =
      existing?.id ??
      (
        await prisma.blog.create({
          data: {
            title: blog.title,
            content: blog.content,
            category: blog.category,
            authorId: author.id,
          },
          select: { id: true },
        })
      ).id;
    await prisma.comment.upsert({
      where: { id: blogId * 1000 },
      update: {},
      create: {
        id: blogId * 1000,
        content: `First thoughts on "${blog.title}".`,
        blogId,
        userId: author.id,
      },
    });
  }
}

async function main(): Promise<void> {
  const prisma = createClient();
  try {
    await seedAdmin(
      prisma,
      requiredEnv('ADMIN_EMAIL', 'admin@blogetch.dev'),
      requiredEnv('ADMIN_PASSWORD', 'Admin12345'),
    );
    await seedSamples(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] !== undefined && process.argv[1].endsWith('seed.ts');
if (isDirectRun) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
