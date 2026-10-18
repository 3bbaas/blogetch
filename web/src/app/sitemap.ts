import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { listBlogs } from '@/lib/blogs';
import { BLOG_CATEGORIES } from '@/lib/schemas';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = env.NEXT_PUBLIC_SITE_URL;
  const statics: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: new Date() },
    { url: `${site}/blogs`, lastModified: new Date() },
    { url: `${site}/about`, lastModified: new Date() },
  ];
  for (const category of BLOG_CATEGORIES) {
    statics.push({ url: `${site}/category/${category.toLowerCase()}` });
  }

  // Never let a sleeping API break sitemap generation.
  try {
    const entries: MetadataRoute.Sitemap = [];
    const authors = new Map<number, string>();
    let page = 1;
    for (;;) {
      const result = await listBlogs({ page, limit: 50 });
      for (const blog of result.data) {
        entries.push({
          url: `${site}/blogs/${blog.id}`,
          lastModified: new Date(blog.updatedAt),
        });
        if (blog.author !== null && !authors.has(blog.author.id)) {
          authors.set(blog.author.id, blog.author.name);
        }
      }
      if (page >= result.meta.totalPages || result.data.length === 0) break;
      page += 1;
    }
    for (const id of authors.keys()) {
      entries.push({ url: `${site}/authors/${id}` });
    }
    return [...statics, ...entries];
  } catch {
    return statics;
  }
}
