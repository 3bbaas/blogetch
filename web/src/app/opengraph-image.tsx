import { ImageResponse } from 'next/og';
import { loadOgFonts } from '@/lib/og-font';
import { ogLogoDataUri } from '@/lib/og-logo';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function SiteOpengraphImage(): Promise<ImageResponse> {
  const fonts = await loadOgFonts();
  const logo = await ogLogoDataUri();
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
        }}
      >
        <img
          src={logo}
          width={300}
          height={300}
          style={{ marginRight: 40 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontFamily: 'Special Elite', fontSize: 32, letterSpacing: 8, color: '#5a4a38' }}>
            A NOSTALGIC GAZETTE
          </div>
          <div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 120, color: '#1e1a16' }}>
            Blogetch
          </div>
          <div
            style={{
              fontFamily: 'Special Elite',
              fontSize: 30,
              color: '#ffffff',
              backgroundColor: '#8b2e2a',
              border: '3px solid #8b2e2a',
              padding: '6px 22px',
              transform: 'rotate(-2deg)',
            }}
          >
            SKETCH YOUR THOUGHTS
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
