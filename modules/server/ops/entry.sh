#!/bin/bash
set -e

if [[ -d "modules/server" ]]
then cd modules/server
fi

export POSTGRES_PASSWORD="`cat $POSTGRES_PASSWORD_FILE`"

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
