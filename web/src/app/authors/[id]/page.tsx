import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { ArticleCard } from '@/components/ui/ArticleCard';
import EmptyState from '@/components/ui/EmptyState';
import { listBlogs } from '@/lib/blogs';
import { toCardStory } from '@/lib/cards';
import { env } from '@/lib/env';
import { parseBlogIdSlug } from '@/lib/helpers';

async function authorNameFor(id: number): Promise<string | null> {
  try {
    const result = await listBlogs({ author: id, limit: 1 });
    const first = result.data[0];
    return first?.author?.name ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const authorId = parseBlogIdSlug(id);
  if (authorId === null) return { title: 'Author not found' };
  const name = await authorNameFor(authorId);
  if (name === null) return { title: 'Author not found' };
  return {
    title: `${name}’s column`,
    description: `Every story filed by ${name} in the Blogetch gazette.`,
    alternates: { canonical: `/authors/${authorId}` },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorId = parseBlogIdSlug(id);
  if (authorId === null) notFound();

  let stories: ReturnType<typeof toCardStory>[] = [];
  let apiDown = false;
  try {
    const result = await listBlogs({ author: authorId, limit: 50 });
    stories = result.data.map(toCardStory);
  } catch {
    apiDown = true;
  }

  if (!apiDown && stories.length === 0) notFound();
  const name = stories[0]?.authorName ?? 'Anonymous';

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Front Page', item: env.NEXT_PUBLIC_SITE_URL },
            {
              '@type': 'ListItem',
              position: 2,
              name: `${name}’s column`,
              item: `${env.NEXT_PUBLIC_SITE_URL}/authors/${authorId}`,
            },
          ],
        }}
      />
      <h1 dir="auto" className="font-display text-4xl font-extrabold">
        {name}’s column
      </h1>
      <p className="text-ink-soft">Everything filed under this byline.</p>
      {apiDown ? (
        <div className="mt-6">
          <EmptyState title="The presses are down." hint="Please try again shortly." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <ArticleCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </>
  );
}
