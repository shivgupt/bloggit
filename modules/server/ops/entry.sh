#!/bin/bash
set -e

export BLOG_INTERNAL_CONTENT_DIR="${BLOG_INTERNAL_CONTENT_DIR:-/blog-content.git}"
export BLOG_DEFAULT_BRANCH="${BLOG_DEFAULT_BRANCH:-main}"

echo "Starting server in env:"
echo "- BLOG_INTERNAL_CONTENT_DIR=$BLOG_INTERNAL_CONTENT_DIR"
echo "- BLOG_CONTENT_MIRROR=$BLOG_CONTENT_MIRROR"
echo "- BLOG_DEFAULT_BRANCH=$BLOG_DEFAULT_BRANCH"

if [[ -d "modules/server" ]]
then cd modules/server
fi

########################################
## Init & update local content git repo

if [[ ! -d "$BLOG_INTERNAL_CONTENT_DIR" || ! -d "$BLOG_INTERNAL_CONTENT_DIR/refs" ]]
then
  echo "Initializing a bare git repo and setting the HEAD branch to $BLOG_DEFAULT_BRANCH"
  git init --bare "$BLOG_INTERNAL_CONTENT_DIR"
  (
    cd "$BLOG_INTERNAL_CONTENT_DIR"
    rm -rf HEAD
    echo "ref: refs/heads/$BLOG_DEFAULT_BRANCH" > HEAD
  )
fi

if [[ -n "$BLOG_CONTENT_MIRROR" ]]
then
  (
    echo "Pulling updates from remote content mirror at $BLOG_CONTENT_MIRROR"
    cd "$BLOG_INTERNAL_CONTENT_DIR"
    if ! grep -qs "mirror" <<<"$(git remote)"
    then git remote add mirror "$BLOG_CONTENT_MIRROR"
    else git remote set-url mirror "$BLOG_CONTENT_MIRROR"
    fi
    git fetch mirror --prune --tags
    if ! grep -qs "main" <<<"$(git branch -l)"
    then git branch main mirror/main
    fi
  )
fi

########################################
## Launch the server

if [[ "$BLOG_PROD" == "true" ]]
then
  echo "Starting blog server in prod-mode"
  export NODE_ENV=production
  exec node --no-deprecation dist/entry.js \
    | pino-pretty --colorize --translateTime --ignore pid,level,hostname,module
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
    ./src/entry.ts | pino-pretty --colorize --translateTime --ignore pid,level,hostname,module
fi
