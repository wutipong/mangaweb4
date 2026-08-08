# Go development container matching the project's Go 1.26 toolchain.
FROM mcr.microsoft.com/devcontainers/go:1-1.26-bookworm

# Install extra tooling useful for this project:
#  - protobuf compiler + Go plugins for the gRPC definitions
#  - postgresql-client so `psql` is available for debugging the db service
RUN apt-get update \
	&& export DEBIAN_FRONTEND=noninteractive \
	&& apt-get install -y --no-install-recommends \
		protobuf-compiler \
		postgresql-client \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

# Install Go-based tooling as the non-root user.
USER vscode

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest \
	&& go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest \
	&& go install entgo.io/ent/cmd/ent@latest

ENV PATH="/go/bin:${PATH}"
