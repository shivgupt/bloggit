#!/bin/bash
set -e

branch="${BLOG_CONTENT_BRANCH:-master}"
repo="${BLOG_CONTENT_REPO}"

if [[ ! -d "/blog-content/.git" ]]
then git clone $repo /blog-content
fi

pushd /blog-content
git fetch --all --prune --tags
git checkout --force $branch
git reset --hard origin/$branch
popd

if [[ -d "modules/server" ]]
then cd modules/server
fi

if [[ "$NODE_ENV" == "development" ]]
then
  echo "Starting blog server in dev-mode"
  exec ./node_modules/.bin/nodemon \
    --delay 1 \
    --exitcrash \
    --legacy-watch \
    --polling-interval 1000 \
    --watch src \
    --exec ts-node \
    ./src/entry.ts
else
  echo "Starting blog server in prod-mode"
  exec node --no-deprecation dist/entry.js
fi


