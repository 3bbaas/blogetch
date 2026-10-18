import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  href?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'plain';
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  href,
  type = 'button',
  variant = 'plain',
  disabled = false,
  className = '',
}: Props) {
  const classes = `key-btn inline-flex min-h-[44px] items-center justify-center px-4 py-2 text-sm ${variant === 'primary' ? 'key-btn-primary' : ''} ${className}`;
  if (href !== undefined && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
