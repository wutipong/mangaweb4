# Go development container matching the project's Go 1.27 toolchain.
FROM mcr.microsoft.com/devcontainers/base:dev-ubuntu26.04

RUN mkdir -p /go/pkg/mod && chown -R vscode:vscode /go/pkg/mod
RUN mkdir -p /home/vscode/.cache/go-build && chown -R vscode:vscode /home/vscode/.cache/go-build

USER vscode

ENV PATH="/go/bin:${PATH}"
