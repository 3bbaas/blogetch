'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/auth';

const LINKS = [
  { href: '/', label: 'Front Page' },
  { href: '/blogs', label: 'All Stories' },
  { href: '/about', label: 'Colophon' },
] as const;

// One shared box for every nav item (links AND the sign-out button). The
// sign-out <button> previously carried `min-h-[44px]` on its own, so its text
// sat higher than the adjacent links; giving them all the same inline-flex
// box keeps them on one baseline/position (and preserves the 44px tap target).
const itemClass =
  'font-accent inline-flex min-h-[44px] items-center text-sm tracking-widest uppercase underline-offset-4 hover:underline';
const itemActiveClass = 'aria-[current=page]:text-accent aria-[current=page]:underline';

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
              className={`${itemClass} ${itemActiveClass}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
        {userName === null ? (
          <li>
            <Link href="/login" className={itemClass}>
              Sign in
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link
                href="/write"
                aria-current={isCurrent(pathname, '/write') ? 'page' : undefined}
                className={`${itemClass} ${itemActiveClass}`}
              >
                Write
              </Link>
            </li>
            <li>
              <Link
                href="/desk"
                aria-current={isCurrent(pathname, '/desk') ? 'page' : undefined}
                className={`${itemClass} ${itemActiveClass}`}
              >
                My Desk
              </Link>
            </li>
            <li>
              <form action={logoutAction} className="inline-flex">
                <button
                  type="submit"
                  className={itemClass}
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
