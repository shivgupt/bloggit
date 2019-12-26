#!/bin/bash
set -e

echo "Running tests..."
curl="curl --insecure --silent "

echo "https://localhost should display html"
$curl "https://localhost"
echo
if [[ "`$curl "https://localhost"`" == "<!doctype html>"* ]]
then echo "Looks good"
else echo "Looks not good" && exit 1
fi

echo
echo "https://localhost/api/hello should connect to the server"
$curl "https://localhost/api/hello"
echo
if [[ "`$curl "https://localhost/api/hello"`" == "Hello"* ]]
then echo "Looks good"
else echo "Looks not good" && exit 1
fi

