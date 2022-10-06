#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

# turn on swarm mode if it's not already on
docker swarm init 2> /dev/null || true
docker network create --attachable --driver overlay "$project" 2> /dev/null || true

if grep -qs "$project" <<<"$(docker stack ls | tail -n +2)"
then echo "$project stack is already running" && exit
fi

####################
# External Env Vars

# shellcheck disable=SC1091
if [[ -f .env ]]; then source .env; fi

BLOG_AUTH_PASSWORD="${BLOG_AUTH_PASSWORD:-abc123}"
BLOG_AUTH_USERNAME="${BLOG_AUTH_USERNAME:-admin}"
BLOG_BRANCH="${BLOG_BRANCH:-main}"
BLOG_DATADIR_CONTENT="${BLOG_DATADIR_CONTENT:-$root/blog-content.git}"
BLOG_DATADIR_IPFS="${BLOG_DATADIR_IPFS:-$root/ipfs}"
BLOG_DOMAINNAME="${BLOG_DOMAINNAME:-}"
BLOG_EMAIL="${BLOG_EMAIL:-noreply@gmail.com}" # for notifications when ssl certs expire
BLOG_LOG_LEVEL="${BLOG_LOG_LEVEL:-info}"
BLOG_MAX_UPLOAD_SIZE="${BLOG_MAX_UPLOAD_SIZE:-100mb}"
BLOG_MIRROR_KEY="${BLOG_MIRROR_KEY:-}"
BLOG_MIRROR_URL="${BLOG_MIRROR_URL:-}"
BLOG_PROD="${BLOG_PROD:-false}"
BLOG_SEMVER="${BLOG_SEMVER:-false}"

# If semver flag is given, we should ensure the prod flag is also active
if [[ "$BLOG_SEMVER" == "true" ]]
then export BLOG_PROD=true
fi

echo "Launching $project in env:"
echo "- BLOG_AUTH_PASSWORD=$BLOG_AUTH_PASSWORD"
echo "- BLOG_AUTH_USERNAME=$BLOG_AUTH_USERNAME"
echo "- BLOG_BRANCH=$BLOG_BRANCH"
echo "- BLOG_DATADIR_CONTENT=$BLOG_DATADIR_CONTENT"
echo "- BLOG_DATADIR_IPFS=$BLOG_DATADIR_IPFS"
echo "- BLOG_DOMAINNAME=$BLOG_DOMAINNAME"
echo "- BLOG_EMAIL=$BLOG_EMAIL"
echo "- BLOG_LOG_LEVEL=$BLOG_LOG_LEVEL"
echo "- BLOG_MAX_UPLOAD_SIZE=$BLOG_MAX_UPLOAD_SIZE"
echo "- BLOG_MIRROR_KEY=$BLOG_MIRROR_KEY"
echo "- BLOG_MIRROR_URL=$BLOG_MIRROR_URL"
echo "- BLOG_PROD=$BLOG_PROD"
echo "- BLOG_SEMVER=$BLOG_SEMVER"

########################################
# Misc Config

mkdir -p "$BLOG_DATADIR_CONTENT"
mkdir -p "$BLOG_DATADIR_IPFS"

commit=$(git rev-parse HEAD | head -c 8)
semver="v$(grep -m 1 '"version":' "$root/package.json" | cut -d '"' -f 4)"
if [[ "$BLOG_SEMVER" == "true" ]]
then version="$semver"
elif [[ "$BLOG_PROD" == "true" ]]
then version="$commit"
else version="latest"
fi

common="networks:
      - '$project'
    logging:
      driver: 'json-file'
      options:
          max-size: '10m'"

########################################
# IPFS config

ipfs_internal_port=5001

ipfs_image="ipfs/go-ipfs:v0.8.0"
bash "$root/ops/pull-images.sh" "$ipfs_image"

########################################
# Server config

internal_content="/blog-content.git"

server_internal_port=8080
server_env="environment:
      BLOG_AUTH_PASSWORD: '$BLOG_AUTH_PASSWORD'
      BLOG_AUTH_USERNAME: '$BLOG_AUTH_USERNAME'
      BLOG_BRANCH: '$BLOG_BRANCH'
      BLOG_DOMAINNAME: '$BLOG_DOMAINNAME'
      BLOG_EMAIL: '$BLOG_EMAIL'
      BLOG_INTERNAL_CONTENT_DIR: '$internal_content'
      BLOG_LOG_LEVEL: '$BLOG_LOG_LEVEL'
      BLOG_MAX_UPLOAD_SIZE: '$BLOG_MAX_UPLOAD_SIZE'
      BLOG_MIRROR_KEY: '$BLOG_MIRROR_KEY'
      BLOG_MIRROR_URL: '$BLOG_MIRROR_URL'
      BLOG_PORT: '$server_internal_port'
      BLOG_PROD: '$BLOG_PROD'
      IPFS_URL: 'ipfs:$ipfs_internal_port'"

