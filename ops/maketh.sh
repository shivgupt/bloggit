#!/bin/bash

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
project="$(jq .name "$root/package.json" | tr -d '"')"

if [[ "$(uname)" == "Darwin" ]]
then id=0:0
else id="$(id -u):$(id -g)"
fi

docker run \
  "--name=${project}_builder" \
  "--volume=$root:/root" \
  --interactive \
  --rm \
  --tty \
  "${project}_builder" "$id" make -f /Makefile "$@"
