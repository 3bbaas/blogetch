'use client';

import { useActionState, useEffect, useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import type { ActionState } from '@/lib/blog-actions';
import { BLOG_CATEGORIES } from '@/lib/schemas';

export type BlogDefaults = {
  title: string;
  content: string;
  category: string;
};

export default function BlogForm({
  action,
  defaults,
  draftKey,
  submitLabel,
  blogId,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: BlogDefaults;
  draftKey: string;
  submitLabel: string;
  blogId?: number;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [title, setTitle] = useState(defaults.title);
  const [content, setContent] = useState(defaults.content);
  const [category, setCategory] = useState(defaults.category);
  const [restored, setRestored] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Local draft autosave (client only). Restored once with a notice.
  // Runs only on mount by design: later keystrokes are saved by the
  // debounced effect below.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw !== null && defaults.title === '' && defaults.content === '') {
        const draft = JSON.parse(raw) as Partial<BlogDefaults>;
        if (typeof draft.title === 'string') setTitle(draft.title);
        if (typeof draft.content === 'string') setContent(draft.content);
        if (typeof draft.category === 'string') setCategory(draft.category);
        setRestored(true);
      }
    } catch {
      // A corrupt draft is simply ignored.
    }
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const save = (): void => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify({ title, content, category }));
      } catch {
        // Storage full or unavailable: drafting is best-effort.
      }
    };
    const timer = setTimeout(save, 500);
    return () => clearTimeout(timer);
  }, [title, content, category, dirty, draftKey]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  function clearDraft(): void {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // Best-effort.
    }
    setDirty(false);
  }

  return (
    <form
      action={(formData: FormData) => {
        clearDraft();
        return formAction(formData);
      }}
      className="space-y-4"
    >
      {blogId !== undefined && <input type="hidden" name="blogId" value={blogId} />}
      {restored && (
        <p role="status" className="telegram font-accent px-4 py-2 text-sm">
          Draft restored from your desk drawer.
        </p>
      )}
      {state.message !== undefined && (
        <p role="alert" className="font-accent text-accent">
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor="story-title" className="font-accent text-sm tracking-widest uppercase">
          Headline *
        </label>
        <input
          id="story-title"
          name="title"
          required
          maxLength={150}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setDirty(true);
          }}
          aria-describedby={state.fieldErrors?.['title'] !== undefined ? 'story-title-error' : undefined}
          aria-invalid={state.fieldErrors?.['title'] !== undefined}
          className="ruled-input font-display text-2xl font-bold"
        />
        <p className="font-accent mt-1 text-xs text-ink-soft" aria-live="polite">
          {title.length}/150
        </p>
        <FieldError id="story-title-error" messages={state.fieldErrors?.['title']} />
      </div>
      <div>
        <label htmlFor="story-category" className="font-accent text-sm tracking-widest uppercase">
          Section *
        </label>
        <select
          id="story-category"
          name="category"
          required
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setDirty(true);
          }}
          className="ruled-input min-h-[44px]"
        >
          <option value="">Pick a section…</option>
          {BLOG_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <FieldError id="story-category-error" messages={state.fieldErrors?.['category']} />
      </div>
      <div>
        <span id="story-content-label" className="font-accent text-sm tracking-widest uppercase">
          Story (markdown) *
        </span>
        <div className="mt-2">
          <MarkdownEditor
            value={content}
            onChange={(next) => {
              setContent(next);
              setDirty(true);
            }}
          />
        </div>
        <p className="font-accent mt-1 text-xs text-ink-soft" aria-live="polite">
          {content.length} characters
        </p>
        <FieldError id="story-content-error" messages={state.fieldErrors?.['content']} />
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Printing…' : submitLabel}
      </Button>
    </form>
  );
}
