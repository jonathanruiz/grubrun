# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-slim AS build

# pnpm via corepack (bundled with Node). Version comes from package.json's
# "packageManager" field, so it stays in sync with local dev.
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Install dependencies first for layer caching. The cache mount keeps the pnpm
# store warm across builds so packages aren't re-downloaded every time.
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Build the static assets into /app/dist.
COPY . .
RUN pnpm build

# ---- Run stage ----
FROM nginx:alpine AS run

# SPA routing config (falls back to index.html for client-side routes).
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
