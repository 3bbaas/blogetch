# Blogetch — Backend Documentation

> **Note:** This document was generated with AI assistance and reviewed for
> accuracy. For the machine-readable contract, always prefer the live OpenAPI
> document at `/api/docs` (Swagger UI) / `/api/docs-json`.

The backend is a **NestJS 11** REST API backed by **PostgreSQL** through
**Prisma 7**, living in the `api/` workspace package.

- Base URL (local): `http://localhost:3000/api`
- OpenAPI UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## Tech stack

| Layer | Choice |
|---|---|
| API | NestJS 11, Passport JWT, class-validator |
| Web | Next.js (App Router), React 19, Tailwind CSS |
| Data | PostgreSQL 16, Prisma 7 (driver adapter) |
| Tooling | TypeScript, pnpm workspaces, Docker Compose, Vitest / Jest, ESLint + Prettier |

## Repository layout

```
blogetch/
├── api/                  # NestJS REST API (routes under /api)
│   ├── prisma/           # schema, migrations, seed
│   └── src/              # modules: auth, blogs, comments, users, prisma
├── web/                  # Next.js frontend
│   └── src/              # app router pages, components, lib
├── docs/                 # backend reference + banner prompt
├── docker-compose.yml    # db, db-test, api, web, pgweb
└── .env.example          # compose-level variables
```

## Requirements

- Node.js **24** (see `.nvmrc`) and pnpm **10** (see `packageManager`)
- Docker + Docker Compose v2 for PostgreSQL

Host ports used: API `3000`, web `3001`, dev DB `5435`, test DB `5434`,
pgweb `8081`.

## Quickstart (Docker)

```bash
cp .env.example .env          # then set JWT_SECRET / ADMIN_PASSWORD
docker compose up --build -d  # API runs `prisma migrate deploy` on start
curl localhost:3000/api/health
open http://localhost:3001    # web
open http://localhost:3000/api/docs   # Swagger UI
docker compose down -v        # full reset (removes volumes)
```

## Local development

```bash
pnpm install
docker compose up -d db db-test
pnpm --filter blogetch-api prisma:deploy
pnpm --filter blogetch-api prisma:seed   # admin + sample stories (idempotent)
pnpm dev                                  # api :3000 + web :3001
```

Prisma GUI: <http://localhost:8081> (pgweb, dev database preconnected).

## Module map

| Module | Responsibility |
|---|---|
| `AppModule` | Wires config, Prisma and the feature modules |
| `PrismaModule` | Single `PrismaService` (PostgreSQL driver adapter) |
| `UsersModule` | User persistence (create / find by email or id) |
| `AuthModule` | Registration, login, JWT strategy/guards |
| `BlogsModule` | Story CRUD + paginated listing |
| `CommentsModule` | Comments attached to a story |
| `config/` | Env validation and Swagger setup |

## Cross-cutting behaviour

- **Global prefix:** every route is served under `/api` (`configure-app.ts`).
- **Validation:** a global `ValidationPipe` runs with `whitelist` + `transform`.
  Unknown fields are stripped; validation failures return **422**.
- **Auth:** resources that are not marked `@Public()` require a
  `Authorization: Bearer <jwt>` header. The `/api/blogs` write routes and
  comments POST additionally enforce ownership/roles in the service layer.
- **CORS:** allowed origins come from `CORS_ORIGINS` (comma-separated).

### Error responses

Standard NestJS errors:

```json
{ "statusCode": 404, "message": "Blog 42 not found", "error": "Not Found" }
```

Validation failures (all DTOs) use a dedicated **422** shape:

```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": { "title": ["title should not be empty"] }
}
```

`errors` is a flat map of `field -> messages`, including nested paths
(e.g. `author.name`).

## Authentication

1. `POST /api/auth/login` with `{ email, password }` returns
   `{ accessToken, user }`.
2. Send `Authorization: Bearer <accessToken>` on protected endpoints.
3. `GET /api/auth/me` returns the current user; `GET /api/health` is public.

Tokens are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN`
(default `1d`). Registration always assigns the `author` role — a `role`
field in the body is ignored.

## Endpoints

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api` | public | Service banner (plain text) |
| `GET` | `/api/health` | public | Liveness probe → `{ "status": "ok" }` |

### Auth

| Method | Path | Auth | Body | Success | Errors |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | public | `RegisterDto` | `201` (empty) | `409`, `422` |
| `POST` | `/api/auth/login` | public | `LoginDto` | `200` `LoginResponse` | `401`, `422` |
| `GET` | `/api/auth/me` | bearer | – | `200` `AuthUserResponse` | `401` |

