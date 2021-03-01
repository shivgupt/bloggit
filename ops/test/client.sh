#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

# make sure a network for this project has been created
docker swarm init 2> /dev/null || true
docker network create --attachable --driver overlay "$project" 2> /dev/null || true

cmd=$1

export ELECTRON_ENABLE_LOGGING=true
export BLOG_HOST_CONTENT_DIR="$root/.test-content.git"
export BLOG_MIRROR_URL=""
make start
docker service ls
echo "====="
docker container ls
echo "====="
docker service logs blog_webserver

if [[ -d "modules/client" ]]
then cd modules/client || exit 1;
fi

if [[ "$cmd" == "watch" ]]
then
  cypress="$root/node_modules/.bin/cypress"
  if [[ ! -f "$cypress" ]];
  then echo "Can't find cypress cli at $cypress" && exit 1;
  else $cypress install
  fi
  exec "$cypress" open
else
  # If file descriptors 0-2 exist, then we're prob running via interactive shell instead of on CD/CI
  if [[ -t 0 && -t 1 && -t 2 ]]
  then interactive=(--interactive --tty)
  else echo "Running in non-interactive mode"
  fi
  cypress_image="cypress/included:$(grep -m 1 '"cypress":' "$root/package.json" | cut -d '"' -f 4)"
  bash "$root/ops/pull-images.sh" "$cypress_image"
  docker run \
    "${interactive[@]}" \
    --name="${project}_${cmd}_client" \
    --network "$project" \
    --rm \
    --volume="$root/modules/client:/client" \
    --workdir="/client" \
    "$cypress_image" run --spec "cypress/tests/index.js" --env "baseUrl=http://proxy"
fi
