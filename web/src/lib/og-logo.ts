import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// OG <img> tags cannot use absolute site URLs: inside Docker the public
// host is unreachable from the container itself. Embedding the file as a
// data URI works everywhere with zero network access.
let cached: string | null = null;

export async function ogLogoDataUri(): Promise<string> {
  if (cached === null) {
    const bytes = await readFile(
      join(process.cwd(), 'public', 'blogetch-transparent-logo.png'),
    );
    cached = `data:image/png;base64,${bytes.toString('base64')}`;
  }
  return cached;
}
