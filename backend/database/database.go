package database

import (
	"context"

	"entgo.io/ent/dialect"
	dialect_sql "entgo.io/ent/dialect/sql"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/mangaweb4/mangaweb4-backend/configuration"
	"github.com/mangaweb4/mangaweb4-backend/ent"
	"github.com/mangaweb4/mangaweb4-backend/ent/migrate"
	"github.com/rs/zerolog/log"
)

var pool *pgxpool.Pool

var connectionStr string

func Open(ctx context.Context, connStr string) error {
	connectionStr = connStr

	if p, e := pgxpool.New(ctx, connStr); e == nil {
		pool = p
		return nil
	} else {
		return e
	}
}

func openPostgres() (db *dialect_sql.Driver, err error) {
	db = dialect_sql.OpenDB(dialect.Postgres, stdlib.OpenDBFromPool(pool))

	return
}

func Close() {
	if pool != nil {
		pool.Close()
	}
}

func CreateEntClient() *ent.Client {
	db, err := openPostgres()
	if err != nil {
		return nil
	}
	config := configuration.Get()

	var drv dialect.Driver
	if config.DebugMode {
		drv = dialect.DebugWithContext(db, func(ctx context.Context, i ...any) {
			for _, v := range i {
				log.Debug().Interface("params", v).Msg("Ent Debug")
			}
		})
	} else {
		drv = db
	}

	options := []ent.Option{
		ent.Driver(drv),
	}

	if config.DebugMode {
		options = append(options,
			ent.Debug(),
			ent.Log(func(params ...any) {
				stat := pool.Stat()

				log.Debug().
					Any("params", params).
					Int32("Acquired Conns", stat.AcquiredConns()).
					Int32("Idle Conns", stat.IdleConns()).
					Int32("Constructed Conns", stat.ConstructingConns()).
					Msg("Ent Debug")

			}),
		)
	}

	client := ent.NewClient(options...)

	return client
}

func CreateSchema(ctx context.Context) error {
	client := CreateEntClient()
	defer func() { log.Err(client.Close()).Msg("close database connection") }()

	return client.Schema.Create(ctx, migrate.WithDropColumn(true), migrate.WithDropIndex(true))
}
