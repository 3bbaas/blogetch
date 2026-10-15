# Blogetch — NestJS Blog API

Blog platform API built with NestJS + TypeScript, PostgreSQL, and Prisma.
Global route prefix: `/api`.

> **Route note:** the blog resource lives at **`/api/blogs`** (plural `blogs`,
> not `posts`). Comments nest under blogs: `/api/blogs/:blogId/comments`.
>
> **PUT semantics:** `PUT /api/blogs/:id` is a **partial update** — only the
> fields present in the body change (`title`/`content`/`category` via `??`
> fallback / Prisma `undefined`-skips); `authorId` in the body is always
> ignored (taken from the JWT instead).

## Requirements

- Node.js 24 + pnpm 10
- Docker + Docker Compose v2 (for PostgreSQL; host ports `5435` for dev DB
  and `5434` for the test DB — `5432`/`5433` are used by other projects on
  this machine)

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | no | `3000` | API listen port |
| `JWT_SECRET` | **yes** | – | JWT signing secret (app fails fast without it) |
| `JWT_EXPIRES_IN` | no | `1d` | Token lifetime (`ms` format, e.g. `15m`, `7d`) |
| `ADMIN_EMAIL` | no | – | Seeded admin email (`admin@blogetch.dev`); seed skipped if unset |
| `ADMIN_PASSWORD` | no | – | Seeded admin password (`Admin12345`); seed skipped if unset |
| `POSTGRES_USER` | no | `blogetch` | Postgres user (Compose) |
| `POSTGRES_PASSWORD` | no | `blogetch` | Postgres password (Compose) |
| `POSTGRES_DB` | no | `blogetch` | Dev database name (Compose) |
| `POSTGRES_TEST_DB` | no | `blogetch_test` | Test database name (Compose) |
| `DATABASE_URL` | **yes** | – | Prisma connection string (dev DB) |
| `TEST_DATABASE_URL` | **yes (e2e)** | – | Prisma connection string (isolated test DB) |

Copy `.env.example` to `.env` and fill in secrets. `.env` is gitignored and
never committed. `DATABASE_URL` inside the Compose `api` service points at host
`db`, not `localhost`.

## Local setup

```bash
docker compose up -d db        # start PostgreSQL (dev DB)
pnpm install
pnpm prisma:deploy             # apply migrations (or prisma:migrate in dev)
pnpm prisma:seed               # admin + sample authors/blogs/comments (idempotent)
pnpm run start:dev             # API at http://localhost:3000, routes under /api
```

Useful Prisma scripts: `prisma:generate`, `prisma:migrate`, `prisma:deploy`,
`prisma:seed`, `prisma:studio`.

## Running everything with Docker Compose

```bash
docker compose up --build -d  # db + db-test + api (api runs migrate deploy first)
curl http://localhost:3000/api/blogs
docker compose down -v        # full reset (volumes removed)
```

### Postgres GUI (pgweb)

`docker compose up -d pgweb`, then open http://localhost:8081. It connects to
the dev database automatically (`db` service, credentials from `POSTGRES_*`).
To inspect the test database instead, point pgweb at host `db-test`, port
`5432`, database from `POSTGRES_TEST_DB`.

Data persists across `api` restarts via the `blogetch-data` named volume
(unlike the old in-memory version).

## Running tests

```bash
npm test          # unit tests (src)
npm run test:e2e  # e2e (app + auth + blogs + comments) against the isolated
                  # test DB via TEST_DATABASE_URL; suites truncate tables and
                  # re-seed the admin, and run serially (--runInBand)
npm run build && npx tsc --noEmit && npm run lint
```

## Auth quick reference

- `POST /api/auth/register` → 201 (role is always `author`; `role` in body is stripped)
- `POST /api/auth/login` → 200 `{ accessToken, user }`
- `GET /api/auth/me` → 200 with `Bearer` token, 401 without
- Blogs: POST/PUT/DELETE require auth; both GETs are public. Only the owner or
  an `admin` may edit/delete a blog (403 otherwise). Validation failures return
  **422** with a field-level `errors` object.
