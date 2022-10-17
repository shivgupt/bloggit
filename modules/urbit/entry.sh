#!/bin/bash

DATADIR="${DATADIR:-/root/data}"
PORT="${PORT:-80}"
URBIT_NAME="${URBIT_NAME:-fakezod}"

echo "Running urbit in env"
echo "- DATADIR: $DATADIR"
echo "- PORT: $PORT"
echo "- URBIT_NAME: $URBIT_NAME"
echo "- urbit in path: $(which urbit)"
echo "- urbit executable: $(ls -l $(which urbit))"
echo

cd "$DATADIR" || exit 1
echo /bin/urbit --http-port="$PORT" "$URBIT_NAME"
exec /bin/urbit --http-port="$PORT" "$URBIT_NAME"
