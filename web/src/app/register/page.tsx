import Link from 'next/link';
import { RegisterForm } from '@/components/AuthForms';
import { registerAction } from '@/lib/auth';

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold">Join the gazette</h1>
      <p className="text-ink-soft">
        A pen name, an email, a password — that is the whole application.{' '}
        <Link href="/login" className="underline underline-offset-4">
          Sign in
        </Link>{' '}
        if you already have a desk.
      </p>
      <div className="mt-4 max-w-md">
        <RegisterForm action={registerAction} />
      </div>
    </>
  );
}
