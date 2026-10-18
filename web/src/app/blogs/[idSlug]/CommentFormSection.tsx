'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CommentForm from '@/components/ui/CommentForm';
import { createCommentAction, type ActionState } from '@/lib/blog-actions';

const initial: ActionState = {};

// NOTE: pass the module-level action directly, never an inline `.bind()` or
// closure: useActionState resets its state when the action identity changes
// between renders, which silently drops the success state (and the refresh
// below with it). Per-action arguments travel in hidden form fields.
export default function CommentFormSection({ blogId }: { blogId: number }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [state, action, pending] = useActionState(createCommentAction, initial);

  // On success the tags are already invalidated server-side: refresh the
  // segment in place (no full reload), clear the form, reveal the letter.
  useEffect(() => {
    if (state.ok === true) {
      wrapperRef.current?.querySelector('form')?.reset();
      router.refresh();
      document.getElementById('letters')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state, router]);

  return (
    <div ref={wrapperRef}>
      <CommentForm action={action} fieldErrors={state.fieldErrors} pending={pending} blogId={blogId} />
    </div>
  );
}
