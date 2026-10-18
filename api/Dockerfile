# Build context is ./api (see docker-compose.yml). The pnpm workspace
# manifests live at the repo root, exposed as the `workspace` build context
# (additional_contexts), so the single root lockfile stays authoritative.
# ---------- build stage ----------
FROM node:24-slim AS build
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
# OpenSSL must exist before `pnpm install` so the @prisma/engines postinstall
# fetches the engine binary matching this libc/openssl (otherwise Prisma
# tries to download it at runtime, as a non-root user, and fails).
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists
COPY --from=workspace package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY --from=workspace api/package.json /app/api/
COPY --from=workspace web/package.json /app/web/
WORKDIR /app/api
# Constrained networks: fewer parallel downloads, longer timeouts, more retries.
RUN pnpm config set network-concurrency 4 && \
    pnpm config set fetch-timeout 180000 && \
    pnpm config set fetch-retries 5 && \
    pnpm install --frozen-lockfile

COPY prisma ./prisma
COPY prisma7.config.ts ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN pnpm prisma generate && pnpm run build

# ---------- runtime stage ----------
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/api

# Prisma's engine needs OpenSSL at runtime (it warns and misdetects
# otherwise, failing connections with P1001). node:24-slim has none.
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists
RUN groupadd -r app && useradd -r -g app app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/api/node_modules ./node_modules
COPY --from=build /app/api/package.json ./
COPY --from=build /app/api/dist ./dist
COPY --from=build /app/api/prisma ./prisma
COPY --from=build /app/api/prisma7.config.ts ./
USER app
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
