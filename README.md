<p align="center">
  <img src="docs/assets/banner.jpg" alt="Blogetch — Sketch your thoughts. Print them proud." width="100%" />
</p>

<h1 align="center">Blogetch</h1>

<p align="center"><em>Sketch your thoughts. Print them proud.</em></p>

<p align="center">
  <img alt="Node" src="https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white" />
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-compose-2496ed?logo=docker&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
</p>

A nostalgic, old-school **gazette** for slow stories: a NestJS REST API and a
Next.js frontend in a single pnpm workspace, backed by PostgreSQL + Prisma.

## Features

- Email/password auth with JWT (`author` + `admin` roles, ownership checks)
- Story CRUD with pagination, search and category/date/author filters
- Markdown rendering with GitHub-flavoured markdown
- Comments ("letters") on every story
- Field-level **422** validation errors, server-rendered Next.js App Router UI
- Auto-generated **Swagger / OpenAPI** docs at `/api/docs`
- Full-stack Docker Compose: database, API, web and pgweb

## Stack

- **Backend:** NestJS 11 · PostgreSQL 16 · Prisma 7 · Passport JWT
- **Frontend:** Next.js 16 (App Router) · React 19 · Tailwind CSS

## Screenshots

<p align="center">
  <img src="docs/assets/blogetch-front-preview.png" alt="Blogetch front page" width="100%" />
</p>

[//]: # ()
[//]: # (<p align="center">)

[//]: # (  <img src="docs/assets/blogetch-swagger.png" alt="Blogetch Swagger / OpenAPI docs" width="70%" />)

[//]: # (</p>)

## Documentation

- [Backend & setup guide](docs/backend.md) — stack, quickstart, environment, API and tests
- [Live API reference](http://localhost:3000/api/docs) — Swagger UI (when running)

## License

[MIT](LICENSE).
