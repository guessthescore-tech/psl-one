FROM node:22-alpine AS base
RUN npm install -g pnpm@9

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY services/identity/package.json ./services/identity/
RUN pnpm install --frozen-lockfile --filter @psl-one/identity...

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY services/identity/ ./services/identity/
COPY tsconfig.base.json ./
RUN pnpm --filter @psl-one/identity... run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/services/identity/dist ./dist
COPY --from=builder /app/services/identity/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
