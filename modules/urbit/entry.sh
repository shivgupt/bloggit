#!/nix/store/fa138pjfv8b4sg5l80ls55ynz9g4s3p9-bash-interactive-5.1-p16/bin/bash

DATADIR="${DATADIR:-/root/data}"
PORT="${PORT:-80}"
URBIT_NAME="${URBIT_NAME:-fakezod}"

echo "Running urbit in env"
echo "- DATADIR: $DATADIR"
echo "- PORT: $PORT"
echo "- URBIT_NAME: $URBIT_NAME"
echo

cd "$DATADIR" || exit 1

if [[ "$URBIT_NAME" == "fakezod" ]]
then isFake="--fake"
else isFake=""
fi

echo start-urbit --port="$PORT" "$isFake" "$URBIT_NAME"
exec start-urbit --port="$PORT" "$isFake" "$URBIT_NAME"
