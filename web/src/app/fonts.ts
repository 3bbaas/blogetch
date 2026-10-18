import { Amiri, Lora, Playfair_Display, Special_Elite } from 'next/font/google';

// Self-hosted via next/font: CSS and files are downloaded at build time,
// no requests leave the browser. Variables are wired to Tailwind in globals.css.
export const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const bodyFont = Lora({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const accentFont = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
});

// Rarely used (RTL fallback only), so it is not preloaded.
export const arabicFont = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable} ${accentFont.variable} ${arabicFont.variable}`;
