-- Runs once when the PostgreSQL data volume is first created.
-- The `manga` database itself is created by the postgres image via POSTGRES_DB,
-- so this file is a convenient place for extensions / seed data.

\connect manga

-- Useful extensions for text search / fuzzy matching on manga titles & tags.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NOTE: The application creates/maintains its own schema at startup via ent
-- (see backend/database/database.go -> CreateSchema). No table DDL is needed here.
