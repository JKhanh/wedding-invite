FROM node:18-alpine AS base

# Enable pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY package*.json ./
COPY pnpm-lock.yaml ./

EXPOSE 3000

CMD ["pnpm", "start"]