import { ArticleCard } from '@/components/ui/ArticleCard';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { requireUser } from '@/lib/auth';
import { listBlogs } from '@/lib/blogs';
import { toCardStory } from '@/lib/cards';

export default async function DeskPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser('/desk');
  const raw = await searchParams;
  const pageValue = Array.isArray(raw['page']) ? raw['page'][0] : raw['page'];
  const parsed = Number.parseInt(pageValue ?? '1', 10);
  const page = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;

  let stories: ReturnType<typeof toCardStory>[] = [];
  let totalPages = 1;
  let apiDown = false;
  try {
    const result = await listBlogs({ author: user.id, page, limit: 10 });
    stories = result.data.map(toCardStory);
    totalPages = result.meta.totalPages;
  } catch {
    apiDown = true;
  }

  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">My Desk</h1>
      <p className="text-ink-soft">
        Filed under your name, <span dir="auto">{user.name}</span>.
      </p>
      {apiDown ? (
        <div className="mt-6">
          <EmptyState title="The presses are down." hint="Please try again shortly." />
        </div>
      ) : stories.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Your desk drawer is empty." hint="File your first story." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <ArticleCard key={story.id} story={story} />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={Math.max(1, totalPages)} base="/desk" />
    </>
  );
}
