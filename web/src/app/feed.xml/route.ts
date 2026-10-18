import { env } from '@/lib/env';
import { listBlogs } from '@/lib/blogs';
import { excerpt } from '@/lib/helpers';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(): Promise<Response> {
  const site = env.NEXT_PUBLIC_SITE_URL;
  let items: { id: number; title: string; content: string; createdAt: string }[] = [];
  try {
    const result = await listBlogs({ limit: 20 });
    items = result.data;
  } catch {
    items = [];
  }
  const entries = items
    .map(
      (blog) => `    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${site}/blogs/${blog.id}</link>
      <guid>${site}/blogs/${blog.id}</guid>
      <pubDate>${new Date(blog.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(excerpt(blog.content))}</description>
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blogetch</title>
    <link>${site}/</link>
    <description>Sketch your thoughts. Print them proud.</description>
${entries}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
