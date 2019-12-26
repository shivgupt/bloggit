#!/usr/bin/env bash
set -e

project="blog"

# Turn on swarm mode if it's not already on
docker swarm init 2> /dev/null || true

####################
# Internal Config
# config & hard-coded stuff you might want to change

number_of_services=3 # NOTE: Gotta update this manually when adding/removing services :(

port=3000
server_port=8080

# docker images
builder_image="${project}_builder"
ui_image="$builder_image"
server_image="${project}_server"
proxy_image="${project}_proxy"

####################
# Deploy according to above configuration

# Deploy with an attachable network so tests & the daicard can connect to individual components
if [[ -z "`docker network ls -f name=$project | grep -w $project`" ]]
then
  id="`docker network create --attachable --driver overlay $project`"
  echo "Created ATTACHABLE network with id $id"
fi

mkdir -p /tmp/$project
cat - > /tmp/$project/docker-compose.yml <<EOF
version: '3.4'

networks:
  $project:
    external: true

volumes:
  certs:

services:
  proxy:
    image: $proxy_image
    environment:
      DOMAINNAME: localhost
      MODE: dev
      SERVER_URL: http://server:$server_port
      UI_URL: http://ui:3000
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

  server:
    image: $server_image
    environment:
      NODE_ENV: development
    networks:
      - $project
    ports:
      - "$server_port:$server_port"
    volumes:
      - `pwd`:/root
    working_dir: /root/modules/server

EOF

docker stack deploy -c /tmp/$project/docker-compose.yml $project
rm -rf /tmp/$project

echo -n "Waiting for the $project stack to wake up."
while [[ "`docker container ls | grep $project | wc -l | tr -d ' '`" != "$number_of_services" ]]
do echo -n "." && sleep 2
done
echo " Good Morning!"

