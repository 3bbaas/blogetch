import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blogetch',
  description: 'Sketch your thoughts. Print them proud.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
