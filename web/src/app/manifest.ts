import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Blogetch',
    short_name: 'Blogetch',
    description: 'Sketch your thoughts. Print them proud.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4ecd8',
    theme_color: '#f4ecd8',
    icons: [
      { src: '/icon.png', sizes: 'any', type: 'image/png' },
    ],
  };
}
