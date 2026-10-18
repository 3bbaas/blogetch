'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';

const Editor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Rich markdown editor (client-only: it measures the DOM). The hidden input
// carries the value to the Server Action; the form still needs JS, which is
// acceptable for an authoring tool (public content stays server-rendered).
export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [colorMode] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.dataset['theme'] === 'night' ? 'dark' : 'light';
  });
  return (
    <div data-color-mode={colorMode} className="md-editor-gazette">
      <Editor
        value={value}
        onChange={(next) => onChange(next ?? '')}
        preview="live"
        height={380}
        textareaProps={{ 'aria-label': 'Story content in markdown', required: true }}
      />
      <input type="hidden" name="content" value={value} />
    </div>
  );
}
