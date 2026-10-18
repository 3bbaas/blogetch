import BlogForm from '@/components/BlogForm';
import { requireUser } from '@/lib/auth';
import { createBlogAction } from '@/lib/blog-actions';

export default async function WritePage() {
  await requireUser('/write');
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">File a new story</h1>
      <p className="text-ink-soft">Dip the pen. The presses are warm.</p>
      <div className="mt-4">
        <BlogForm
          action={createBlogAction}
          defaults={{ title: '', content: '', category: '' }}
          draftKey="blogetch-draft-new"
          submitLabel="Print it"
        />
      </div>
    </>
  );
}
