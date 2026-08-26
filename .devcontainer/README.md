# Dev Container

A ready-to-use development environment for the MangaWeb4 backend (Go 1.27) with a
PostgreSQL 17 service.

## What's included

| Component       | Details                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| **app** service | Go 1.27 toolchain, `protoc` + Go/gRPC plugins, `ent`, `psql` client       |
| **db** service  | PostgreSQL 17 (alpine), database `manga`, user/pass `postgres`/`password` |
| VS Code exts    | Go, Docker, SQLTools (+ PostgreSQL driver), Proto3                        |

## Getting started

1. Install [Docker](https://www.docker.com/) and the VS Code
   **Dev Containers** extension.
2. Open this repository in VS Code and run **"Dev Containers: Reopen in Container"**.
3. On first launch the container builds, `go mod download` runs, and PostgreSQL
   starts with a persistent volume.

## Database connection

The app service is pre-configured through environment variables (see
`devcontainer.json` / `docker-compose.yml`):

```
MANGAWEB_DB=postgres://postgres:password@db:5432/manga?sslmode=disable
MANGAWEB_DB_TYPE=postgres
```

From inside the container you can connect with:

```sh
psql "postgres://postgres:password@db:5432/manga"
```

The backend creates and migrates its own schema on startup via `ent`
(`backend/database/database.go`), so no manual table creation is required.
Extensions and any seed data can be added to `.devcontainer/initdb/`.

## Running the backend

```sh
cd backend
go run . -environment dev
```

The gRPC server listens on `:8972` (forwarded to the host).

## Ports

| Port | Service     |
| ---- | ----------- |
| 8972 | gRPC server |
| 5432 | PostgreSQL  |

## Resetting the database

```sh
docker compose -f .devcontainer/docker-compose.yml down -v
```

This removes the `postgres-data` volume; the next start re-runs the scripts in
`.devcontainer/initdb/`.
