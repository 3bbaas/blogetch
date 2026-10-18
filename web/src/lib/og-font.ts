import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Fonts committed under src/assets/fonts so OG images render with zero
// network access (offline-safe, deterministic across deploys). satori only
// accepts TrueType/OpenType (no woff2), hence .ttf files.
export type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700 };

export async function loadOgFonts(): Promise<OgFont[]> {
  const dir = join(process.cwd(), 'src', 'assets', 'fonts');
  const [playfair, elite] = await Promise.all([
    readFile(join(dir, 'playfair-700-latin.ttf')),
    readFile(join(dir, 'special-elite-400-latin.ttf')),
  ]);
  const toBuffer = (buf: Buffer): ArrayBuffer =>
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return [
    { name: 'Playfair Display', data: toBuffer(playfair), weight: 700 },
    { name: 'Special Elite', data: toBuffer(elite), weight: 400 },
  ];
}
