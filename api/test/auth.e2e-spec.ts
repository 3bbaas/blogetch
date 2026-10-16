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

function getStringField(body: unknown, field: string): string {
  if (!isRecord(body)) {
    throw new Error(`Expected response body to be an object`);
  }
  const value: unknown = body[field];
  if (typeof value !== 'string') {
    throw new Error(`Expected body.${field} to be a string`);
  }
  return value;
}

function getUserRole(body: unknown): string {
  if (!isRecord(body)) {
    throw new Error('Expected response body to be an object');
  }
  const user: unknown = body['user'];
  if (!isRecord(user)) {
    throw new Error('Expected body.user to be an object');
  }
  const role: unknown = user['role'];
  if (typeof role !== 'string') {
    throw new Error('Expected body.user.role to be a string');
  }
  return role;
}

function expectNoPasswordHash(res: ResponseWithBody): void {
  expect(JSON.stringify(res.body)).not.toContain('passwordHash');
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env['JWT_SECRET'] ??= 'test-secret-that-is-long-enough';
    delete process.env['ADMIN_EMAIL'];
    delete process.env['ADMIN_PASSWORD'];
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    // Truncate before init: the admin seed (when enabled) runs on init.
    await truncateAll(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a user with 201 and no passwordHash', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Ada', email: 'Ada@Example.com', password: 'password123' })
      .expect(201);
    expectNoPasswordHash(res);
  });

  it('rejects a duplicate email with 409', async () => {
    const dto = {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password123',
    };
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(dto)
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(dto)
      .expect(409);
  });

  it('returns 422 with field-level errors for an invalid body', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: '', email: 'not-an-email', password: 'short' })
      .expect(422);
    expectNoPasswordHash(res);
    if (!isRecord(res.body)) {
      throw new Error('Expected 422 body to be an object');
    }
    expect(res.body['statusCode']).toBe(422);
    expect(res.body['message']).toBe('Validation failed');
    const errors: unknown = res.body['errors'];
    if (!isRecord(errors)) {
      throw new Error('Expected 422 body.errors to be an object');
    }
    expect(errors['email']).toBeDefined();
    expect(errors['password']).toBeDefined();
  });

  it('logs in with a token and rejects a wrong password with 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Ada', email: 'ada@example.com', password: 'password123' })
      .expect(201);
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'password123' })
      .expect(200);
    expectNoPasswordHash(loginRes);
    const token = getStringField(loginRes.body, 'accessToken');
    expect(token.length).toBeGreaterThan(0);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('returns /me with a token and 401 without one', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Ada', email: 'ada@example.com', password: 'password123' })
      .expect(201);
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'password123' })
      .expect(200);
    const token = getStringField(loginRes.body, 'accessToken');

    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expectNoPasswordHash(meRes);

    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('strips role=admin from the register body (still author)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Mallory',
        email: 'mallory@example.com',
        password: 'password123',
        role: 'admin',
      })
      .expect(201);
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'mallory@example.com', password: 'password123' })
      .expect(200);
    expect(getUserRole(loginRes.body)).toBe('author');
  });
});
