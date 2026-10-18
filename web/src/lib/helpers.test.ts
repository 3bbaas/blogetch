import { describe, expect, it } from 'vitest';
import {
  canonicalBlogPath,
  excerpt,
  formatDate,
  parseBlogIdSlug,
  readingTime,
  slugify,
} from './helpers';

describe('slugify', () => {
  it('slugifies latin titles', () => {
    expect(slugify('Hello, Blogetch!')).toBe('hello-blogetch');
  });
  it('keeps arabic script', () => {
    const slug = slugify('خواطر الصباح');
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).not.toBe('post');
  });
  it('falls back for emoji-only titles', () => {
    const slug = slugify('🎉🎊');
    expect(slug.length).toBeGreaterThan(0);
  });
  it('falls back to post for empty input', () => {
    expect(slugify('')).toBe('post');
    expect(slugify('!!!')).toBe('post');
  });
});

describe('excerpt', () => {
  it('strips markdown and truncates at word boundary', () => {
    const text = excerpt('# Title\n\nSome **bold** words here and more words after.');
    expect(text).not.toContain('#');
    expect(text).not.toContain('**');
    expect(text.length).toBeLessThanOrEqual(161);
  });
  it('returns short content untouched', () => {
    expect(excerpt('Short.')).toBe('Short.');
  });
});

describe('readingTime', () => {
  it('returns at least 1 minute', () => {
    expect(readingTime('Hi.')).toBe(1);
  });
  it('computes words / 200 rounded up', () => {
    expect(readingTime(Array(401).fill('word').join(' '))).toBe(3);
  });
});

describe('formatDate', () => {
  it('returns text and ISO date', () => {
    const formatted = formatDate('2026-10-16T14:00:00.000Z');
    expect(formatted.dateTime).toBe('2026-10-16');
    expect(formatted.text).toContain('2026');
  });
});

describe('canonicalBlogPath', () => {
  it('builds id-slug paths', () => {
    expect(canonicalBlogPath({ id: 42, title: 'My First Post' })).toBe('/blogs/42-my-first-post');
  });
});

describe('parseBlogIdSlug', () => {
  it('parses the numeric prefix', () => {
    expect(parseBlogIdSlug('42-my-first-post')).toBe(42);
    expect(parseBlogIdSlug('abc')).toBeNull();
  });
});
