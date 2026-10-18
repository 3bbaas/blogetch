const ROTATIONS = ['-2deg', '-1deg', '1deg', '2deg'] as const;

function rotationFor(category: string): string {
  let hash = 0;
  for (const char of category) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ROTATIONS[Math.abs(hash) % ROTATIONS.length] ?? '1deg';
}

export default function CategoryStamp({ category }: { category: string }) {
  return (
    <span className="stamp" style={{ rotate: rotationFor(category) }} dir="auto">
      {category}
    </span>
  );
}
