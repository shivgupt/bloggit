#!/bin/bash
set -e

echo "Running tests..."
curl --version

echo "https://localhost should display html"
out="`curl -ks "https://localhost"`"
if [[ "$out" == "<!doctype html>"* ]]
then echo "Looks good"
else echo "Looks not good: $out" && exit 1
fi

echo
echo "https://localhost/api/hello should connect to the server"
out="`curl -ks "https://localhost/api/hello"`"
if [[ "$out" == "Hello"* ]]
then echo "Looks good"
else echo "Looks not good: $out" && exit 1
fi

