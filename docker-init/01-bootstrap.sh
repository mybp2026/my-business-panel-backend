#!/bin/bash
set -e

echo ">>> Running database bootstrap..."
cd /db-scripts
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f bootstrap.sql
echo ">>> Bootstrap completed successfully!"

echo ">>> Running migrations..."
for context in general inventory purchase pos hr accounting; do
  dir="/db-scripts/migrations/$context"
  if [ -d "$dir" ]; then
    for f in $(ls "$dir"/*.sql 2>/dev/null | sort -V); do
      echo "  [+] Applying: $f"
      psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
    done
  fi
done
echo ">>> Migrations completed successfully!"
