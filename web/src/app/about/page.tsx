import PressMark from '@/components/PressMark';

export default function AboutPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">Colophon</h1>
      <div className="rule-double mt-2" aria-hidden="true" />
      <div className="mt-4 max-w-[65ch] space-y-4">
        <PressMark size={256} />
        <p>
          <strong dir="auto">Blogetch</strong> is a small gazette for slow thoughts,
          set by hand and printed with pride. No feeds that shout, no counters that
          follow — just stories, letters, and ink.
        </p>
        <p>
          Set in Playfair Display, Lora, Special Elite and Amiri, served from our
          own press. Every page is printed on demand by the server; nothing here
          phones home.
        </p>
      </div>
    </>
  );
}
