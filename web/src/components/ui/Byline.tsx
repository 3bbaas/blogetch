import Link from 'next/link';

export default function Byline({
  authorName,
  authorId,
  date,
  dateTime,
  readingTime,
}: {
  authorName: string;
  authorId: number;
  date: string;
  dateTime: string;
  readingTime: number;
}) {
  return (
    <address className="font-accent mt-2 text-xs tracking-widest text-ink-soft uppercase not-italic">
      By <Link href={`/authors/${authorId}`} className="underline underline-offset-4" dir="auto">{authorName}</Link>
      {' · '}
      <time dateTime={dateTime}>{date}</time>
      {' · '}
      {readingTime} min read
    </address>
  );
}
