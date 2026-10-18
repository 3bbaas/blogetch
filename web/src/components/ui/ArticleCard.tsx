import Link from 'next/link';
import Byline from './Byline';
import CategoryStamp from './CategoryStamp';

export type CardStory = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  authorId: number;
  date: string;
  dateTime: string;
  readingTime: number;
};

function CardBody({ story, lead }: { story: CardStory; lead: boolean }) {
  return (
    <>
      <div className="mb-2 flex items-center gap-3">
        <CategoryStamp category={story.category} />
      </div>
      <h3
        className={`font-display font-bold text-balance ${lead ? 'text-3xl md:text-4xl' : 'text-xl'}`}
      >
        <Link href={`/blogs/${story.slug}`} className="underline-offset-4 hover:underline">
          <span dir="auto">{story.title}</span>
        </Link>
      </h3>
      <p dir="auto" className={`mt-2 text-ink-soft ${lead ? '' : 'line-clamp-3 text-base'}`}>
        {story.excerpt}
      </p>
      <Byline
        authorName={story.authorName}
        authorId={story.authorId}
        date={story.date}
        dateTime={story.dateTime}
        readingTime={story.readingTime}
      />
    </>
  );
}

export function LeadCard({ story }: { story: CardStory }) {
  return (
    <article className="border-b-2 border-rule pb-6">
      <CardBody story={story} lead />
    </article>
  );
}

export function ArticleCard({ story }: { story: CardStory }) {
  return (
    <article className="rounded-[2px] border border-rule bg-paper p-4 shadow-[3px_3px_0_var(--paper-2)]">
      <CardBody story={story} lead={false} />
    </article>
  );
}
