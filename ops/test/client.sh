#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

# make sure a network for this project has been created
docker swarm init 2> /dev/null || true
docker network create --attachable --driver overlay "$project" 2> /dev/null || true

cmd=$1

cypress="$root/node_modules/.bin/cypress"
if [[ ! -f "$cypress" ]];
then echo "Can't find cypress cli at $cypress" && exit 1;
else $cypress install
fi

export BLOG_HOST_CONTENT_DIR="$root/.test-content.git"
export BLOG_MIRROR_URL=""
make start

if [[ -d "modules/client" ]]
then cd modules/client || exit 1;
fi

export ELECTRON_ENABLE_LOGGING=true
if [[ "$cmd" == "--watch" ]]
then exec "$cypress" open
else exec "$cypress" run --spec cypress/tests/index.js
fi
