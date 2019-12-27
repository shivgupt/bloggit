#!/bin/bash
set -e

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
project="`cat $dir/../package.json | jq .name | tr -d '"'`"
name=$1
shift

docker service ps --no-trunc ${project}_$name
sleep 1
docker service logs --raw --tail 100 --follow ${project}_$name $@

