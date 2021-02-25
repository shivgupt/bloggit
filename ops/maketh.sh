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

if [[ -n "$REACT_APP_ENV" ]]
then
  echo "Loading env vars from $REACT_APP_ENV:"
  tee "$root/modules/client/.env.production.local" < "$REACT_APP_ENV"
fi

docker run \
  "${interactive[@]}" \
  "--env=REACT_APP_DARK_PRIMARY=$REACT_APP_DARK_PRIMARY" \
  "--env=REACT_APP_DARK_SECONDARY=$REACT_APP_DARK_SECONDARY" \
  "--env=REACT_APP_FONT_FAMILY=$REACT_APP_FONT_FAMILY" \
  "--env=REACT_APP_LIGHT_PRIMARY=$REACT_APP_LIGHT_PRIMARY" \
  "--env=REACT_APP_LIGHT_SECONDARY=$REACT_APP_LIGHT_SECONDARY" \
  "--env=REACT_APP_SITE_DESCRIPTION=$REACT_APP_SITE_DESCRIPTION" \
  "--env=REACT_APP_SITE_TITLE=$REACT_APP_SITE_TITLE" \
  "--name=${project}_builder" \
  "--volume=$root:/root" \
  --rm \
  "${project}_builder" "$id" make -f /Makefile "$@"
