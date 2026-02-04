#!/bin/bash

# Sync All Economic Data Script
# This script syncs both US and Taiwan economic data

set -e

echo "========================================="
echo "Starting Economic Data Sync"
echo "========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "Error: Development server is not running"
    echo "Please start the server with: pnpm dev"
    exit 1
fi

echo "✓ Server is running"
echo ""

# Sync US Data
echo "========================================="
echo "Syncing US Economic Data..."
echo "========================================="
curl -s http://localhost:3000/api/sync | jq '.'
echo ""

# Wait a bit between syncs
sleep 2

# Sync Taiwan Data
echo "========================================="
echo "Syncing Taiwan Economic Data..."
echo "========================================="
curl -s http://localhost:3000/api/sync-taiwan | jq '.'
echo ""

echo "========================================="
echo "Data Sync Completed!"
echo "========================================="
