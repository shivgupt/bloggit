#!/bin/bash

DATADIR="${DATADIR:-/root/data}"
PORT="${PORT:-80}"
URBIT_NAME="${URBIT_NAME:-dozzod-dozzod}"

echo "Running urbit in env"
echo "- DATADIR: $DATADIR"
echo "- PORT: $PORT"
echo "- URBIT_NAME: $URBIT_NAME"

cd "$DATADIR" || exit 1
urbit --http-port="$PORT" "$URBIT_NAME"
