#!/usr/bin/env bash
set -e

organization="${CI_PROJECT_NAMESPACE:-`whoami`}"
project="blog"
registry="registry.gitlab.com/$organization/$project"

commit=`git rev-parse HEAD | head -c 8`
release=`cat package.json | grep '"version":' | awk -F '"' '{print $4}'`

version="$1" # one of "commit" or "release"
shift
images=$@

if [[ "$version" == "commit" ]]
then version=$commit
elif [[ "$version" == "release" ]]
then version=$release
else echo 'First arg should either be "commit" or "release" followed by images to push' && exit 1
fi

function safePush {
  image=${project}_$1
  echo;echo "Pushing $registry/$image:$version"
  if [[ -n "`curl -sflL "$registry/$image/tags/$version"`" ]]
  then
    echo "Image $registry/$image:$version already exists on the container registy, Aborting push"
    return
  else
    docker tag $image:$commit $registry/$image:$version
    docker push $registry/$image:$version
    # latest images are used as cache for build steps, keep them up-to-date
    docker tag $registry/$image:$version $registry/$image:latest
    docker push $registry/$image:latest
  fi
}

for image in $images
do safePush $image
done
