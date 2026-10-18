export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-hidden="true" className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton h-4 rounded-[2px]" />
      ))}
    </div>
  );
}

export function SettingType() {
  return (
    <p className="type-caret font-accent text-ink-soft" role="status">
      Setting the type…
    </p>
  );
}
