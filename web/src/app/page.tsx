import JsonLd from '@/components/JsonLd';
import { ArticleCard, LeadCard } from '@/components/ui/ArticleCard';
import EmptyState from '@/components/ui/EmptyState';
import { listBlogs } from '@/lib/blogs';
import { toCardStory } from '@/lib/cards';
import { env } from '@/lib/env';
import { BLOG_CATEGORIES } from '@/lib/schemas';

export const revalidate = 60;

export default async function Home() {
  let stories: ReturnType<typeof toCardStory>[] = [];
  let apiDown = false;
  try {
    const latest = await listBlogs({ limit: 10 });
    stories = latest.data.map(toCardStory);
  } catch {
    apiDown = true;
  }

  const strips = BLOG_CATEGORIES.map((category) => ({
    category,
    stories: stories.filter((story) => story.category === category).slice(0, 3),
  })).filter((strip) => strip.stories.length > 0);

  const [lead, ...rest] = stories;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Blogetch',
          url: env.NEXT_PUBLIC_SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${env.NEXT_PUBLIC_SITE_URL}/blogs?search={query}`,
            'query-input': 'required name=query',
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Blogetch',
          url: env.NEXT_PUBLIC_SITE_URL,
          logo: `${env.NEXT_PUBLIC_SITE_URL}/icon.png`,
        }}
      />
      {apiDown && (
        <EmptyState
          title="The presses are down."
          hint="We could not reach the newsroom. Please try again shortly."
        />
      )}
      {!apiDown && stories.length === 0 && (
        <EmptyState title="No stories set in type yet." hint="Be the first to file a story." />
      )}
      {lead !== undefined && <LeadCard story={lead} />}
      {rest.length > 0 && (
        <section aria-label="Latest stories" className="mt-6">
          <h2 className="font-accent text-sm tracking-[0.25em] uppercase">The latest</h2>
          <div className="rule-double mt-1" aria-hidden="true" />
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((story) => (
              <ArticleCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}
      {strips.map((strip) => (
        <section key={strip.category} aria-label={`${strip.category} strip`} className="mt-8">
          <h2 className="font-accent text-sm tracking-[0.25em] uppercase">{strip.category}</h2>
          <div className="rule-double mt-1" aria-hidden="true" />
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
            {strip.stories.map((story) => (
              <ArticleCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
