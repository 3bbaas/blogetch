import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { truncateAll } from './db-helpers';

interface ResponseWithBody {
  body: unknown;
  status: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getField(body: unknown, field: string): unknown {
  if (!isRecord(body)) {
    throw new Error('Expected response body to be an object');
  }
  return body[field];
}

function getStringField(body: unknown, field: string): string {
  const value: unknown = getField(body, field);
  if (typeof value !== 'string') {
    throw new Error(`Expected body.${field} to be a string`);
  }
  return value;
}

function getNumberField(body: unknown, field: string): number {
  const value: unknown = getField(body, field);
  if (typeof value !== 'number') {
    throw new Error(`Expected body.${field} to be a number`);
  }
  return value;
}

function getErrorsField(body: unknown): Record<string, unknown> {
  if (!isRecord(body)) {
    throw new Error('Expected response body to be an object');
  }
  expect(body['statusCode']).toBe(422);
  const errors: unknown = body['errors'];
  if (!isRecord(errors)) {
    throw new Error('Expected body.errors to be an object');
  }
  return errors;
}

function expectNoPasswordHash(res: ResponseWithBody): void {
  expect(JSON.stringify(res.body)).not.toContain('passwordHash');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('Blogs full table (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken = '';
  let tokenA = '';
  let tokenB = '';
  let idA = 0;
  let blogId1 = 0;
  let blog1CreatedAt = '';

  beforeAll(async () => {
    process.env['JWT_SECRET'] ??= 'test-secret-that-is-long-enough';
    // Direct assignment (not ??=): the auth suite deletes these vars in the
    // same worker process, and the admin seed is required here.
    process.env['ADMIN_EMAIL'] = 'admin@inkwell.dev';
    process.env['ADMIN_PASSWORD'] = 'Admin12345';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    // Truncate before init: the admin seed runs on init.
    await truncateAll(app);
    await app.init();

    // S1: seeded admin login
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@inkwell.dev', password: 'Admin12345' })
      .expect(200);
    adminToken = getStringField(adminLogin.body, 'accessToken');

    // S2/S3: register authors A and B
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Ali', email: 'ali@example.com', password: 'password123' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Sara',
        email: 'sara@example.com',
        password: 'password123',
      })
      .expect(201);

    // S4: login A and B
    const loginA = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ali@example.com', password: 'password123' })
      .expect(200);
    tokenA = getStringField(loginA.body, 'accessToken');
    const userA: unknown = getField(loginA.body, 'user');
    idA = getNumberField(userA, 'id');

    const loginB = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'sara@example.com', password: 'password123' })
      .expect(200);
    tokenB = getStringField(loginB.body, 'accessToken');
  });

  afterAll(async () => {
    await app.close();
  });

  it('A1 rejects an existing email with 409', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Ali', email: 'ali@example.com', password: 'password123' })
      .expect(409);
  });

  it('A2 returns 422 with field-level errors', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'x', email: 'bad', password: 'short' })
      .expect(422);
    const errors = getErrorsField(res.body);
    expect(errors['email']).toBeDefined();
    expect(errors['password']).toBeDefined();
  });

  it('A3 strips role=admin (still author)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Root',
        email: 'root@example.com',
        password: 'password123',
        role: 'admin',
      })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'root@example.com', password: 'password123' })
      .expect(200);
    const user: unknown = getField(login.body, 'user');
    expect(getStringField(user, 'role')).toBe('author');
  });

  it('A4 rejects a wrong password with 401 and a generic message', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ali@example.com', password: 'wrong-password' })
      .expect(401);
    expect(getStringField(res.body, 'message')).toBe(
      'Invalid email or password',
    );
  });

  it('A5 returns /me with a token and no passwordHash', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expectNoPasswordHash(res);
  });

  it('A6 rejects /me without a token with 401', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('B1 rejects POST without a token with 401', async () => {
    await request(app.getHttpServer())
      .post('/api/blogs')
      .send({ title: 't', content: 'content here', category: 'Technology' })
      .expect(401);
  });

  it('B2 rejects an unknown category with 422', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 't', content: 'content here', category: 'Nope' })
      .expect(422);
    expect(getErrorsField(res.body)['category']).toBeDefined();
  });

  it('B3 rejects an empty title with 422', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: '', content: 'content here', category: 'Technology' })
      .expect(422);
    expect(getErrorsField(res.body)['title']).toBeDefined();
  });

  it('B4 creates a blog as A, ignoring a fake authorId', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'First Tech Post',
        content: 'Hello world content',
        category: 'Technology',
        authorId: 999,
      })
      .expect(201);
    expectNoPasswordHash(res);
    expect(getNumberField(res.body, 'authorId')).toBe(idA);
    blogId1 = getNumberField(res.body, 'id');
    blog1CreatedAt = getStringField(res.body, 'createdAt');
  });

  it('B5 creates 3 more blogs across categories and authors', async () => {
    await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Healthy Living Tips',
        content: 'More content here',
        category: 'Lifestyle',
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        title: 'Business 101 Guide',
        content: 'Biz content here',
        category: 'Business',
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        title: 'Second Tech Deep Dive',
        content: 'Tech content here',
        category: 'Technology',
      })
      .expect(201);
  });

  it('B6 lists blogs publicly with {data, meta} and no passwordHash', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blogs')
      .expect(200);
    expectNoPasswordHash(res);
    const data: unknown = getField(res.body, 'data');
    if (!Array.isArray(data)) {
      throw new Error('Expected body.data to be an array');
    }
    expect(data).toHaveLength(4);
    const meta: unknown = getField(res.body, 'meta');
    expect(getNumberField(meta, 'total')).toBe(4);
  });

  it('B7 filters by category=Technology', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blogs?category=Technology')
      .expect(200);
    const data: unknown = getField(res.body, 'data');
    if (!Array.isArray(data)) {
      throw new Error('Expected body.data to be an array');
    }
    expect(data).toHaveLength(2);
    for (const item of data) {
      expect(getStringField(item, 'category')).toBe('Technology');
    }
  });

  it('B8 filters by author=A', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/blogs?author=${idA}`)
      .expect(200);
    const data: unknown = getField(res.body, 'data');
    if (!Array.isArray(data)) {
      throw new Error('Expected body.data to be an array');
    }
    expect(data).toHaveLength(2);
    for (const item of data) {
      expect(getNumberField(item, 'authorId')).toBe(idA);
    }
  });

  it('B9 paginates with page=1&limit=2', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blogs?page=1&limit=2')
      .expect(200);
    const data: unknown = getField(res.body, 'data');
    if (!Array.isArray(data)) {
      throw new Error('Expected body.data to be an array');
    }
    expect(data).toHaveLength(2);
    const meta: unknown = getField(res.body, 'meta');
    expect(getNumberField(meta, 'total')).toBe(4);
    expect(getNumberField(meta, 'totalPages')).toBe(2);
  });

  it('B10 returns empty data for page=999 with correct meta', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blogs?page=999')
      .expect(200);
    expect(getField(res.body, 'data')).toEqual([]);
    const meta: unknown = getField(res.body, 'meta');
    expect(getNumberField(meta, 'total')).toBe(4);
  });

  it('B11 includes blogs created today for from=today&to=today', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await request(app.getHttpServer())
      .get(`/api/blogs?from=${today}&to=${today}`)
      .expect(200);
    const meta: unknown = getField(res.body, 'meta');
    expect(getNumberField(meta, 'total')).toBe(4);
  });

  it('B12 rejects from>to with 400', async () => {
    await request(app.getHttpServer())
      .get('/api/blogs?from=2030-01-01&to=2020-01-01')
      .expect(400);
  });

  it('B13 matches by title part', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blogs?search=Deep+Dive')
      .expect(200);
    const data: unknown = getField(res.body, 'data');
    if (!Array.isArray(data)) {
      throw new Error('Expected body.data to be an array');
    }
    expect(data).toHaveLength(1);
    expect(getStringField(data[0], 'title')).toBe('Second Tech Deep Dive');
  });

  it('B14 matches by author name', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blogs?search=Sara')
      .expect(200);
    const data: unknown = getField(res.body, 'data');
    if (!Array.isArray(data)) {
      throw new Error('Expected body.data to be an array');
    }
    expect(data).toHaveLength(2);
    for (const item of data) {
      const author: unknown = getField(item, 'author');
      expect(getStringField(author, 'name')).toBe('Sara');
    }
  });

  it('B15 matches category case-insensitively', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blogs?search=technology')
      .expect(200);
    const data: unknown = getField(res.body, 'data');
    if (!Array.isArray(data)) {
      throw new Error('Expected body.data to be an array');
    }
    expect(data).toHaveLength(2);
  });

  it('B16 rejects page=abc with 422', async () => {
    await request(app.getHttpServer()).get('/api/blogs?page=abc').expect(422);
  });

  it('B17 rejects limit=1000 with 422', async () => {
    await request(app.getHttpServer()).get('/api/blogs?limit=1000').expect(422);
  });

  it('B18 returns one blog with author {id, name} only', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/blogs/${blogId1}`)
      .expect(200);
    expectNoPasswordHash(res);
    const author: unknown = getField(res.body, 'author');
    if (!isRecord(author)) {
      throw new Error('Expected body.author to be an object');
    }
    expect(Object.keys(author).sort()).toEqual(['id', 'name']);
  });

  it('B19 returns 404 for an unknown id', async () => {
    await request(app.getHttpServer()).get('/api/blogs/999').expect(404);
  });

  it('B20 returns 400 for a non-numeric id', async () => {
    await request(app.getHttpServer()).get('/api/blogs/abc').expect(400);
  });

  it('B21 updates as owner with changed updatedAt', async () => {
    await delay(20);
    const res = await request(app.getHttpServer())
      .put(`/api/blogs/${blogId1}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'First Tech Post Updated' })
      .expect(200);
    expect(getStringField(res.body, 'createdAt')).toBe(blog1CreatedAt);
    const updatedAt = getStringField(res.body, 'updatedAt');
    expect(new Date(updatedAt).getTime()).toBeGreaterThan(
      new Date(blog1CreatedAt).getTime(),
    );
  });

  it('B22 rejects update by another author with 403', async () => {
    await request(app.getHttpServer())
      .put(`/api/blogs/${blogId1}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hacked' })
      .expect(403);
  });

  it('B23 allows update by ADMIN', async () => {
    await request(app.getHttpServer())
      .put(`/api/blogs/${blogId1}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Admin Edited Title' })
      .expect(200);
  });

  it('B24 ignores authorId in the update body', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/blogs/${blogId1}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Keep Mine', authorId: 99 })
      .expect(200);
    expect(getNumberField(res.body, 'authorId')).toBe(idA);
  });

  it('B25 returns 404 when updating an unknown id', async () => {
    await request(app.getHttpServer())
      .put('/api/blogs/999')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'x' })
      .expect(404);
  });

  it('B26 rejects delete by another author with 403', async () => {
    await request(app.getHttpServer())
      .delete(`/api/blogs/${blogId1}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(403);
  });

  it('B27 deletes as owner with 204 and an empty body', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/blogs/${blogId1}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(204);
    expect(res.body).toEqual({});
  });

  it('B28 returns 404 for the deleted blog', async () => {
    await request(app.getHttpServer()).get(`/api/blogs/${blogId1}`).expect(404);
  });

  it('B29 deletes another blog as ADMIN with 204', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/blogs')
      .expect(200);
    const data: unknown = getField(list.body, 'data');
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Expected at least one remaining blog');
    }
    const otherId = getNumberField(data[0], 'id');
    await request(app.getHttpServer())
      .delete(`/api/blogs/${otherId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('B30 rejects DELETE without a token with 401', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/blogs')
      .expect(200);
    const data: unknown = getField(list.body, 'data');
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Expected at least one remaining blog');
    }
    const remainingId = getNumberField(data[0], 'id');
    await request(app.getHttpServer())
      .delete(`/api/blogs/${remainingId}`)
      .expect(401);
  });
});
