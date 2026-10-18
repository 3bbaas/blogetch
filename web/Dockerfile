FROM node:24-slim AS build
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
COPY --from=workspace package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY --from=workspace api/package.json /app/api/
COPY --from=workspace web/package.json /app/web/
WORKDIR /app/web
RUN pnpm config set network-concurrency 4 && \
    pnpm config set fetch-timeout 180000 && \
    pnpm config set fetch-retries 5 && \
    pnpm install --frozen-lockfile

COPY . .
ARG API_URL=http://api:3000/api
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3001
ENV API_URL=$API_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm build

FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/web
RUN groupadd -r app && useradd -r -g app app
COPY --from=build --chown=app:app /app/node_modules /app/node_modules
COPY --from=build --chown=app:app /app/web/node_modules ./node_modules
COPY --from=build --chown=app:app /app/web/package.json ./

COPY --from=build --chown=app:app /app/web/.next/standalone/web ./
COPY --from=build --chown=app:app /app/web/.next/static ./.next/static
COPY --from=build --chown=app:app /app/web/public ./public
USER app
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
