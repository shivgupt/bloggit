#!/usr/bin/env bash
set -e

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

# turn on swarm mode if it's not already on
docker swarm init 2> /dev/null || true
docker network create --attachable --driver overlay "$project" 2> /dev/null || true

####################
# External Env Vars

BLOG_MEDIA_DIR="${BLOG_MEDIA_DIR:-$root/../blog-content/media}" # mounted into IPFS
BLOG_CONTENT_BRANCH="${BLOG_CONTENT_BRANCH:-master}"
BLOG_CONTENT_DIR="${BLOG_CONTENT_DIR:-}"
BLOG_CONTENT_REPO="${BLOG_CONTENT_REPO:-https://gitlab.com/bohendo/blog-content.git}"
BLOG_CONTENT_URL="${BLOG_CONTENT_URL:-https://gitlab.com/bohendo/blog-content/raw}"
BLOG_DOMAINNAME="${BLOG_DOMAINNAME:-}"
BLOG_EMAIL="${BLOG_EMAIL:-noreply@gmail.com}" # for notifications when ssl certs expire
BLOG_PROD="${BLOG_PROD:-false}"

########################################
# Misc Config

if [[ "$BLOG_PROD" == "true" ]]
then
  # If we're on the prod branch then use the release semvar, otherwise use the commit hash
  if [[ "$(git rev-parse --abbrev-ref HEAD)" == "prod" || "${GITHUB_REF##*/}" == "prod" ]]
  then version=$(grep -m 1 '"version":' package.json | cut -d '"' -f 4)
  else version=$(git rev-parse HEAD | head -c 8)
  fi
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

mkdir -p "$BLOG_MEDIA_DIR"

ipfs_internal_port=8080

ipfs_image="ipfs/go-ipfs:v0.7.0"
bash "$root/ops/pull-images.sh" "$ipfs_image"

########################################
# Server config

server_internal_port=8080
server_env="environment:
      BLOG_CONTENT_BRANCH: '$BLOG_CONTENT_BRANCH'
      BLOG_CONTENT_DIR: '$BLOG_CONTENT_DIR'
      BLOG_CONTENT_REPO: '$BLOG_CONTENT_REPO'
      BLOG_CONTENT_URL: '$BLOG_CONTENT_URL'
      BLOG_PROD: '$BLOG_PROD'
      PORT: '$server_internal_port'"

if [[ "$BLOG_PROD" == "true" ]]
then
  server_image="${project}_server:$version"
  server_service="server:
    image: '$server_image'
    $common
    $server_env
    volumes:
      - 'content:/blog-content'"

else
  server_image="${project}_builder:$version"
  server_service="server:
    image: '$server_image'
    $common
    $server_env
    entrypoint: 'bash modules/server/ops/entry.sh'
    volumes:
      - '$root:/root'
      - 'content:/blog-content'"

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
  public_url="https://$BLOG_DOMAINNAME/ping"
  proxy_ports="ports:
      - '80:80'
      - '443:443'"
  echo "${project}_proxy will be exposed on *:80 and *:443"

else
  public_port=${public_port:-3000}
  public_url="http://127.0.0.1:$public_port/ping"
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
  content:
  ipfs:

services:
  proxy:
    image: '$proxy_image'
    $common
    $proxy_ports
    environment:
      DOMAINNAME: '$BLOG_DOMAINNAME'
      EMAIL: '$BLOG_EMAIL'
      IPFS_URL: 'ipfs:$ipfs_internal_port'
      SERVER_URL: 'server:$server_internal_port'
      WEBSERVER_URL: 'webserver:$webserver_internal_port'
    ports:
      - '$public_port:80'
    volumes:
      - 'certs:/etc/letsencrypt'

  $webserver_service

  $server_service

  ipfs:
    image: '$ipfs_image'
    $common
    volumes:
      - 'ipfs:/data/ipfs'
      - '$BLOG_MEDIA_DIR:/media'
    ports:
      - '5001:5001'

EOF

docker stack deploy -c "$docker_compose" "$project"

echo "The blog stack has been deployed, waiting for $public_url to start responding.."
timeout=$(( $(date +%s) + 60 ))
while true
do
  res=$(curl -k -m 5 -s "$public_url" || true)
  if [[ -z "$res" || "$res" == *"Waiting for proxy to wake up"* ]]
  then
    if [[ "$(date +%s)" -gt "$timeout" ]]
    then echo "Timed out waiting for $public_url to respond.." && exit
    else sleep 2
    fi
  else echo "Good Morning!" && exit;
  fi
done
