#!/nix/store/fa138pjfv8b4sg5l80ls55ynz9g4s3p9-bash-interactive-5.1-p16/bin/bash

DATADIR="${DATADIR:-/root/data}"
PORT="${PORT:-8080}"
URBIT_NAME="${URBIT_NAME:-zod}"

echo "Running urbit in env"
echo "- DATADIR: $DATADIR"
echo "- PORT: $PORT"
echo "- URBIT_NAME: $URBIT_NAME"
echo

cd "$DATADIR" || exit 1

if [[ ! -d "$URBIT_NAME" ]]
then
  if [[ "$URBIT_NAME" == "zod" ]]
  then
    echo "Development urbit name detected, initializing $URBIT_NAME in fake mode"
    echo start-urbit --port="$PORT" --fake "$URBIT_NAME"
    exec start-urbit --port="$PORT" --fake "$URBIT_NAME"
  elif [[ -f *.key ]]
  then
    echo "Key file present for $URBIT_NAME, initializing & starting new urbit ship"
    echo start-urbit --port="$PORT" "$URBIT_NAME"
    exec start-urbit --port="$PORT" "$URBIT_NAME"
  else
    echo "No key file present in $DATADIR and no prior data, can't boot ship for $URBIT_NAME"
    sleep 99999
    exit 1
  fi
else
  echo "Data dir present for $URBIT_NAME, starting urbit normally"
  echo start-urbit --port="$PORT" "$URBIT_NAME"
  exec start-urbit --port="$PORT" "$URBIT_NAME"
fi
