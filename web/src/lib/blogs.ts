import { apiGet } from './api';
import {
  BlogListSchema,
  BlogSchema,
  CommentSchema,
  type Blog,
  type BlogComment,
  type BlogList,
} from './schemas';

export type BlogFilters = {
  page?: number;
  limit?: number;
  category?: string;
  author?: number;
  from?: string;
  to?: string;
  search?: string;
};

function toQuery(filters: BlogFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const query = params.toString();
  return query.length > 0 ? `?${query}` : '';
}

export async function listBlogs(filters: BlogFilters = {}): Promise<BlogList> {
  return apiGet(`/blogs${toQuery(filters)}`, (body) => BlogListSchema.parse(body), {
    tags: ['blogs'],
    revalidate: 60,
  });
}

export async function getBlog(id: number): Promise<Blog> {
  return apiGet(`/blogs/${id}`, (body) => BlogSchema.parse(body), {
    tags: ['blogs', `blog:${id}`],
    revalidate: 60,
  });
}

export async function getComments(blogId: number): Promise<BlogComment[]> {
  return apiGet(`/blogs/${blogId}/comments`, (body) => CommentSchema.array().parse(body), {
    tags: [`comments:${blogId}`],
    revalidate: 60,
  });
}
