import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

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

describe('Comments (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken = '';
  let tokenA = '';
  let idA = 0;
  let blogId = 0;

  beforeAll(async () => {
    process.env['JWT_SECRET'] ??= 'test-secret-that-is-long-enough';
    process.env['ADMIN_EMAIL'] ??= 'admin@inkwell.dev';
    process.env['ADMIN_PASSWORD'] ??= 'Admin12345';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@inkwell.dev', password: 'Admin12345' })
      .expect(200);
    adminToken = getStringField(adminLogin.body, 'accessToken');

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

    const loginA = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ali@example.com', password: 'password123' })
      .expect(200);
    tokenA = getStringField(loginA.body, 'accessToken');
    const userA: unknown = getField(loginA.body, 'user');
    idA = getNumberField(userA, 'id');

    const blog = await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Commentable Post',
        content: 'Content for comments here',
        category: 'Technology',
      })
      .expect(201);
    blogId = getNumberField(blog.body, 'id');
  });

  afterAll(async () => {
    await app.close();
  });

  it('C1 rejects POST without a token with 401', async () => {
    await request(app.getHttpServer())
      .post(`/api/blogs/${blogId}/comments`)
      .send({ content: 'Nice post!' })
      .expect(401);
  });

  it('C2 returns 404 when posting on an unknown blog', async () => {
    await request(app.getHttpServer())
      .post('/api/blogs/999/comments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Nice post!' })
      .expect(404);
  });

  it('C3 rejects empty content with 422', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/blogs/${blogId}/comments`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: '' })
      .expect(422);
    expect(getErrorsField(res.body)['content']).toBeDefined();
  });

  it('C4 ignores userId in the body and uses the JWT user', async () => {
    const loginB = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'sara@example.com', password: 'password123' })
      .expect(200);
    const tokenB = getStringField(loginB.body, 'accessToken');
    const userB: unknown = getField(loginB.body, 'user');
    const idB = getNumberField(userB, 'id');

    const res = await request(app.getHttpServer())
      .post(`/api/blogs/${blogId}/comments`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ content: 'Great read, thanks!', userId: 99 })
      .expect(201);
    expectNoPasswordHash(res);
    expect(getNumberField(res.body, 'userId')).toBe(idB);
  });

  it('C5 creates a comment as any logged-in user with author {id, name}', async () => {
    await delay(10);
    const res = await request(app.getHttpServer())
      .post(`/api/blogs/${blogId}/comments`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Glad you liked it!' })
      .expect(201);
    expectNoPasswordHash(res);
    const author: unknown = getField(res.body, 'author');
    if (!isRecord(author)) {
      throw new Error('Expected body.author to be an object');
    }
    expect(Object.keys(author).sort()).toEqual(['id', 'name']);
    expect(getNumberField(author, 'id')).toBe(idA);
  });

  it('C6 lists comments publicly, oldest first, with no passwordHash', async () => {
    await delay(10);
    await request(app.getHttpServer())
      .post(`/api/blogs/${blogId}/comments`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'One more thought here' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/api/blogs/${blogId}/comments`)
      .expect(200);
    expectNoPasswordHash(res);
    const data: unknown = res.body;
    if (!Array.isArray(data)) {
      throw new Error('Expected response body to be an array');
    }
    expect(data).toHaveLength(3);
    const contents = data.map((item) => getStringField(item, 'content'));
    expect(contents).toEqual([
      'Great read, thanks!',
      'Glad you liked it!',
      'One more thought here',
    ]);
  });

  it('C7 returns 404 for comments of an unknown blog', async () => {
    await request(app.getHttpServer())
      .get('/api/blogs/999/comments')
      .expect(404);
  });

  it('C8 returns 400 for a non-numeric blog id', async () => {
    await request(app.getHttpServer())
      .get('/api/blogs/abc/comments')
      .expect(400);
  });

  it('C9 returns 404 for comments after the blog is deleted', async () => {
    await request(app.getHttpServer())
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
    await request(app.getHttpServer())
      .get(`/api/blogs/${blogId}/comments`)
      .expect(404);
  });
});
