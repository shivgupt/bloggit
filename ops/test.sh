#!/bin/bash
set -e

curl="curl --insecure "

# if ui container exists then we're in dev mode
if [[ "$BLOG_PROD" == "true" ]]
then host="https://localhost"
else host="http://localhost:3000"
fi

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

