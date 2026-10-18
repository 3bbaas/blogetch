import Link from 'next/link';
import { LoginForm } from '@/components/AuthForms';
import { loginAction } from '@/lib/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const nextValue = Array.isArray(raw['next']) ? raw['next'][0] : raw['next'];
  const next = nextValue !== undefined && nextValue.startsWith('/') ? nextValue : '/desk';
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">Sign in</h1>
      <p className="text-ink-soft">
        Reporters only beyond this point.{' '}
        <Link href="/register" className="underline underline-offset-4">
          Join the gazette
        </Link>{' '}
        if you are new.
      </p>
      <div className="mt-4 max-w-md">
        <LoginForm action={loginAction} next={next} />
      </div>
    </>
  );
}
