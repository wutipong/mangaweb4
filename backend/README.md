# MangaWeb 4 Backend

## Environment

By default, the server will uses environment variables setup inside `.env` and the system for its configurations.

## Setting up Database

Mangaweb 4 utilizes PostgreSQL. To change the database configuration, update the connection string environment variables to suit your database setup. 

```sh
MANGAWEB_DB=postgres://manga:password@host:5432/database
```

Make sure you have setup the database and the user/password beforehand. Also please grant adequate privilege to the user as this user will be used to setup the database (create tables, indexes, etc.). I usually grant all privileges of the database/schema to the user.

**note**

Sqlite is used for unit test.

## Setup gRPC code generation.

gRPC code is generated from protobuf schema files (*.proto) that is in separated project which is added as a submodule of this project. The code will be generated using `go generate` command. 

However, in contrast to the Ent's geneated code, gRPC requires some elaborated setup in order to get it working.

Most of the setup is already done in devcontainer environment. Please use devcontainer as the development environment.

## Updating database code

Mangaweb4-backend uses [ent](https://entgo.io/) Entity framework for managing database.

To update Database schema, firstly make changes to the files insides `ent/schema`, then run `go generate ent` from the project directory.

For more information about updating schema and generate codes, please visit [ent's website](https://entgo.io/docs/code-gen).
