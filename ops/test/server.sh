#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

# make sure a network for this project has been created
docker swarm init 2> /dev/null || true
docker network create --attachable --driver overlay "$project" 2> /dev/null || true

cmd=$1

# If file descriptors 0-2 exist, then we're prob running via interactive shell instead of on CD/CI
if [[ -t 0 && -t 1 && -t 2 ]]
then interactive=(--interactive --tty)
else echo "Running in non-interactive mode"
fi

# Initialize a bare git repo to use during tests
test_repo="$root/.test-content.git"
rm -rf "$test_repo"
git init --quiet --bare "$test_repo"

# Use a temporary non-bare repo to create the bare repo's first commit
test_temp_repo="$root/.test-content"
rm -rf "$test_temp_repo"
git init --quiet "$test_temp_repo"
echo "ref: refs/heads/main" > "$test_temp_repo/.git/HEAD"
(
  cd "$test_temp_repo"
  git commit --allow-empty -m "initial commit"
  git push "$test_repo" main
)
rm -rf "$test_temp_repo"

docker run \
  "${interactive[@]}" \
  --entrypoint="bash" \
  --env="CI=$CI" \
  --env="BLOG_LOG_LEVEL=${BLOG_LOG_LEVEL:-silent}" \
  --name="${project}_${cmd}_server" \
  --network "$project" \
  --rm \
  --tmpfs="/tmp" \
  --user="$(id -u):$(id -g)" \
  --volume="$root:/root" \
  --volume="$test_repo:/blog-content.git" \
  "${project}_builder" "/test.sh" "server" "$cmd"