if [[ "$BLOG_PROD" == "true" ]]
then
  server_image="${project}_server:$version"
  server_service="server:
    image: '$server_image'
    $common
    $server_env
    volumes:
      - '$BLOG_DATADIR_CONTENT:$internal_content'"

else
  server_image="${project}_builder:$version"
  server_service="server:
    image: '$server_image'
    $common
    $server_env
    entrypoint: 'bash modules/server/ops/entry.sh'
    ports:
      - '5000:5000'
    volumes:
      - '$root:/root'
      - '$BLOG_DATADIR_CONTENT:$internal_content'"

fi
bash "$root/ops/pull-images.sh" "$server_image"

########################################
# Webserver config

webserver_internal_port=3000

if [[ "$BLOG_PROD" == "true" ]]
then
  webserver_image="${project}_webserver:$version"
  webserver_service="webserver:
    image: '$webserver_image'
    $common"

else
  webserver_image="${project}_builder:$version"
  webserver_service="webserver:
    image: '$webserver_image'
    $common
    entrypoint: 'npm start'
    environment:
      NODE_ENV: 'development'
    volumes:
      - '$root:/root'
    working_dir: '/root/modules/client'"

fi
bash "$root/ops/pull-images.sh" "$webserver_image"

########################################
# Proxy config

proxy_image="${project}_proxy:$version"
bash "$root/ops/pull-images.sh" "$proxy_image"

if [[ -n "$BLOG_DOMAINNAME" ]]
then
  public_url="https://$BLOG_DOMAINNAME/git/config"
  proxy_ports="ports:
      - '80:80'
      - '443:443'"
  echo "${project}_proxy will be exposed on *:80 and *:443"

else
  public_port=${public_port:-3000}
  public_url="http://127.0.0.1:$public_port/git/config"
  proxy_ports="ports:
      - '$public_port:80'"
  echo "${project}_proxy will be exposed on *:$public_port"
fi

####################
# Launch It

docker_compose=$root/.docker-compose.yml
rm -f "$docker_compose"
cat - > "$docker_compose" <<EOF
version: '3.4'

networks:
  $project:
    external: true

volumes:
  certs:

services:

  proxy:
    image: '$proxy_image'
    $common
    $proxy_ports
    environment:
      DOMAINNAME: '$BLOG_DOMAINNAME'
      EMAIL: '$BLOG_EMAIL'
      SERVER_URL: 'server:$server_internal_port'
      WEBSERVER_URL: 'webserver:$webserver_internal_port'
    volumes:
      - 'certs:/etc/letsencrypt'

  $webserver_service

  $server_service

  ipfs:
    image: '$ipfs_image'
    $common
    ports:
      - '4001:4001'
    volumes:
      - '$BLOG_DATADIR_IPFS:/data/ipfs'

EOF

docker stack deploy -c "$docker_compose" "$project"

echo "The $project stack has been deployed, waiting for $public_url to start responding.."
timeout=$(( $(date +%s) + 60 ))
while true
do
  res=$(curl -k -m 5 -s "$public_url" || true)
  if [[ -z "$res" || "$res" == *"Waiting for proxy to wake up"* ]]
  then
    if [[ "$(date +%s)" -gt "$timeout" ]]
    then
      echo "Timed out waiting for $public_url to respond.."
      docker service logs "${project}_proxy"
      docker service logs "${project}_webserver"
      docker service logs "${project}_server"
      exit
    else sleep 2
    fi
  else echo "Good Morning!"; break;
  fi
done

# Delete old images in prod to prevent the disk from filling up
if [[ "$BLOG_PROD" == "true" ]]
then
  docker container prune --force;
  mapfile -t imagesToRemove < <(docker image ls \
    | grep "${project}_" \
    | grep -v "$commit" \
    | grep -v "$semver" \
    | grep -v "latest" \
    | awk '{print $3}' \
    | sort -u
  )
  if [[ "${#imagesToRemove[@]}" -gt 0 ]]
  then docker image rm --force "${imagesToRemove[@]}"
  else echo "No unnecessary images present, skipping cleanup"
  fi
fi
