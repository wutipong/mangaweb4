# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile --copy

# Copy source code
COPY . .

RUN bunx svelte-kit sync

# Build the application
RUN bun run build

# Remove static copies of PWA source assets; PWA assets live in build/client/pwa
RUN rm -f build/client/favicon.svg build/client/favicon.svg.br build/client/favicon.svg.gz build/client/favicon.afdesign

# Production stage
FROM oven/bun:alpine

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["bun", "run", "build/index.js"]