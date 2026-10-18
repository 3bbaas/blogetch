export default function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="halftone rounded-[2px] border border-rule p-8 text-center" role="status">
      <p aria-hidden="true" className="text-3xl">❦</p>
      <p className="font-display mt-2 text-2xl font-bold" dir="auto">
        {title}
      </p>
      {hint !== undefined && (
        <p className="mt-1 text-ink-soft" dir="auto">
          {hint}
        </p>
      )}
    </div>
  );
}