`RegisterDto`: `name` (≥2), `email`, `password` (≥8).
`LoginDto`: `email`, `password`.

### Blogs

Base path `/api/blogs`.

| Method | Path | Auth | Success | Errors |
|---|---|---|---|---|
| `POST` | `/api/blogs` | bearer | `201` `BlogResponse` | `401`, `422` |
| `GET` | `/api/blogs` | public | `200` `PaginatedBlogs` | `400` |
| `GET` | `/api/blogs/:id` | public | `200` `BlogResponse` | `404` |
| `PUT` | `/api/blogs/:id` | bearer (owner/admin) | `200` `BlogResponse` | `401`, `403`, `404`, `422` |
| `DELETE` | `/api/blogs/:id` | bearer (owner/admin) | `204` | `401`, `403`, `404` |

`CreateBlogDto`: `title`, `content` (markdown), `category` (enum).
`UpdateBlogDto` is a `PartialType` of the create DTO — **PUT is a partial
update**; `authorId` is always taken from the token.

**Query parameters** for `GET /api/blogs` (`QueryBlogsDto`):

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int ≥1 | `1` | |
| `limit` | int 1–50 | `10` | |
| `category` | enum | – | one of the `BlogCategory` values |
| `author` | int | – | author (user) id |
| `from` | ISO date | – | inclusive lower bound on `createdAt` |
| `to` | ISO date | – | inclusive upper bound, whole UTC day |
| `search` | string | – | matches title, category or author name |

`BlogResponse` embeds `author: { id, name } | null`.

### Comments

Base path `/api/blogs/:blogId/comments`.

| Method | Path | Auth | Success | Errors |
|---|---|---|---|---|
| `POST` | `/api/blogs/:blogId/comments` | bearer | `201` `CommentResponse` | `401`, `404`, `422` |
| `GET` | `/api/blogs/:blogId/comments` | public | `200` `CommentResponse[]` | `404` |

`CreateCommentDto`: `content` (plain text, ≤2000 chars).

## Data model (Prisma)

| Model | Key fields |
|---|---|
| `User` | `id`, `email` (unique), `name`, `passwordHash`, `role` (`admin`/`author`), `createdAt` |
| `Blog` | `id`, `title`, `content`, `category`, `authorId` → `User`, timestamps |
| `Comment` | `id`, `content`, `blogId` → `Blog`, `userId` → `User`, `createdAt` |

Schema: `api/prisma/schema.prisma`. Migrations: `api/prisma/migrations/`.
Seed: `api/prisma/seed.ts` (idempotent; admin + 8 sample stories + comments).

```bash
pnpm --filter blogetch-api prisma:generate
pnpm --filter blogetch-api prisma:migrate     # dev
pnpm --filter blogetch-api prisma:deploy      # apply committed migrations
pnpm --filter blogetch-api prisma:seed
pnpm --filter blogetch-api prisma:studio
```

## Environment variables

Compose-level variables live in the root `.env` (see `.env.example`); app-level
examples are in `api/.env.example` and `web/.env.example`.

| Variable | Default | Description |
|---|---|---|
| `PORT` / `WEB_PORT` | `3000` / `3001` | Host ports for api / web |
| `JWT_SECRET` | – (required) | JWT signing secret; the API fails fast without it |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | – | Seeded admin (seed skipped if unset) |
| `DATABASE_URL` / `TEST_DATABASE_URL` | – | Dev / isolated test connection strings |
| `CORS_ORIGINS` | `http://localhost:3001` | Comma-separated allowed origins for the API |
| `NEXT_PUBLIC_SITE_URL` | – | Public web origin used for metadata/OG |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `blogetch` | Compose database credentials |
| `POSTGRES_TEST_DB` | `blogetch_test` | Compose test database name |

## Scripts

Root workspace scripts (`package.json`):

```bash
pnpm dev            # api + web in parallel
pnpm build          # build both packages
pnpm lint           # lint both packages
pnpm typecheck      # tsc --noEmit for both
pnpm test           # api unit tests
pnpm test:e2e       # api e2e (needs db-test container)
pnpm docker:up      # docker compose up -d --build
pnpm docker:down    # docker compose down
```

## Tests & tooling

```bash
pnpm --filter blogetch-api test          # unit tests (src/**/*.spec.ts)
pnpm --filter blogetch-api test:e2e      # e2e (needs the db-test container)
pnpm --filter blogetch-web test          # web unit tests (Vitest)
pnpm --filter blogetch-api lint
pnpm --filter blogetch-api build
```

E2E tests run serially against the isolated test database
(`TEST_DATABASE_URL`), truncating and reseeding the admin between suites.
