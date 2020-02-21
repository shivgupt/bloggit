#!/bin/bash
set -e

curl="curl --insecure "
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
project="`cat $dir/../package.json | jq .name | tr -d '"'`"

if [[ -n "`docker service ls | grep ${project}_ui`" ]]
then host="http://localhost:3000"
else host="https://localhost"
fi

echo
echo "$host/api/config should connect to the server"
$curl "$host/api/config"
echo
if [[ "`$curl --silent "$host/api/config"`" == *"contentUrl"* ]]
then echo "Looks good"
else echo "Looks not good" && exit 1
fi

echo
echo "$host should display html"
if [[ "`$curl --silent "$host" | tr '[:upper:]' '[:lower:]'`" == "<!doctype html>"* ]]
then echo "Looks good"
else echo "Looks not good" && exit 1
fi

