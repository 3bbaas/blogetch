import Image from 'next/image';
import { getTheme } from '@/lib/theme';

// Theme-aware printer's mark: both lockups ship real transparency
// (verified from the PNG chunks), so they composite cleanly on paper.
export default async function PressMark({
  size = 112,
  priority = false,
}: {
  size?: number;
  priority?: boolean;
}) {
  const theme = await getTheme();
  const night = theme === 'night';
  return (
    <Image
      src={night ? '/blogetch-transparent-logo-dark.png' : '/blogetch-transparent-logo.png'}
      alt="Blogetch printer's mark: a fountain pen over an open book"
      width={1280}
      height={1280}
      style={{ width: size, height: size }}
      className="mx-auto"
      priority={priority}
      loading={priority ? undefined : 'lazy'}
    />
  );
}
