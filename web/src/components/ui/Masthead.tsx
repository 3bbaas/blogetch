import PressMark from '../PressMark';

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

function longDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Masthead({ now = new Date() }: { now?: Date }) {
  return (
    <header className="text-center">
      <PressMark size={72} />
      <p className="font-accent mt-1 text-xs tracking-[0.3em] text-ink-soft uppercase">
        A nostalgic gazette of thoughts
      </p>
      <p className="font-display text-5xl font-extrabold tracking-tight md:text-7xl">
        Blogetch
      </p>
      <p className="font-accent mt-1 text-sm text-ink-soft" dir="auto">
        <span aria-hidden="true">❦ </span>
        Sketch your thoughts. Print them proud.
        <span aria-hidden="true"> ❦</span>
      </p>
      <p className="font-accent mt-3 text-xs tracking-widest text-ink-soft uppercase">
        <time dateTime={now.toISOString()}>
          Vol. I · No. {dayOfYear(now)} · {longDate(now)} · Price: one thought
        </time>
      </p>
    </header>
  );
}
