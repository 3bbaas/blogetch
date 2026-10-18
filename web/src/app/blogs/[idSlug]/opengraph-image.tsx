import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { getBlog } from '@/lib/blogs';
import { loadOgFonts } from '@/lib/og-font';
import { ogLogoDataUri } from '@/lib/og-logo';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ArticleOpengraphImage({
  params,
}: {
  params: Promise<{ idSlug: string }>;
}): Promise<ImageResponse> {
  const { idSlug } = await params;
  const id = Number.parseInt(idSlug.split('-')[0] ?? '', 10);
  if (Number.isNaN(id)) notFound();
  let blog;
  try {
    blog = await getBlog(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const fonts = await loadOgFonts();
  const logo = await ogLogoDataUri();
  const headline =
    blog.title.length > 90 ? `${blog.title.slice(0, 87)}…` : blog.title;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f4ecd8',
          borderTop: '12px solid #1e1a16',
          borderBottom: '12px solid #1e1a16',
          padding: '0 90px',
        }}
      >
        <img src={logo} width={220} height={220} style={{ marginRight: 50 }} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
        <div style={{ fontFamily: 'Special Elite', fontSize: 30, letterSpacing: 6, color: '#5a4a38' }}>
          {`BLOGETCH · ${blog.category.toUpperCase()}`}
        </div>
        <div
          style={{
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            fontSize: 76,
            color: '#1e1a16',
            lineHeight: 1.1,
            marginTop: 18,
            display: 'flex',
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontFamily: 'Special Elite',
            fontSize: 28,
            color: '#f4ecd8',
            backgroundColor: '#8b2e2a',
            padding: '6px 20px',
            marginTop: 26,
            transform: 'rotate(-2deg)',
          }}
        >
          {`BY ${(blog.author?.name ?? 'ANONYMOUS').toUpperCase()}`}
        </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
