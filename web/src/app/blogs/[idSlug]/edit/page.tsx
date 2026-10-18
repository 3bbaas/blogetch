import { notFound } from 'next/navigation';
import BlogForm from '@/components/BlogForm';
import EmptyState from '@/components/ui/EmptyState';
import { ApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { updateBlogAction } from '@/lib/blog-actions';
import { getBlog } from '@/lib/blogs';
import { parseBlogIdSlug } from '@/lib/helpers';

export default async function EditPage({ params }: { params: Promise<{ idSlug: string }> }) {
  const { idSlug } = await params;
  const id = parseBlogIdSlug(idSlug);
  if (id === null) notFound();
  const user = await requireUser(`/blogs/${idSlug}/edit`);

  let blog;
  try {
    blog = await getBlog(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <>
        <EmptyState title="The presses are down." hint="Please try again shortly." />
      </>
    );
  }

  if (user.role !== 'admin' && user.id !== blog.authorId) {
    return (
      <>
        <EmptyState
          title="Not your story to set."
          hint="Only the author or the editor may revise this piece. (403)"
        />
      </>
    );
  }

  // NOTE: pass the module-level action directly (never .bind): see CommentFormSection.
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">Revise the story</h1>
      <div className="mt-4">
        <BlogForm
          action={updateBlogAction}
          blogId={blog.id}
          defaults={{ title: blog.title, content: blog.content, category: blog.category }}
          draftKey={`blogetch-draft-${blog.id}`}
          submitLabel="Reprint it"
        />
      </div>
    </>
  );
}
