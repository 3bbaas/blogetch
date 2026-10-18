import Link from 'next/link';

function pageHref(base: string, page: number): string {
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}page=${page}`;
}

export default function Pagination({
  page,
  totalPages,
  base,
}: {
  page: number;
  totalPages: number;
  base: string;
}) {
  if (totalPages <= 1) return null;
  const numbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav aria-label="Pages" className="mt-8 text-center">
      <p className="font-accent text-sm tracking-widest uppercase" aria-live="polite">
        Page {page} of {totalPages}
      </p>
      <ol className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {numbers.map((number) => (
          <li key={number}>
            <Link
              href={pageHref(base, number)}
              aria-current={number === page ? 'page' : undefined}
              aria-label={`Go to page ${number}`}
              className="key-btn inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 text-sm aria-[current=page]:bg-ink aria-[current=page]:text-paper"
            >
              {number}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
