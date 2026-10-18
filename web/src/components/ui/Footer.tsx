import Link from 'next/link';
import PressMark from '../PressMark';

export default function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-rule pt-4 text-center">
      <PressMark size={112} />
      <div className="rule-double" aria-hidden="true" />
      <p className="font-accent mt-3 text-xs tracking-[0.25em] uppercase">
        Blogetch · Set by hand, printed with pride
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        Colophon: Playfair Display, Lora, Special Elite &amp; Amiri, served from
        our own press — no outside foundries.
      </p>
      <p className="mt-2 text-sm">
        <Link href="/feed.xml" className="underline underline-offset-4">
          RSS feed
        </Link>
        {' · '}
        <Link href="/about" className="underline underline-offset-4">
          About this gazette
        </Link>
      </p>
      <p aria-hidden="true" className="mt-2 text-ink-soft">§ ❦ ✦</p>
    </footer>
  );
}
