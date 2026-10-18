import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

export type AppEnv = z.infer<typeof envSchema>;

function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse({
    API_URL: process.env['API_URL'],
    NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'],
    COOKIE_SECURE: process.env['COOKIE_SECURE'],
  });
  if (!parsed.success) {
    throw new Error(`Invalid web environment: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const env: AppEnv = loadEnv();
