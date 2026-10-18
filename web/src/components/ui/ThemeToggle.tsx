'use client';

import { useState } from 'react';
import type { Theme } from '@/lib/theme';

function writeTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  document.cookie = `blogetch-theme=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export default function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);

  function toggle(): void {
    const next: Theme = theme === 'day' ? 'night' : 'day';
    setTheme(next);
    writeTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="key-btn min-h-[44px] px-3 py-1 text-sm"
      aria-pressed={theme === 'night'}
      aria-label={theme === 'day' ? 'Switch to Night Edition' : 'Switch to Day Edition'}
    >
      {theme === 'day' ? '☾ Night Edition' : '☀ Day Edition'}
    </button>
  );
}
