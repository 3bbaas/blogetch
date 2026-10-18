import Link from 'next/link';
import { Input, Select } from './fields';
import Button from './Button';

export type FilterValues = {
  category: string;
  author: string;
  from: string;
  to: string;
  search: string;
};

const FALLBACK_CATEGORIES = [
  'Technology',
  'Lifestyle',
  'Education',
  'Business',
  'Science',
  'Other',
] as const;

export default function FilterBar({
  values,
  categories = FALLBACK_CATEGORIES,
}: {
  values: FilterValues;
  categories?: ReadonlyArray<string>;
}) {
  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((category) => ({ value: category, label: category })),
  ];
  const candidates: Array<{ key: string; label: string } | ''> = [
    values.category !== '' ? { key: 'category', label: values.category } : '',
    values.author !== '' ? { key: 'author', label: `Author ${values.author}` } : '',
    values.from !== '' ? { key: 'from', label: `From ${values.from}` } : '',
    values.to !== '' ? { key: 'to', label: `To ${values.to}` } : '',
    values.search !== '' ? { key: 'search', label: `“${values.search}”` } : '',
  ];
  const active = candidates.filter(
    (item): item is { key: string; label: string } => item !== '',
  );
  return (
    <section aria-label="Classifieds" className="rounded-[2px] border border-rule bg-paper-2 p-4">
      <h2 className="font-accent text-sm tracking-[0.25em] uppercase">Classifieds — refine the stories</h2>
      <form method="get" action="/blogs" className="mt-3 grid gap-4 md:grid-cols-3">
        <Select
          id="filter-category"
          name="category"
          label="Category"
          defaultValue={values.category}
          options={categoryOptions}
        />
        <Input id="filter-author" name="author" label="Author id" defaultValue={values.author} />
        <Input id="filter-search" name="search" label="Search words" defaultValue={values.search} />
        <Input id="filter-from" name="from" label="From date" type="date" defaultValue={values.from} />
        <Input id="filter-to" name="to" label="To date" type="date" defaultValue={values.to} />
        <div className="flex items-end gap-2">
          <Button type="submit" variant="primary">
            Set the type
          </Button>
          <Button href="/blogs">Clear</Button>
        </div>
      </form>
      {active.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
          {active.map((filter) => (
            <li key={filter.key}>
              <Link
                href="/blogs"
                aria-label={`Remove filter ${filter.label}`}
                title="Remove (clears all filters)"
                className="stamp"
              >
                ✕ {filter.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
