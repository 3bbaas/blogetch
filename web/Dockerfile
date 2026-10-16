# Build context is ./web (see docker-compose.yml). The pnpm workspace
# manifests live at the repo root, exposed as the `workspace` build context
# (additional_contexts), so the single root lockfile stays authoritative.
# ---------- build stage ----------
FROM node:24-slim AS build
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
COPY --from=workspace package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY --from=workspace api/package.json /app/api/
COPY --from=workspace web/package.json /app/web/
WORKDIR /app/web
# Constrained networks: fewer parallel downloads, longer timeouts, more retries.
RUN pnpm config set network-concurrency 4 && \
    pnpm config set fetch-timeout 180000 && \
    pnpm config set fetch-retries 5 && \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---------- runtime stage ----------
# NOTE: the workspace subdirectory structure (/app/<pkg>) is preserved on
# purpose (same as the api image): pnpm's relative symlinks
# (../../node_modules/.pnpm/...) only resolve when each package dir exists
# at its original depth. Flattening everything to /app breaks every link.
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/web
RUN groupadd -r app && useradd -r -g app app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/web/node_modules ./node_modules
COPY --from=build /app/web/package.json ./
# NOTE: in a pnpm workspace Next nests the standalone output under the
# workspace-relative app path (.next/standalone/web/).
COPY --from=build /app/web/.next/standalone/web ./
COPY --from=build /app/web/.next/static ./.next/static
COPY --from=build /app/web/public ./public
USER app
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
