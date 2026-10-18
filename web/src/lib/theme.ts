import { cookies } from 'next/headers';

export const THEME_COOKIE = 'blogetch-theme';
export type Theme = 'day' | 'night';

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  return store.get(THEME_COOKIE)?.value === 'night' ? 'night' : 'day';
}

export async function setThemeCookie(theme: Theme): Promise<void> {
  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
