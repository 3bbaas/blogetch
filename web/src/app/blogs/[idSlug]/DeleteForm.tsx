'use client';

import { useEffect, useRef, useState } from 'react';
import { deleteBlogAction } from '@/lib/blog-actions';

const KEY_CLASSES =
  'key-btn inline-flex min-h-[44px] items-center justify-center px-4 py-2 text-sm';

export default function DeleteForm({ id, title }: { id: number; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={KEY_CLASSES}>
        Delete story
      </button>
    );
  }

  return (
    <form
      action={async () => {
        await deleteBlogAction(id);
      }}
      className="inline-flex flex-wrap items-center gap-2"
      aria-label={`Confirm deletion of ${title}`}
    >
      <span className="font-accent text-sm" role="status">
        Burn this story?
      </span>
      <button ref={confirmRef} type="submit" className={`${KEY_CLASSES} key-btn-primary`}>
        Yes, burn it
      </button>
      <button type="button" onClick={() => setConfirming(false)} className={KEY_CLASSES}>
        Keep it
      </button>
    </form>
  );
}
