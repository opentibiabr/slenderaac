#!/bin/bash
set -e

git pull
if ! command -v bun >/dev/null; then
    echo "Install Bun before updating SlenderAAC." >&2
    exit 1
fi
bun install --frozen-lockfile
bun run migrate
bun run generate
bun run build
