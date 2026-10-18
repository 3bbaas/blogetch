import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { ArticleCard } from '@/components/ui/ArticleCard';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { listBlogs } from '@/lib/blogs';
import { toCardStory } from '@/lib/cards';
import { env } from '@/lib/env';
import { BLOG_CATEGORIES } from '@/lib/schemas';

function matchCategory(slug: string): string | null {
  const found = BLOG_CATEGORIES.find(
    (category) => category.toLowerCase() === slug.toLowerCase(),
  );
  return found ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = matchCategory(slug);
  if (category === null) return { title: 'Section not found' };
  const description = `Every ${category.toLowerCase()} story in the Blogetch gazette, filed in order.`;
  return {
    title: `${category} desk`,
    description,
    alternates: { canonical: `/category/${category.toLowerCase()}` },
    openGraph: { title: `${category} desk | Blogetch`, description },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const category = matchCategory(slug);
  if (category === null) notFound();

  const raw = await searchParams;
  const pageValue = Array.isArray(raw['page']) ? raw['page'][0] : raw['page'];
  const parsed = Number.parseInt(pageValue ?? '1', 10);
  const page = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;

  let stories: ReturnType<typeof toCardStory>[] = [];
  let totalPages = 1;
  let apiDown = false;
  try {
    const result = await listBlogs({ category, page, limit: 10 });
    stories = result.data.map(toCardStory);
    totalPages = result.meta.totalPages;
  } catch {
    apiDown = true;
  }

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
              name: `${category} desk`,
              item: `${env.NEXT_PUBLIC_SITE_URL}/category/${category.toLowerCase()}`,
            },
          ],
        }}
      />
      <h1 className="font-display text-4xl font-extrabold">{category} desk</h1>
      <p className="text-ink-soft">Every {category.toLowerCase()} story, filed in order.</p>
      {apiDown ? (
        <div className="mt-6">
          <EmptyState title="The presses are down." hint="Please try again shortly." />
        </div>
      ) : stories.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No stories set in type yet." hint="Try another section." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <ArticleCard key={story.id} story={story} />
          ))}
        </div>
      )}
      <Pagination
        page={page}
        totalPages={Math.max(1, totalPages)}
        base={`/category/${category.toLowerCase()}`}
      />
    </>
  );
}
