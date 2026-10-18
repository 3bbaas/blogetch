'use server';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { field } from './form';
import { z } from 'zod';
import { apiGet, apiSend, ApiError } from './api';
import { env } from './env';
import { LoginResponseSchema, PublicUserSchema, type PublicUser } from './schemas';
import { TOKEN_COOKIE } from './auth-cookie';

async function readToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

async function writeToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

async function clearToken(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}

// Deduped per request: every server component needing the user shares one call.
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const token = await readToken();
  if (token === null) return null;
  try {
    return await apiGet('/auth/me', (body) => PublicUserSchema.parse(body), { token });
  } catch {
    return null;
  }
});

export async function requireUser(next: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (user === null) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(
  _prev: { fieldErrors?: Record<string, string[]>; message?: string },
  formData: FormData,
): Promise<{ fieldErrors?: Record<string, string[]>; message?: string }> {
  const parsed = credentialsSchema.safeParse({
    email: field(formData, 'email'),
    password: field(formData, 'password'),
  });
  if (!parsed.success) {
    return { message: 'Please correct the marked fields.', fieldErrors: {} };
  }
  try {
    const result = await apiSend('/auth/login', (body) => LoginResponseSchema.parse(body), {
      method: 'POST',
      body: parsed.data,
    });
    await writeToken(result.accessToken);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, fieldErrors: error.fieldErrors };
    }
    throw error;
  }
  const rawNext = field(formData, 'next');
  const next = rawNext !== '' ? rawNext : '/desk';
  updateTag('blogs');
  redirect(next.startsWith('/') ? next : '/desk');
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerAction(
  _prev: { fieldErrors?: Record<string, string[]>; message?: string },
  formData: FormData,
): Promise<{ fieldErrors?: Record<string, string[]>; message?: string }> {
  const parsed = registerSchema.safeParse({
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    password: field(formData, 'password'),
  });
  if (!parsed.success) {
    return { message: 'Please correct the marked fields.', fieldErrors: {} };
  }
  try {
    await apiSend('/auth/register', () => undefined as void, {
      method: 'POST',
      body: parsed.data,
    });
    const login = await apiSend('/auth/login', (body) => LoginResponseSchema.parse(body), {
      method: 'POST',
      body: { email: parsed.data.email, password: parsed.data.password },
    });
    await writeToken(login.accessToken);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, fieldErrors: error.fieldErrors };
    }
    throw error;
  }
  updateTag('blogs');
  redirect('/desk');
}

export async function logoutAction(): Promise<void> {
  await clearToken();
  redirect('/login');
}

export async function authToken(): Promise<string | null> {
  return readToken();
}
