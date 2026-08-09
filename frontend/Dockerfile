FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN bun install
RUN NODE_ENV=development bun run build

EXPOSE 3000
CMD ["bun", "./build"]