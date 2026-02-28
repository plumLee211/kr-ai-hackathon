FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm directly (lockfileVersion 9.0 → pnpm v9+)
RUN npm install -g pnpm@latest

# Copy workspace config and package manifests only (cache layer)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY story-builder/package.json ./story-builder/
COPY nano-banana-cli/package.json ./nano-banana-cli/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build story-builder
RUN pnpm --filter story-builder build

# Runtime
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

EXPOSE 8080

CMD ["pnpm", "--filter", "story-builder", "start"]
