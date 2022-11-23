#!/usr/bin/env bash
set -e

server="$SERVER_IP"
user="${SERVER_USER:-admin}"
key="$SSH_KEY:-$HOME/.ssh/id_ed25519"

if [[ -z "$server" ]]
then echo "Please set the SERVER_UP env var to the target server's ip" && exit 1
fi

if [[ ! -f "$key" ]]
then echo "Please set the SSH_KEY env var to the path to your ssh key" && exit 1
fi

git push ssh://$user@$server/home/$user/bloggit prod

ssh $user@$sever -i "$key" <<EOF
cd bloggit
git reset --hard prod
make restart
EOF
