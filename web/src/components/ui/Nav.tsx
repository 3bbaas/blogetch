'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/auth';

const LINKS = [
  { href: '/', label: 'Front Page' },
  { href: '/blogs', label: 'All Stories' },
  { href: '/about', label: 'Colophon' },
] as const;

function isCurrent(current: string, href: string): boolean {
  if (href === '/') return current === '/';
  return current === href || current.startsWith(`${href}/`);
}

export default function Nav({ userName = null }: { userName?: string | null }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Sections" className="border-b border-rule pb-2">
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
              className="font-accent text-sm tracking-widest uppercase underline-offset-4 hover:underline aria-[current=page]:text-accent aria-[current=page]:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
        {userName === null ? (
          <li>
            <Link
              href="/login"
              className="font-accent text-sm tracking-widest uppercase underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link
                href="/write"
                aria-current={isCurrent(pathname, '/write') ? 'page' : undefined}
                className="font-accent text-sm tracking-widest uppercase underline-offset-4 hover:underline aria-[current=page]:text-accent aria-[current=page]:underline"
              >
                Write
              </Link>
            </li>
            <li>
              <Link
                href="/desk"
                aria-current={isCurrent(pathname, '/desk') ? 'page' : undefined}
                className="font-accent text-sm tracking-widest uppercase underline-offset-4 hover:underline aria-[current=page]:text-accent aria-[current=page]:underline"
              >
                My Desk
              </Link>
            </li>
            <li>
              <form action={logoutAction} className="inline">
                <button
                  type="submit"
                  className="font-accent min-h-[44px] text-sm tracking-widest uppercase underline-offset-4 hover:underline"
                  aria-label={`Sign out ${userName}`}
                >
                  Sign out
                </button>
              </form>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
