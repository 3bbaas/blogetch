import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVariables } from './fonts';
import { getTheme } from '@/lib/theme';
import { env } from '@/lib/env';

import Masthead from '@/components/ui/Masthead';
import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { getCurrentUser } from '@/lib/auth';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4ecd8' },
    { media: '(prefers-color-scheme: dark)', color: '#1b1712' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'Blogetch',
    template: '%s | Blogetch',
  },
  description: 'Sketch your thoughts. Print them proud. A nostalgic gazette of slow stories.',
  openGraph: {
    type: 'website',
    siteName: 'Blogetch',
    title: 'Blogetch',
    description: 'Sketch your thoughts. Print them proud.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blogetch',
    description: 'Sketch your thoughts. Print them proud.',
  },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/feed.xml' },
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.webmanifest',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mounted once: masthead/nav/footer persist across tab switches, so only
  // the page segment below suspends and re-renders on navigation.
  const theme = await getTheme();
  const user = await getCurrentUser();
  return (
    <html lang="en" data-theme={theme} className={fontVariables}>
      <body className="font-body antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:bg-paper focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <div className="ink-settle mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Masthead />
            </div>
            <ThemeToggle initial={theme} />
          </div>
          <div className="rule-double mt-3" aria-hidden="true" />
          <div className="mt-3">
            <Nav userName={user?.name ?? null} />
          </div>
          <main id="content" className="mt-6">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
