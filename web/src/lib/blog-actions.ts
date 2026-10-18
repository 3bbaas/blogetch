'use server';

import { updateTag } from 'next/cache';
import { field } from './form';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { apiSend, ApiError } from './api';
import { authToken, requireUser } from './auth';
import { BLOG_CATEGORIES, BlogSchema } from './schemas';

export type ActionState = {
  fieldErrors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

const blogSchema = z.object({
  title: z.string().trim().min(1).max(150),
  content: z.string().trim().min(1),
  category: z.enum(BLOG_CATEGORIES),
});

export async function createBlogAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser('/write');
  const token = await authToken();
  const parsed = blogSchema.safeParse({
    title: field(formData, 'title'),
    content: field(formData, 'content'),
    category: field(formData, 'category'),
  });
  if (!parsed.success) {
    return { message: 'Please correct the marked fields.', fieldErrors: {} };
  }
  try {
    const blog = await apiSend('/blogs', (body) => BlogSchema.parse(body), {
      method: 'POST',
      body: parsed.data,
      token: token ?? undefined,
    });
    updateTag('blogs');
    updateTag(`blog:${blog.id}`);
    redirect(`/blogs/${blog.id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, fieldErrors: error.fieldErrors };
    }
    throw error;
  }
}

export async function updateBlogAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number.parseInt(field(formData, 'blogId'), 10);
  if (Number.isNaN(id)) {
    return { message: 'Missing story reference. Please reload and try again.' };
  }
  await requireUser(`/blogs/${id}/edit`);
  const token = await authToken();
  const parsed = blogSchema.safeParse({
    title: field(formData, 'title'),
    content: field(formData, 'content'),
    category: field(formData, 'category'),
  });
  if (!parsed.success) {
    return { message: 'Please correct the marked fields.', fieldErrors: {} };
  }
  try {
    await apiSend(`/blogs/${id}`, (body) => BlogSchema.parse(body), {
      method: 'PUT',
      body: parsed.data,
      token: token ?? undefined,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, fieldErrors: error.fieldErrors };
    }
    throw error;
  }
  updateTag('blogs');
  updateTag(`blog:${id}`);
  redirect(`/blogs/${id}`);
}

export async function deleteBlogAction(id: number): Promise<void> {
  await requireUser('/desk');
  const token = await authToken();
  await apiSend(`/blogs/${id}`, () => undefined as void, {
    method: 'DELETE',
    token: token ?? undefined,
  });
  updateTag('blogs');
  updateTag(`blog:${id}`);
  redirect('/desk');
}

const commentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export async function createCommentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const blogId = Number.parseInt(field(formData, 'blogId'), 10);
  if (Number.isNaN(blogId)) {
    return { message: 'Missing story reference. Please reload and try again.' };
  }
  await requireUser(`/blogs/${blogId}`);
  const token = await authToken();
  const parsed = commentSchema.safeParse({
    content: field(formData, 'content'),
  });
  if (!parsed.success) {
    return { message: 'Please correct the marked fields.', fieldErrors: {} };
  }
  try {
    await apiSend(`/blogs/${blogId}/comments`, () => undefined as void, {
      method: 'POST',
      body: parsed.data,
      token: token ?? undefined,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, fieldErrors: error.fieldErrors };
    }
    throw error;
  }
  updateTag('blogs');
  updateTag(`blog:${blogId}`);
  updateTag(`comments:${blogId}`);
  // No redirect: the caller refreshes the segment in place (router.refresh),
  // so the new letter appears without a full reload. Redirecting to the
  // same URL would skip the refetch and show a stale list.
  return { ok: true };
}
