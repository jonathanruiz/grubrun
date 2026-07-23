# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM golang:1.25 AS build

WORKDIR /src

# Download dependencies first to leverage layer caching. The cache mount keeps
# the module cache warm across builds so deps aren't re-downloaded every time.
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy the source and build a statically linked binary. Both cache mounts (module
# cache + compiler build cache) persist between builds for fast incremental rebuilds.
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -o /out/grubrun .

# ---- Run stage ----
# Minimal base with a shell for debugging (docker exec ... sh).
FROM alpine:3.20 AS run

WORKDIR /app

# Run as a non-root user.
RUN adduser -D -H appuser
USER appuser

COPY --from=build /out/grubrun /app/grubrun

EXPOSE 8000

ENTRYPOINT ["/app/grubrun"]
