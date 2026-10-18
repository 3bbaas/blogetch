export function slugify(title: string): string {
  const ascii = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\u4e00-\u9fff]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  if (ascii.length > 0) return ascii.slice(0, 80);
  // Emoji-only (or other non-ASCII symbol) titles: fall back to code
  // points so the slug is never empty. Pure ASCII punctuation falls
  // through to 'post'.
  const points = Array.from(title)
    .map((char) => char.codePointAt(0) ?? 0)
    .filter((code) => code > 127)
    .map((code) => code.toString(16))
    .join('-')
    .slice(0, 80);
  return points.length > 0 ? points : 'post';
}

export function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>#|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerpt(content: string, maxLength = 160): string {
  const plain = stripMarkdown(content);
  if (plain.length <= maxLength) return plain;
  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${lastSpace > 40 ? cut.slice(0, lastSpace) : cut}…`;
}

export function readingTime(content: string): number {
  const words = stripMarkdown(content).split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(iso: string, locale = 'en-US'): { text: string; dateTime: string } {
  const date = new Date(iso);
  return {
    text: date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    dateTime: date.toISOString().slice(0, 10),
  };
}

export function canonicalBlogPath(blog: { id: number; title: string }): string {
  return `/blogs/${blog.id}-${slugify(blog.title)}`;
}

export function parseBlogIdSlug(idSlug: string): number | null {
  const id = Number.parseInt(idSlug.split('-')[0] ?? '', 10);
  return Number.isNaN(id) ? null : id;
}
