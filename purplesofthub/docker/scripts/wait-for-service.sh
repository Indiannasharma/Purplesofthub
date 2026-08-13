#!/usr/bin/env sh
set -eu

host="${1:-}"
port="${2:-}"
name="${3:-service}"
timeout="${4:-60}"

if [ -z "$host" ] || [ -z "$port" ]; then
  echo "usage: wait-for-service.sh <host> <port> [name] [timeout]"
  exit 64
fi

echo "Waiting for $name at $host:$port ..."

start="$(date +%s)"
while true; do
  if nc -z "$host" "$port" >/dev/null 2>&1; then
    echo "$name is ready"
    exit 0
  fi

  now="$(date +%s)"
  elapsed="$((now - start))"
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "Timed out waiting for $name"
    exit 1
  fi

  sleep 2
done
