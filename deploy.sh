#!/usr/bin/env bash
set -euo pipefail

# Overridable vars
IMAGE="${IMAGE:-ghcr.io/jkanodev/infra-self-hosted:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-portfolio}"
PORT="${PORT:-8080}"

echo "Starting deploy..."
echo "IMAGE=$IMAGE"
echo "CONTAINER_NAME=$CONTAINER_NAME"
echo "PORT=$PORT"

# Pull latest image
echo "Pulling image..."
docker pull "$IMAGE"

# Stop/remove old container if it exists
if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "Stopping existing container..."
  docker stop "$CONTAINER_NAME" || true
  echo "Removing existing container..."
  docker rm "$CONTAINER_NAME" || true
fi

# Run new container
echo "Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "$PORT:80" \
  "$IMAGE"

echo "Deploy complete."
docker ps --filter "name=$CONTAINER_NAME"
