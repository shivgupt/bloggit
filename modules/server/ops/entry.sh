#!/bin/bash
set -e

BLOG_CONTENT_DIR="${BLOG_CONTENT_DIR:-/blog-content.git}"

if [[ ! -d "$BLOG_CONTENT_DIR" ]]
then git init --bare "$BLOG_CONTENT_DIR"
fi

if [[ -d "modules/server" ]]
then cd modules/server
fi

if [[ "$BLOG_PROD" == "true" ]]
then
  echo "Starting blog server in prod-mode"
  export NODE_ENV=production
  exec node --no-deprecation dist/entry.js
else
  echo "Starting blog server in dev-mode"
  export NODE_ENV=development
  if [[ -z "$(command -v nodemon)" ]]
  then
    echo "Install deps & mount the monorepo into this container before running in dev-mode"
    exit 1
  fi
  exec nodemon \
    --delay 1 \
    --exitcrash \
    --legacy-watch \
    --polling-interval 1000 \
    --watch src \
    --exec ts-node \
    ./src/entry.ts
fi


