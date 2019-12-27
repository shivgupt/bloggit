#!/usr/bin/env bash
set -e

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
organization="${CI_PROJECT_NAMESPACE:-`whoami`}"
project="`cat $dir/../package.json | jq .name | tr -d '"'`"
registry="registry.gitlab.com/$organization/$project"
version="`git rev-parse HEAD | head -c 8`"

for image in $@
do
  image=${project}_$1
  echo;echo "Pushing $registry/$image:$version"
  docker tag $image:$version $registry/$image:$version
  docker push $registry/$image:$version
  # latest images are used as cache for build steps, keep them up-to-date
  docker tag $registry/$image:$version $registry/$image:latest
  docker push $registry/$image:latest
done
