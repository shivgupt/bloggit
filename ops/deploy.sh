#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )
user="${SERVER_USER:-admin}"
ipFile="$root/ops/prod/PROD_SERVER_IP_ADDRESS"
commit="$(git rev-parse HEAD | head -c 8)"
branch="$(git branch --show-current)"

if [[ ! -f "$ipFile" ]]
then echo "Please provide a valid ip address in a file at: $ipFile" && exit 1
fi

ipAddress="$(cat "$ipFile")"
remote="ssh://$user@$ipAddress/home/$user/bloggit"

echo "Preparing to deploy commit $commit to server at $ipAddress"
sleep 2 # last chance to ctrl-c

echo
echo "Pushing branch $branch to server at $ipAddress"
git push $remote $branch

echo
echo "Restarting bloggit"
ssh $user@$ipAddress <<EOF
cd bloggit
git reset $commit
make all
make restart
EOF

echo
echo "Done!"
