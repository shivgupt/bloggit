#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )
user="${SERVER_USER:-admin}"
ipFile="$root/ops/prod/PROD_SERVER_IP_ADDRESS"
commit="$(git rev-parse HEAD | head -c 8)"

if [[ ! -f "$ipFile" ]]
then echo "Please provide a valid ip address in a file at: $ipFile" && exit 1
fi

ipAddress="$(cat "$ipFile")"
remote="ssh://$user@$ipAddress/home/$user/bloggit"

echo "Preparing to deploy commit $commit to server at $ipAddress"
sleep 2

git push $remote $commit

ssh $user@$ipAddress <<EOF
cd bloggit
git reset --hard $commit
make reset-images
make all
make restart
EOF
