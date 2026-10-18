import type { CardStory } from '@/components/ui/ArticleCard';
import { canonicalBlogPath, excerpt, formatDate, readingTime, slugify } from './helpers';
import type { Blog } from './schemas';

export function blogSlug(blog: { id: number; title: string }): string {
  return `${blog.id}-${slugify(blog.title)}`;
}

export function blogCanonical(blog: { id: number; title: string }): string {
  return canonicalBlogPath(blog);
}

export function toCardStory(blog: Blog): CardStory {
  const date = formatDate(blog.createdAt);
  return {
    id: blog.id,
    slug: blogSlug(blog),
    title: blog.title,
    excerpt: excerpt(blog.content),
    category: blog.category,
    authorName: blog.author?.name ?? 'Anonymous',
    authorId: blog.author?.id ?? 0,
    date: date.text,
    dateTime: date.dateTime,
    readingTime: readingTime(blog.content),
  };
}
