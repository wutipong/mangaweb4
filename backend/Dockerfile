#Stage 1 -- building executable
FROM ubuntu:26.04 AS builder

# Install native dependencies required by govips and ffmpeg-go
RUN apt-get update && apt-get install -y --fix-broken \
    && apt-get install -y --no-install-recommends \
    build-essential \
    golang-go \
    libvips-dev \
    ffmpeg \
    libvpx12 \
    libopus0 \
    ca-certificates

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

WORKDIR /app

# Copy source and build
COPY . .

ARG VERSION=Development
RUN go get ./...
RUN go build -o mangaweb4-backend .

# Stage 2 -- build the target image
FROM ubuntu:26.04

WORKDIR /root/
COPY --from=builder /app/mangaweb4-backend ./

# Install runtime native libraries (libvips, ffmpeg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips \
    ca-certificates 

CMD ["./mangaweb4-backend"]
EXPOSE 8972