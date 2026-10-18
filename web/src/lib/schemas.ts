import { z } from 'zod';

// Must mirror api/src/blogs/enums/blog-category.enum.ts (which re-exports
// the Prisma enum). The contract test enforces this; change both together.
export const BLOG_CATEGORIES = [
  'Technology',
  'Lifestyle',
  'Education',
  'Business',
  'Science',
  'Other',
] as const;

export const BlogCategorySchema = z.enum(BLOG_CATEGORIES);
export type BlogCategory = z.infer<typeof BlogCategorySchema>;

const AuthorViewSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const PublicUserSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'author']),
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const BlogSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  content: z.string(),
  category: BlogCategorySchema,
  authorId: z.number().int(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  author: AuthorViewSchema.nullable(),
});
export type Blog = z.infer<typeof BlogSchema>;

export const CommentSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  blogId: z.number().int(),
  userId: z.number().int(),
  createdAt: z.string().min(1),
  author: AuthorViewSchema.nullable(),
});
export type BlogComment = z.infer<typeof CommentSchema>;

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    meta: z.object({
      total: z.number().int(),
      page: z.number().int(),
      limit: z.number().int(),
      totalPages: z.number().int(),
    }),
  });
}

export const BlogListSchema = paginatedSchema(BlogSchema);
export type BlogList = z.infer<typeof BlogListSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: PublicUserSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const ApiValidationErrorSchema = z.object({
  statusCode: z.literal(422),
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())),
});
export type ApiValidationError = z.infer<typeof ApiValidationErrorSchema>;
