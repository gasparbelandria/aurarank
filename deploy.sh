#!/bin/bash
# Deploy script for AuraRank VPS
# Service managed: aurarank (pm2)
#
# Usage: bash deploy.sh

set -e

echo "→ Pulling latest..."
git pull

echo "→ Installing dependencies..."
npm ci

echo "→ Building..."
npm run build

echo "→ Restarting pm2 process..."
pm2 reload aurarank --update-env

echo "✓ Deploy completo"
