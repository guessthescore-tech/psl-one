# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=9.0.0

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache python3 make g++ openssl-dev
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma/schema.prisma ./apps/api/prisma/schema.prisma
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @psl-one/api...

FROM deps AS builder
COPY apps/api ./apps/api
RUN pnpm --filter @psl-one/api db:generate
RUN pnpm --filter @psl-one/api build

FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app
RUN apk add --no-cache curl tini openssl && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/apps/api/prisma/schema.prisma ./apps/api/prisma/schema.prisma
COPY --from=builder --chown=node:node /app/apps/api/prisma/migrations ./apps/api/prisma/migrations
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/health/ready" >/dev/null || exit 1
ENTRYPOINT ["tini", "--"]
CMD ["node", "apps/api/dist/main.js"]

FROM runner AS migrator
ENV NODE_ENV=production
WORKDIR /app
CMD ["apps/api/node_modules/.bin/prisma", "migrate", "deploy", "--schema", "apps/api/prisma/schema.prisma"]
