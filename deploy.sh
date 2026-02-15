#!/usr/bin/env bash
# Run on the server to pull the latest image and restart the container.
# Also invoked by GitHub Actions via SSH after build-and-push.
set -e

IMAGE="${IMAGE:-ghcr.io/jkanodev/infra-self-hosted:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-portfolio-web}"
PORT="${PORT:-80}"

echo "Pulling $IMAGE..."
docker pull "$IMAGE"

echo "Replacing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true
docker run -d --name "$CONTAINER_NAME" --restart unless-stopped -p "${PORT}:80" "$IMAGE"

echo "Deploy complete."
docker ps --filter "name=$CONTAINER_NAME"
