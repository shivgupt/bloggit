#!/bin/bash

chown -R "$(id -u):$(id -g)" /root/.config

unit=$1
cmd="${2:-test}"

if [[ -d "modules/$unit" ]]
then cd "modules/$unit" || exit 1
fi

if [[ "$CI" == "true" ]]
then opts="--forbid-only"
else opts=""
fi

if [[ "${cmd##*-}" == "test" ]]
then
  set -o pipefail
  echo "Starting $unit tester"
  if [[ -n "$(command -v pino-pretty)" ]]
  then exec npm run test -- $opts | pino-pretty --colorize
  else exec npm run test -- $opts
  fi

elif [[ "${cmd##*-}" == "watch" ]]
then
  echo "Starting $unit watcher"

  function getChecksum {
    find "${src[@]}" -type f -not -name "*.swp" -exec sha256sum {} \; | sha256sum;
  }

  src=()
  for dir in src src.ts src.sol
  do
    if [[ -d "$dir" ]]
    then src+=("$dir")
    fi
  done
  echo "Watching src folders: ${src[*]}"

  prev_checksum=""
  while true
  do
    checksum="$(getChecksum)"
    if [[ "$checksum" != "$prev_checksum" ]]
    then
      echo
      echo "Changes detected!"

      npm_pids="$(pgrep "npm" | tr '\n\r' ' ')"
      if [[ -n "$npm_pids" ]]
      then
        echo "Stopping all npm processes w pids: $npm_pids"
        for pid in $npm_pids
        do kill "$pid" 2> /dev/null
        done
      fi

      sleep 2
      echo "Re-running tests..."

      prev_checksum="$(getChecksum)"
      if [[ -n "$(command -v pino-pretty)" ]]
      then (npm run test -- $opts | pino-pretty --colorize &)
      else (npm run test -- $opts &)
      fi

    # If no changes, do nothing
    else sleep 2
    fi
  done
else
  echo "idk what to do with commend $cmd"
fi
