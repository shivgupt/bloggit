#!/bin/bash
set -e

curl="curl --insecure "
host="https://127.0.0.1"

echo "$host should display html"
$curl "$host"
echo
if [[ "`$curl --silent "$host"`" == "<!doctype html>"* ]]
then echo "Looks good"
else echo "Looks not good" && exit 1
fi

echo
echo "$host/api/hello should connect to the server"
$curl "$host/api/hello"
echo
if [[ "`$curl --silent "$host/api/hello"`" == "Hello"* ]]
then echo "Looks good"
else echo "Looks not good" && exit 1
fi

