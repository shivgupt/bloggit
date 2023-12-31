#!/bin/bash

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
project="$(jq .name "$root/package.json" | tr -d '"')"

if [[ "$(uname)" == "Darwin" ]]
then id=0:0
else id="$(id -u):$(id -g)"
fi

# If file descriptors 0-2 exist, then we're prob running via interactive shell instead of on CD/CI
if [[ -t 0 && -t 1 && -t 2 ]]
then interactive=(--interactive --tty)
else echo "Running in non-interactive mode"
fi

docker run \
  "${interactive[@]}" \
  "--name=${project}_builder" \
  "--volume=$root:/root" \
  --rm \
  "${project}_builder" "$id" make -f /Makefile "$@"
