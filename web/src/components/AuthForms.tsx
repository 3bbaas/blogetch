'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/fields';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import type { ActionState } from '@/lib/blog-actions';

export function LoginForm({
  action,
  next,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  next: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.message !== undefined && (
        <p role="alert" className="font-accent text-accent">
          {state.message}
        </p>
      )}
      <Input id="login-email" name="email" label="Email" type="email" required />
      <Input id="login-password" name="password" label="Password" type="password" required />
      <FieldError id="login-error" messages={state.fieldErrors?.['form']} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Opening the door…' : 'Sign in'}
      </Button>
    </form>
  );
}

export function RegisterForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {state.message !== undefined && (
        <p role="alert" className="font-accent text-accent">
          {state.message}
        </p>
      )}
      <Input id="register-name" name="name" label="Pen name" required />
      <Input id="register-email" name="email" label="Email" type="email" required />
      <Input
        id="register-password"
        name="password"
        label="Password (8+ characters)"
        type="password"
        required
      />
      <FieldError id="register-password-error" messages={state.fieldErrors?.['password']} />
      <FieldError id="register-email-error" messages={state.fieldErrors?.['email']} />
      <FieldError id="register-name-error" messages={state.fieldErrors?.['name']} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Setting your chair…' : 'Join the gazette'}
      </Button>
    </form>
  );
}
