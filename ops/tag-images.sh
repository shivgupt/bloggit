#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)
commit=$(git rev-parse HEAD | head -c 8)
semver=$(grep -m 1 '"version":' package.json | cut -d '"' -f 4)

bash ops/pull-images.sh "$commit"

for name in builder proxy server webserver
do
  image=${project}_$name
  echo "Tagging image $image:$commit as $image:$semver"
  docker tag "$image:$commit" "$image:$semver" || true
done

bash ops/push-images.sh "$semver"
