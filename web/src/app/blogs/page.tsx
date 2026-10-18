import type { Metadata } from 'next';
import { ArticleCard } from '@/components/ui/ArticleCard';
import EmptyState from '@/components/ui/EmptyState';
import FilterBar from '@/components/ui/FilterBar';
import Pagination from '@/components/ui/Pagination';
import { listBlogs } from '@/lib/blogs';
import { toCardStory } from '@/lib/cards';
import { BLOG_CATEGORIES } from '@/lib/schemas';

export const revalidate = 60;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function baseWithoutPage(params: URLSearchParams): string {
  const copy = new URLSearchParams(params);
  copy.delete('page');
  const query = copy.toString();
  return query.length > 0 ? `/blogs?${query}` : '/blogs';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const raw = await searchParams;
  const filtered = ['category', 'author', 'from', 'to', 'search'].some((key) => {
    const value = raw[key];
    const single = Array.isArray(value) ? value[0] : value;
    return single !== undefined && single !== '';
  });
  const pageValue = raw['page'];
  const page = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  const canonical = page !== undefined && page !== '' && page !== '1' ? `/blogs?page=${page}` : '/blogs';
  return {
    title: 'All stories',
    description: 'Every story filed in the Blogetch gazette, newest first.',
    alternates: { canonical },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function BlogsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = first(value);
    if (single !== '') params.set(key, single);
  }

  const pageNumber = Number.parseInt(params.get('page') ?? '1', 10);
  const page = Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
  const authorNumber = Number.parseInt(params.get('author') ?? '', 10);

  let stories: ReturnType<typeof toCardStory>[] = [];
  let total = 0;
  let totalPages = 1;
  let apiDown = false;
  try {
    const result = await listBlogs({
      page,
      limit: 10,
      category: params.get('category') ?? undefined,
      author: Number.isNaN(authorNumber) ? undefined : authorNumber,
      from: params.get('from') ?? undefined,
      to: params.get('to') ?? undefined,
      search: params.get('search') ?? undefined,
    });
    stories = result.data.map(toCardStory);
    total = result.meta.total;
    totalPages = result.meta.totalPages;
  } catch {
    apiDown = true;
  }

  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">All stories</h1>
      <p className="text-ink-soft">
        {total} {total === 1 ? 'story' : 'stories'} filed
      </p>
      <div className="mt-4">
        <FilterBar
          categories={BLOG_CATEGORIES}
          values={{
            category: params.get('category') ?? '',
            author: params.get('author') ?? '',
            from: params.get('from') ?? '',
            to: params.get('to') ?? '',
            search: params.get('search') ?? '',
          }}
        />
      </div>
      {apiDown ? (
        <div className="mt-6">
          <EmptyState
            title="The presses are down."
            hint="We could not reach the newsroom. Please try again shortly."
          />
        </div>
      ) : stories.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No stories set in type yet." hint="Try loosening the filters." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <ArticleCard key={story.id} story={story} />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={Math.max(1, totalPages)} base={baseWithoutPage(params)} />
    </>
  );
}
