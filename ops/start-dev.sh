#!/usr/bin/env bash
set -e

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

# Turn on swarm mode if it's not already on
docker swarm init || true

####################
# External Env Vars

BLOG_CONTENT_BRANCH="${BLOG_CONTENT_BRANCH:-master}"
BLOG_CONTENT_DIR="${BLOG_CONTENT_DIR:-}"
BLOG_CONTENT_REPO="${BLOG_CONTENT_REPO:-https://gitlab.com/bohendo/blog-content.git}"
BLOG_CONTENT_URL="${BLOG_CONTENT_URL:-https://gitlab.com/bohendo/blog-content/raw}"

####################
# Internal Config
# config & hard-coded stuff you might want to change

number_of_services=4 # NOTE: Gotta update this manually when adding/removing services :(

port=3000
server_port=8080
ui_port=3000
ipfs_port=8080

# docker images
builder_image="${project}_builder"
ui_image="$builder_image"
server_image="${project}_server"
proxy_image="${project}_proxy"
ipfs_image="ipfs/go-ipfs:latest"

####################
# Deploy according to above configuration

# Deploy with an attachable network so tests & the daicard can connect to individual components
if [[ -z "`docker network ls -f name=$project | grep -w $project`" ]]
then
  id="`docker network create --attachable --driver overlay $project`"
  echo "Created ATTACHABLE network with id $id"
fi

mkdir -p /tmp/$project
mkdir -p `pwd`/../blog-content/media
cat - > /tmp/$project/docker-compose.yml <<EOF
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
    image: $proxy_image
    environment:
      DOMAINNAME: localhost
      MODE: dev
      SERVER_URL: http://server:$server_port
      UI_URL: http://ui:$ui_port
      IPFS_URL: http://ipfs:$ipfs_port
    networks:
      - $project
    ports:
      - "$port:80"
    volumes:
      - certs:/etc/letsencrypt

  ui:
    image: $ui_image
    entrypoint: npm start
    environment:
      NODE_ENV: development
    networks:
      - $project
    volumes:
      - `pwd`:/root
    working_dir: /root/modules/client

  ipfs:
    image: $ipfs_image
    networks:
      - $project
    volumes:
      - ipfs:/data/ipfs
      - `pwd`/../blog-content/media:/media
    ports:
      - 5001:5001

  server:
    image: $server_image
    environment:
      NODE_ENV: development
      BLOG_CONTENT_BRANCH: $BLOG_CONTENT_BRANCH
      BLOG_CONTENT_DIR: $BLOG_CONTENT_DIR
      BLOG_CONTENT_REPO: $BLOG_CONTENT_REPO
      BLOG_CONTENT_URL: $BLOG_CONTENT_URL
      PORT: $server_port
    networks:
      - $project
    ports:
      - "$server_port:$server_port"
    volumes:
      - `pwd`:/root
      - content:/blog-content
    working_dir: /root/modules/server

EOF

docker stack deploy -c /tmp/$project/docker-compose.yml $project
rm -rf /tmp/$project

echo -n "Waiting for the $project stack to wake up."
while [[ "`docker container ls | grep $project | wc -l | tr -d ' '`" != "$number_of_services" ]]
do echo -n "." && sleep 2
done
echo " Good Morning!"
