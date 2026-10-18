import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiSend, buildNextOptions } from './api';

describe('buildNextOptions', () => {
  it('merges tags and revalidate into one next object', () => {
    expect(buildNextOptions({ tags: ['comments:1'], revalidate: 60 })).toEqual({
      next: { tags: ['comments:1'], revalidate: 60 },
    });
  });

  it('keeps tags alone and revalidate alone', () => {
    expect(buildNextOptions({ tags: ['blogs'] })).toEqual({ next: { tags: ['blogs'] } });
    expect(buildNextOptions({ revalidate: 60 })).toEqual({ next: { revalidate: 60 } });
  });

  it('returns no next key when neither is set', () => {
    expect(buildNextOptions({})).toEqual({});
  });
});

function stubFetch(response: Response): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(response)),
  );
}

// Regression test: POST /auth/register answers 201 with an EMPTY body.
// Parsing that as JSON used to throw `Unexpected end of JSON input` and
// crash the Server Action.
describe('apiSend empty bodies', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves undefined for an empty 201 body', async () => {
    stubFetch(new Response('', { status: 201 }));
    const seen: unknown[] = [];
    await apiSend(
      '/auth/register',
      (body: unknown) => {
        seen.push(body);
        return undefined as void;
      },
      { method: 'POST', body: { email: 'a@b.c' } },
    );
    expect(seen).toEqual([undefined]);
  });

  it('resolves undefined for non-JSON 200 bodies instead of crashing', async () => {
    stubFetch(new Response('<html>proxy</html>', { status: 200 }));
    const seen: unknown[] = [];
    await apiSend(
      '/x',
      (body: unknown) => {
        seen.push(body);
        return undefined as void;
      },
      { method: 'GET' },
    );
    expect(seen).toEqual([undefined]);
  });

  it('still parses real JSON bodies', async () => {
    stubFetch(new Response(JSON.stringify({ accessToken: 't' }), { status: 200 }));
    let token = '';
    await apiSend(
      '/auth/login',
      (body: unknown) => {
        const record = body as { accessToken: string };
        token = record.accessToken;
        return undefined as void;
      },
      { method: 'POST', body: {} },
    );
    expect(token).toBe('t');
  });
});
