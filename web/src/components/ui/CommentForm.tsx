'use client';

import { Textarea } from './fields';
import FieldError from './FieldError';
import Button from './Button';

// Presentational shell: Phase C wires the Server Action + 422 errors.
export default function CommentForm({
  action,
  fieldErrors = {},
  pending = false,
  blogId,
}: {
  action: (formData: FormData) => void;
  fieldErrors?: Record<string, string[]>;
  pending?: boolean;
  blogId: number;
}) {
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="blogId" value={blogId} />
      <Textarea
        id="letter-content"
        name="content"
        label="Your letter"
        required
        errorId={fieldErrors['content'] !== undefined ? 'letter-content-error' : undefined}
      />
      <FieldError id="letter-content-error" messages={fieldErrors['content']} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Posting…' : 'Post the letter'}
      </Button>
    </form>
  );
}
