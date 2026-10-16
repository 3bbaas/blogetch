# Blogetch — "Sketch your thoughts. Print them proud."

A nostalgic, old-school printed-gazette blog platform: NestJS API + Next.js frontend,
PostgreSQL + Prisma, one pnpm workspace, Docker Compose for everything.

```
blogetch/
├── api/                  # NestJS REST API (routes under /api)
├── web/                  # Next.js frontend
├── docker-compose.yml    # db, db-test, api, web, pgweb
├── .github/workflows/    # CI (Phase G)
├── .env / .env.example   # compose-level variables
├── api/.env.example      # API variables
└── web/.env.example      # web variables
```

> **Route note:** the blog resource lives at **`/api/blogs`** (plural `blogs`,
> not `posts`).
>
> **PUT semantics:** `PUT /api/blogs/:id` is a **partial update** — only the
> fields present in the body change; `authorId` in the body is always ignored
> (taken from the JWT instead).

## Requirements

- Node.js 24 (`cat .nvmrc`), pnpm 10 (`packageManager` field)
- Docker + Docker Compose v2 for PostgreSQL
  (host ports: `5435` dev DB, `5434` test DB — `5432`/`5433` belong to other
  projects on this machine; API `3000`, web `3001`, pgweb `8081`)

## Environment variables

Root `.env` (used by Compose; see `.env.example`). App-level examples in
`api/.env.example` and `web/.env.example`.

| Variable | Default | Description |
|---|---|---|
| `PORT` / `WEB_PORT` | `3000` / `3001` | Host ports for api / web |
| `JWT_SECRET` | – (required) | JWT signing secret; app fails fast without it |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@blogetch.dev` / `Admin12345` | Seeded admin (seed skipped if unset) |
| `CORS_ORIGINS` | `http://localhost:3001` | Comma-separated allowed origins for the API |
| `POSTGRES_USER/PASSWORD/DB` | `blogetch` | Dev database credentials (Compose) |
| `POSTGRES_TEST_DB` | `blogetch_test` | Test database name (Compose) |
| `DATABASE_URL` / `TEST_DATABASE_URL` | – | Dev / isolated test connection strings |
| `API_URL` / `NEXT_PUBLIC_SITE_URL` / `COOKIE_SECURE` | – | Web runtime config (see `web/.env.example`) |

## Local dev

```bash
pnpm install
docker compose up -d db db-test
pnpm --filter blogetch-api prisma:deploy
pnpm --filter blogetch-api prisma:seed   # admin + samples (idempotent)
pnpm dev                                  # api :3000 + web :3001
```

Prisma scripts (api): `prisma:generate`, `prisma:migrate`, `prisma:deploy`,
`prisma:seed`, `prisma:studio`.

## Full-stack Docker run

```bash
docker compose up --build -d   # api runs `prisma migrate deploy` at startup
curl localhost:3000/api/health
curl localhost:3001/
docker compose down -v         # full reset (volumes removed)
```

Postgres GUI: http://localhost:8081 (pgweb, dev DB preconnected).

## Tests

```bash
pnpm test        # api unit tests
pnpm test:e2e    # api e2e (isolated test DB, truncates + reseeds admin, serial)
pnpm lint && pnpm typecheck && pnpm build
```

## Auth quick reference

- `POST /api/auth/register` → 201 (role always `author`; `role` in body stripped)
- `POST /api/auth/login` → 200 `{ accessToken, user }`
- `GET /api/auth/me` → 200 with `Bearer` token, 401 without; `GET /api/health` → 200 public
- Blogs: POST/PUT/DELETE need auth; both GETs public. Owner or `admin` may edit/delete
  (403 otherwise). Validation failures → **422** with field-level `errors`.
