# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=9.0.0
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ARG NEXT_PUBLIC_ENVIRONMENT_LABEL=container-build
ARG NEXT_PUBLIC_GIT_SHA=local
ARG NEXT_PUBLIC_BUILD_TIMESTAMP=local
ARG NEXT_PUBLIC_DESIGN_LAB_ENABLED=false

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @psl-one/web...

FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_ENVIRONMENT_LABEL
ARG NEXT_PUBLIC_GIT_SHA
ARG NEXT_PUBLIC_BUILD_TIMESTAMP
ARG NEXT_PUBLIC_DESIGN_LAB_ENABLED
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ENVIRONMENT_LABEL=$NEXT_PUBLIC_ENVIRONMENT_LABEL
ENV NEXT_PUBLIC_GIT_SHA=$NEXT_PUBLIC_GIT_SHA
ENV NEXT_PUBLIC_BUILD_TIMESTAMP=$NEXT_PUBLIC_BUILD_TIMESTAMP
ENV NEXT_PUBLIC_DESIGN_LAB_ENABLED=$NEXT_PUBLIC_DESIGN_LAB_ENABLED
COPY apps/web ./apps/web
RUN pnpm --filter @psl-one/web build

FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
WORKDIR /app
RUN apk add --no-cache curl tini && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null || exit 1
ENTRYPOINT ["tini", "--"]
CMD ["node", "apps/web/server.js"]
