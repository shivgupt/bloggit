#!/bin/bash
set -e

dev_target="src/index.ts"
prod_target="dist/bundle.js"

# Ensure defaults are set for important env vars
export BLOG_BRANCH="${BLOG_BRANCH:-main}"
export BLOG_INTERNAL_CONTENT_DIR="${BLOG_INTERNAL_CONTENT_DIR:-/blog-content.git}"
export BLOG_MIRROR_KEY="${BLOG_MIRROR_KEY:-}"
export BLOG_MIRROR_REF="${BLOG_MIRROR_REF:-mirror}"

# Log all env vars
echo "Starting server in env:"
echo "- BLOG_AUTH_PASSWORD=$BLOG_AUTH_PASSWORD"
echo "- BLOG_AUTH_USERNAME=$BLOG_AUTH_USERNAME"
echo "- BLOG_BRANCH=$BLOG_BRANCH"
echo "- BLOG_DOMAINNAME=$BLOG_DOMAINNAME"
echo "- BLOG_EMAIL=$BLOG_EMAIL"
echo "- BLOG_INTERNAL_CONTENT_DIR=$BLOG_INTERNAL_CONTENT_DIR"
echo "- BLOG_LOG_LEVEL=$BLOG_LOG_LEVEL"
echo "- BLOG_MAX_UPLOAD_SIZE=$BLOG_MAX_UPLOAD_SIZE"
echo "- BLOG_MIRROR_KEY=$BLOG_MIRROR_KEY"
echo "- BLOG_MIRROR_REF=$BLOG_MIRROR_REF"
echo "- BLOG_MIRROR_URL=$BLOG_MIRROR_URL"
echo "- BLOG_PORT=$BLOG_PORT"
echo "- BLOG_PROD=$BLOG_PROD"

if [[ -d "modules/server" ]]
then cd modules/server
fi

if [[ ! -f "$dev_target" && ! -f "$prod_target" ]]
then echo "Fatal: couldn't find file to run" && pwd && ls && exit 1
fi

########################################
## Init & update local content git repo

if [[ ! -d "$BLOG_INTERNAL_CONTENT_DIR" || ! -d "$BLOG_INTERNAL_CONTENT_DIR/refs" ]]
then
  echo "Initializing a bare git repo and setting the HEAD branch to $BLOG_BRANCH"
  git init --bare "$BLOG_INTERNAL_CONTENT_DIR"
  (
    cd "$BLOG_INTERNAL_CONTENT_DIR"
    rm -rf HEAD
    echo "ref: refs/heads/$BLOG_BRANCH" > HEAD
  )
fi

if [[ -n "$BLOG_MIRROR_URL" ]]
then
  (
    echo "Pulling updates from remote content $BLOG_MIRROR_REF at $BLOG_MIRROR_URL"
    cd "$BLOG_INTERNAL_CONTENT_DIR"
    if ! grep -qs "$BLOG_MIRROR_REF" <<<"$(git remote)"
    then git remote add "$BLOG_MIRROR_REF" "$BLOG_MIRROR_URL"
    else git remote set-url "$BLOG_MIRROR_REF" "$BLOG_MIRROR_URL"
    fi
    git fetch "$BLOG_MIRROR_REF" --prune --tags || true
    if ! grep -qs "$BLOG_BRANCH" <<<"$(git branch -l)"
    then git branch "$BLOG_BRANCH" "$BLOG_MIRROR_REF/$BLOG_BRANCH"
    fi
  )

elif [[ ! -f "$BLOG_INTERNAL_CONTENT_DIR/refs/heads/$BLOG_BRANCH" ]]
then
  echo "Creating the first commit on branch $BLOG_BRANCH in $BLOG_INTERNAL_CONTENT_DIR"
  test_temp_repo="/tmp/tmp.git"
  rm -rf "$test_temp_repo"
  git init --quiet "$test_temp_repo"
  echo "ref: refs/heads/$BLOG_BRANCH" > "$test_temp_repo/.git/HEAD"
  (
    cd "$test_temp_repo"
    git config user.email "test@localhost"
    git config user.name "test"
    echo '{"title":"Test","posts":{}}' > index.json
    git add index.json
    git commit --message "initial commit"
    git push "$BLOG_INTERNAL_CONTENT_DIR" "$BLOG_BRANCH"
  )
  rm -rf "$test_temp_repo"
fi

########################################
## Launch the server

if [[ "$BLOG_PROD" == "true" ]]
then
  echo "Starting bloggit server in prod-mode"
  export NODE_ENV=production
  exec node --no-deprecation "$prod_target"
else
  echo "Starting bloggit server in dev-mode"
  export NODE_ENV=development
  if [[ -z "$(command -v nodemon)" ]]
  then
    echo "Install deps & mount the monorepo into this container before running in dev-mode"
    exit 1
  fi
  exec nodemon \
    --delay 1 \
    --exec "node -r ts-node/register" \
    --exitcrash \
    --experimental-modules \
    --ignore '**/*.swp' \
    --ignore '**/*.test.ts' \
    --legacy-watch \
    --polling-interval 1000 \
    --watch '**/*.ts' \
    "$dev_target"
fi
