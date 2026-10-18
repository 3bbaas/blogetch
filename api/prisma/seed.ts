import path from 'node:path';
import { config as loadDotenv } from 'dotenv';

loadDotenv({ path: path.resolve(__dirname, '..', '..', '.env') });
loadDotenv();
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  type BlogCategory,
  PrismaClient,
} from '../src/generated/prisma/client';

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
      category: 'Technology',
      authorEmail: 'ada@example.com',
      content: `Welcome to **Blogetch** — a small, slow corner of the web where ideas get set in type before they go out the door.

## Why a gazette?

Most blogs shout. This one tries to whisper. The idea is simple: write a thought down, edit it until it earns its ink, and print it proud. No infinite feed, no algorithm deciding what you read next.

## What you will find here

- **Short essays** on software, work, and the odd quiet habit
- **Field notes** from building things, mistakes included
- A few *letters* from readers down in the comments

> Write drunk on curiosity, edit sober.

If that sounds like your kind of paper, pull up a chair and start at the archive.`,
    },
    {
      title: 'Morning Routines',
      category: 'Lifestyle',
      authorEmail: 'ada@example.com',
      content: `I used to think a good morning required a five-step ritual and a cold plunge. It does not. Mine now fits on a sticky note.

## The sticky note

1. Water before coffee.
2. Ten minutes of writing, no screens.
3. One thing that matters, done first.

That is it. The rest of the day is noise I can ignore.

## Why it works

The trick is not doing *more* — it is deciding **once**, so you are not negotiating with yourself at 7 a.m. A routine is just a decision you made earlier, on your own behalf.

> Discipline is remembering what you want.

Start with two items, not ten. Curiosity survives routine; grand plans usually do not.`,
    },
    {
      title: 'Learning TypeScript',
      category: 'Education',
      authorEmail: 'sara@example.com',
      content: `When I moved from plain JavaScript, the thing that finally made TypeScript click was not generics or decorators. It was the error messages.

## Types are a conversation

Instead of discovering a typo in production, the compiler points at the line and says what it expected. That is not bureaucracy — it is a very patient reviewer who never gets tired.

- \`string\` vs \`number\` mistakes caught before the commit
- Autocomplete that actually knows your shapes
- Refactors you can trust across a hundred files

## Start small

You do not need to annotate everything. Turn on \`strict\` for new files, let inference do the heavy lifting, and only reach for generics when a real pattern shows up twice.

> Make it work, make it right, make it fast — in that order.

The language rewards patience. Give it a week.`,
    },
    {
      title: 'Startup Basics',
      category: 'Business',
      authorEmail: 'sara@example.com',
      content: `Everyone asks about the big idea. The honest answer is that most small businesses are held together by boring, repeatable habits.

## The unglamorous list

- Talk to customers every week, not every quarter.
- Charge enough to survive the quiet months.
- Write down what you decided, and why.

## Cash is the plot

Revenue is a headline; cash flow is the story. A profitable month on paper means nothing if the money arrives after the bills do.

> You can fix a lot of problems with three good months of runway.

Keep the team small, keep the promises small enough to actually keep, and let trust compound. It is slower than a launch, and it lasts longer.`,
    },
    {
      title: 'The James Webb Era',
      category: 'Science',
      authorEmail: 'ada@example.com',
      content: `The first images felt like a curtain lifting. After decades of planning, the James Webb Space Telescope started handing back light that had been travelling for billions of years.

## What it sees

Webb looks in the **infrared**, which lets it peer through dust and reach back toward the earliest galaxies. Where Hubble showed us the neighbourhood, Webb shows us the street the universe grew up on.

- Exoplanet atmospheres, sniffed for water and carbon
- Stellar nurseries caught mid-collapse
- Galaxies older than we expected to find so soon

## Why it matters

Every answer seems to arrive with two new questions. That is not a failure of the telescope — it is the whole point.

> Somewhere, something incredible is waiting to be known.

If you only look at one image, make it the deep field. Then look again.`,
    },
    {
      title: 'Deep Dives into Postgres',
      category: 'Technology',
      authorEmail: 'sara@example.com',
      content: `Postgres has a reputation for being the database that quietly does everything. Spend a week with it and you start to believe the reputation.

## Indexes are not free

An index makes reads fast and writes slightly slower, because every insert has to update the book too. The skill is knowing which queries actually deserve one.

- Use \`EXPLAIN ANALYZE\` before you guess.
- A composite index supports the leftmost columns first.
- Partial indexes are excellent for the "active rows only" case.

## Transactions

Wrap related changes so they succeed or fail together. \`BEGIN\`, do the work, \`COMMIT\` — and let the database be the referee, not your application code.

> The database is not your enemy; it is your most honest colleague.

Learn the query planner a little each week and it will flatter you with speed.`,
    },
    {
      title: 'Weekend Hiking',
      category: 'Other',
      authorEmail: 'sara@example.com',
      content: `The best trail near the city is not the famous one. It is the one with a parking spot at 7 a.m. and no queue for the view.

## What to bring

- Water, more than feels reasonable
- A layer for the summit wind
- Something to eat that does not melt

## What to leave

The earbuds, on the way up. The mountain has a soundtrack if you stop talking over it.

> Go slowly enough to notice where you are.

Start before the heat, turn around with a third of your energy left, and you will always get home with the good kind of tired.`,
    },
    {
      title: 'Study Habits',
      category: 'Education',
      authorEmail: 'ada@example.com',
      content: `If you remember one study technique, remember this: testing yourself beats re-reading by a wide margin.

## The evidence is boring and clear

Spaced repetition works because forgetting is part of learning. Each time you retrieve an answer just as it starts to fade, the memory gets a little more permanent.

- Re-read once, then close the book and write what you remember.
- Space the reviews: today, in three days, in a week.
- Mix topics instead of drilling just one.

## Make it small

A ten-minute recall session you actually do beats a two-hour plan you keep postponing.

> The best study system is the one you will still be using next month.

Study the way you want to remember: in small, honest, repeated doses.`,
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
    const letters = [
      `Lovely piece on "${blog.title}" — the opening really pulled me in.`,
      `Saved this one. The middle section is worth a second read.`,
    ];
    for (const [index, content] of letters.entries()) {
      await prisma.comment.upsert({
        where: { id: blogId * 1000 + index },
        update: {},
        create: {
          id: blogId * 1000 + index,
          content,
          blogId,
          userId: author.id,
        },
      });
    }
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
