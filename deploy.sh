#!/usr/bin/env bash
set -e

echo "Starting deploy..."

cd "$(dirname "$0")"

echo "Pulling latest changes from GitHub..."
git pull origin main

echo "Checking site files..."
test -f nginx/site/index.html

echo "Deploy complete."
