#!/bin/bash

# Simple deploy script for Exora client
# - Runs `npm run build` in the client folder
# - Copies the built files to the nginx web root
# - Restarts nginx

set -e

CLIENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$CLIENT_DIR/dist"
# Nginx serves exora.solutions from /var/www/exora.solutions/dist (see /etc/nginx/sites-available/exora.solutions)
WEB_ROOT="/var/www/exora.solutions/dist"

echo "→ Working from: $CLIENT_DIR"
cd "$CLIENT_DIR"

echo "→ Building client (npm run build)..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
  echo "✗ Build directory '$BUILD_DIR' not found. Aborting."
  exit 1
fi

echo "→ Copying build output to $WEB_ROOT ..."
sudo mkdir -p "$WEB_ROOT"
# Optionally clear old files to avoid stale assets
sudo rm -rf "$WEB_ROOT"/*
sudo cp -r "$BUILD_DIR"/* "$WEB_ROOT"/

echo "→ Restarting nginx..."
sudo systemctl restart nginx

if [ $? -eq 0 ]; then
  echo "✓ Deployment successful!"
  echo ""
  echo "If mobile still shows an old build:"
  echo "  1. Ensure nginx does not cache index.html (see nginx-cache-fix.conf)."
  echo "  2. On the phone: hard refresh or clear site data for this domain."
else
  echo "✗ Failed to restart nginx"
  exit 1
fi

