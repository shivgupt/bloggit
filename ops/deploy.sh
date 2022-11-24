#!/usr/bin/env bash
set -e

server="$1"
user="${SERVER_USER:-admin}"

if [[ -z "$server" || -n "$2" ]]
then echo "Please provide the server ip as the first & only arg" && exit 1
fi

echo "Preparing to deploy prod branch at commit $(git rev-parse HEAD | head -c 8) to server at $server"
sleep 2

git push ssh://$user@$server/home/$user/bloggit prod

ssh $user@$server <<EOF
cd bloggit
git reset --hard prod
make reset-images
make all
make restart
EOF
