#!/bin/bash
set -e

branch="${BLOG_CONTENT_BRANCH:-main}"
repo="${BLOG_CONTENT_REPO}"

if [[ ! -d "/blog-content/.git" ]]
then git clone "$repo" /blog-content
fi

(
  cd /blog-content
  git fetch --all --prune --tags
  git checkout --force "$branch"
  git reset --hard "origin/$branch"
)

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
  if [[ -z "$(which nodemon)" ]]
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


