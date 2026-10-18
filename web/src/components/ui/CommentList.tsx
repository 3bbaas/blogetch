export type Letter = {
  id: number;
  content: string;
  authorName: string;
};

export function CommentList({ letters }: { letters: Letter[] }) {
  if (letters.length === 0) {
    return (
      <p className="text-ink-soft italic">No letters yet. The mailbag is empty.</p>
    );
  }
  return (
    <ol className="space-y-4">
      {letters.map((letter) => (
        <li key={letter.id} className="border-l-2 border-rule pl-4">
          <p dir="auto">{letter.content}</p>
          <p className="font-accent mt-1 text-xs tracking-widest text-ink-soft uppercase">
            — <span dir="auto">{letter.authorName}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}
