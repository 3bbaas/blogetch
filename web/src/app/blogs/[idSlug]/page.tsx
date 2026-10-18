import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import JsonLd from '@/components/JsonLd';
import Byline from '@/components/ui/Byline';
import CategoryStamp from '@/components/ui/CategoryStamp';
import EmptyState from '@/components/ui/EmptyState';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { CommentList } from '@/components/ui/CommentList';
import CommentFormSection from './CommentFormSection';
import DeleteForm from './DeleteForm';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiError } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { getBlog, getComments, listBlogs } from '@/lib/blogs';
import { blogSlug, toCardStory } from '@/lib/cards';
import { excerpt, formatDate, parseBlogIdSlug, readingTime, stripMarkdown } from '@/lib/helpers';
import { env } from '@/lib/env';

type Params = Promise<{ idSlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { idSlug } = await params;
  const id = parseBlogIdSlug(idSlug);
  if (id === null) return { title: 'Story not found' };
  let blog;
  try {
    blog = await getBlog(id);
  } catch {
    return { title: 'Story not found' };
  }
  const description = excerpt(blog.content);
  const url = `/blogs/${blogSlug(blog)}`;
  return {
    title: blog.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: blog.title,
      description,
      url,
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: blog.author !== null ? [blog.author.name] : undefined,
      section: blog.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
    },
  };
}

async function Letters({ blogId }: { blogId: number }) {
  let letters: { id: number; content: string; authorName: string }[] = [];
  try {
    const comments = await getComments(blogId);
    letters = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      authorName: comment.author?.name ?? 'Anonymous',
    }));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <EmptyState
        title="The mailbag is stuck."
        hint="We could not fetch the letters. Please try again shortly."
      />
    );
  }
  return <CommentList letters={letters} />;
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { idSlug } = await params;
  const id = parseBlogIdSlug(idSlug);
  if (id === null) notFound();

  let blog;
  try {
    blog = await getBlog(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <>
        <EmptyState
          title="The presses are down."
          hint="We could not fetch this story. Please try again shortly."
        />
      </>
    );
  }

  const canonical = blogSlug(blog);
  if (idSlug !== canonical) permanentRedirect(`/blogs/${canonical}`);

  const date = formatDate(blog.createdAt);
  const user = await getCurrentUser();
  const canEdit =
    user !== null && (user.role === 'admin' || user.id === blog.authorId);

  let more: ReturnType<typeof toCardStory>[] = [];
  try {
    const related = await listBlogs({ category: blog.category, limit: 4 });
    more = related.data.filter((item) => item.id !== blog.id).slice(0, 3).map(toCardStory);
  } catch {
    more = [];
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: blog.title,
          datePublished: blog.createdAt,
          dateModified: blog.updatedAt,
          author:
            blog.author !== null
              ? { '@type': 'Person', name: blog.author.name }
              : undefined,
          image: `${env.NEXT_PUBLIC_SITE_URL}/blogs/${canonical}/opengraph-image`,
          articleSection: blog.category,
          wordCount: stripMarkdown(blog.content).split(/\s+/).filter((w) => w.length > 0).length,
          inLanguage: 'en',
          mainEntityOfPage: `${env.NEXT_PUBLIC_SITE_URL}/blogs/${canonical}`,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Front Page', item: env.NEXT_PUBLIC_SITE_URL },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'All Stories',
              item: `${env.NEXT_PUBLIC_SITE_URL}/blogs`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: blog.title,
              item: `${env.NEXT_PUBLIC_SITE_URL}/blogs/${canonical}`,
            },
          ],
        }}
      />
      <article>
        <CategoryStamp category={blog.category} />
        <h1 dir="auto" className="font-display mt-3 text-4xl font-extrabold text-balance md:text-5xl">
          {blog.title}
        </h1>
        <Byline
          authorName={blog.author?.name ?? 'Anonymous'}
          authorId={blog.author?.id ?? 0}
          date={date.text}
          dateTime={date.dateTime}
          readingTime={readingTime(blog.content)}
        />
        {canEdit && (
          <div className="mt-3 flex gap-2">
            <Button href={`/blogs/${canonical}/edit`}>Edit story</Button>
            <DeleteForm id={blog.id} title={blog.title} />
          </div>
        )}
        <div className="rule-double mt-4" aria-hidden="true" />
        <div className="drop-cap mt-4 max-w-[65ch] space-y-4" dir="auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {blog.content}
          </ReactMarkdown>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-label="More from this category" className="mt-10">
          <h2 className="font-accent text-sm tracking-[0.25em] uppercase">
            More from {blog.category}
          </h2>
          <div className="rule-double mt-1" aria-hidden="true" />
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
            {more.map((story) => (
              <ArticleCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Letters to the Editor" id="letters" className="mt-10">
        <h2 className="font-accent text-sm tracking-[0.25em] uppercase">Letters to the Editor</h2>
        <div className="rule-double mt-1" aria-hidden="true" />
        <div className="mt-4">
          <Suspense fallback={<Skeleton lines={4} />}>
            <Letters blogId={blog.id} />
          </Suspense>
        </div>
        <div className="mt-6">
          {user === null ? (
            <p>
              <a href="/login" className="underline underline-offset-4">
                Sign in to write a letter
              </a>
              .
            </p>
          ) : (
            <CommentFormSection blogId={blog.id} />
          )}
        </div>
      </section>
    </>
  );
}
