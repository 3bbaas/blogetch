'use client';

import { useEffect, useState } from 'react';

export type ToastNote = { id: number; text: string };

export default function Toast({ notes }: { notes: ToastNote[] }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (notes.length === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [notes]);

  if (notes.length === 0 || !visible) return null;
  return (
    <div aria-live="polite" className="fixed inset-x-0 bottom-4 z-[60] mx-auto w-fit max-w-[90vw]">
      {notes.map((note) => (
        <p key={note.id} className="telegram font-accent px-4 py-2 text-sm" dir="auto">
          <span aria-hidden="true">✦ STOP ✦ </span>
          {note.text}
        </p>
      ))}
    </div>
  );
}
