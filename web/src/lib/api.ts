import { env } from './env';
import { ApiValidationErrorSchema } from './schemas';

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: FieldErrors = {},
  ) {
    super(message);
  }
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  tags?: string[];
  revalidate?: number | false;
};

// Builds the fetch `next` option in ONE object. Never spread two separate
// `{ next: ... }` objects: the later silently overwrites the earlier and
// drops the cache tags, which makes every updateTag() a no-op (comments
// then only appear after the revalidate window or a full relogin).
export function buildNextOptions(options: Pick<ApiOptions, 'tags' | 'revalidate'>): {
  next?: { tags?: string[]; revalidate?: number | false };
} {
  if (options.tags === undefined && options.revalidate === undefined) return {};
  return {
    next: {
      ...(options.tags !== undefined ? { tags: options.tags } : {}),
      ...(options.revalidate !== undefined ? { revalidate: options.revalidate } : {}),
    },
  };
}

async function requestOnce<T>(
  path: string,
  parse: (body: unknown) => T,
  options: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${env.API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token !== undefined ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(8000),
    ...buildNextOptions(options),
  });

  if (response.status === 401) {
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }
  if (response.status === 422) {
    const parsed = ApiValidationErrorSchema.safeParse(await readBody(response));
    const fieldErrors = parsed.success ? parsed.data.errors : {};
    throw new ApiError(422, 'Please correct the marked fields.', fieldErrors);
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed with status ${response.status}.`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return parse(await readBody(response));
}

// Some endpoints answer 201 with an empty body (e.g. register). Parsing
// that as JSON throws `Unexpected end of JSON input`, so empty (or
// non-JSON, e.g. proxy error pages) bodies become `undefined` instead of
// crashing the calling Server Action.
async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

// One retry for idempotent GETs only.
export async function apiGet<T>(
  path: string,
  parse: (body: unknown) => T,
  options: Omit<ApiOptions, 'method' | 'body'> = {},
): Promise<T> {
  try {
    return await requestOnce(path, parse, options);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return requestOnce(path, parse, options);
  }
}

export async function apiSend<T>(
  path: string,
  parse: (body: unknown) => T,
  options: Omit<ApiOptions, 'tags' | 'revalidate'> & { method: string },
): Promise<T> {
  return requestOnce(path, parse, options);
}
