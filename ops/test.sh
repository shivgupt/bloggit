#!/bin/bash
set -e

curl="curl --insecure "
host="http://localhost:3000"

echo
echo "$host/api/config should connect to the server"
$curl "$host/api/config"
echo
if [[ "$($curl --silent "$host/api/config")" == *"contentUrl"* ]]
then echo "Looks good"
else echo "Looks not good" && exit 1
fi

echo
echo "$host should display html"
if [[ "$($curl --silent "$host" | tr '[:upper:]' '[:lower:]')" == "<!doctype html>"* ]]
then echo "Looks good"
else echo "Looks not good" && exit 1
fi
