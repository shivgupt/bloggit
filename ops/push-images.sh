#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)
registryRoot=$(grep -m 1 '"registry":' "$root/package.json" | cut -d '"' -f 4)
organization="${CI_PROJECT_NAMESPACE:-$(whoami)}"
release=$(grep -m 1 '"version":' "$root/package.json" | cut -d '"' -f 4)
commit=$(git rev-parse HEAD | head -c 8)

registry="$registryRoot/$organization/$project"

images="builder proxy server webserver"

# Also push a semver-tagged image if we're on prod
if [[ "$(git rev-parse --abbrev-ref HEAD)" == "prod" || "${GITHUB_REF##*/}" == "prod" ]]
then semver="$release"
else semver=""
fi

for name in $images
do
  image=${project}_$name
  if [[ -n "$semver" ]]
  then
    echo "Tagging image $image:$commit as $image:$semver"
    docker tag "$image:$commit" "$image:$semver"  || true
  fi
  for version in latest $commit $semver
  do
    echo "Tagging image $image:$version as $registry/$image:$version"
    docker tag "$image:$version" "$registry/$image:$version"  || true
    echo "Pushing image: $registry/$image:$version"
    docker push "$registry/$image:$version" || true
  done
done
