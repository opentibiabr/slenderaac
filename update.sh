#!/bin/bash

git pull
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun install
bunx prisma migrate deploy
bunx prisma generate
bun build