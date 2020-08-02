#!/usr/bin/env bash
set -e

# turn on swarm mode if it's not already on
docker swarm init 2> /dev/null || true

####################
# External Env Vars

BLOG_CONTENT_BRANCH="${BLOG_CONTENT_BRANCH:-master}"
BLOG_CONTENT_DIR="${BLOG_CONTENT_DIR:-}"
BLOG_CONTENT_REPO="${BLOG_CONTENT_REPO:-https://gitlab.com/bohendo/blog-content.git}"
BLOG_CONTENT_URL="${BLOG_CONTENT_URL:-https://gitlab.com/bohendo/blog-content/raw}"
BLOG_DOMAINNAME="${BLOG_DOMAINNAME:-localhost}"
BLOG_EMAIL="${BLOG_EMAIL:-noreply@gmail.com}" # for notifications when ssl certs expire

####################
# Internal Config

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
project="`cat $dir/../package.json | jq .name | tr -d '"'`"
number_of_services="3" # NOTE: Gotta update this manually when adding/removing services :(
server_port=8080
ipfs_port=8080

####################
# Helper Functions

# Get images that we aren't building locally
function pull_if_unavailable {
  if [[ -z "`docker image ls | grep ${1%:*} | grep ${1#*:}`" ]]
  then
    # But actually don't pull images if we're running locally
    if [[ "$BLOG_DOMAINNAME" != "localhost" ]]
    then docker pull $1
    fi
  fi
}

########################################
## Docker Image Config

version="`git rev-parse HEAD | head -c 8`"
server_image="${project}_server:$version"
proxy_image="${project}_proxy:$version"
ipfs_image="ipfs/go-ipfs"

pull_if_unavailable "$server_image"
pull_if_unavailable "$proxy_image"

########################################
## Deploy according to configuration

echo "Deploying $server_image & $proxy_image to $BLOG_DOMAINNAME"

mkdir -p /tmp/$project
mkdir -p `pwd`/../media
cat - > /tmp/$project/docker-compose.yml <<EOF
version: '3.4'

volumes:
  certs:
  content:
  ipfs:

services:
  proxy:
    image: $proxy_image
    environment:
      DOMAINNAME: $BLOG_DOMAINNAME
      EMAIL: $BLOG_EMAIL
      SERVER_URL: http://server:$server_port
      IPFS_URL: http://ipfs:$ipfs_port
      MODE: prod
    logging:
      driver: "json-file"
      options:
          max-file: 10
          max-size: 10m
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - certs:/etc/letsencrypt

  ipfs:
    image: $ipfs_image
    volumes:
      - ipfs:/data/ipfs
      - `pwd`/../media:/media

  server:
    image: $server_image
    environment:
      NODE_ENV: production
      BLOG_CONTENT_BRANCH: $BLOG_CONTENT_BRANCH
      BLOG_CONTENT_DIR: $BLOG_CONTENT_DIR
      BLOG_CONTENT_REPO: $BLOG_CONTENT_REPO
      BLOG_CONTENT_URL: $BLOG_CONTENT_URL
      PORT: $server_port
    logging:
      driver: "json-file"
      options:
          max-file: 10
          max-size: 10m
    volumes:
      - content:/blog-content

EOF

docker stack deploy -c /tmp/$project/docker-compose.yml $project

echo -n "Waiting for the $project stack to wake up."
while [[ "`docker container ls | grep $project | wc -l | tr -d ' '`" != "$number_of_services" ]]
do echo -n "." && sleep 2
done
echo " Good Morning!"
