#!/bin/bash
set -e

echo ">>> Running database bootstrap..."
cd /db-scripts
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f bootstrap.sql
echo ">>> Bootstrap completed successfully!"

# Only run migrations that are NOT already incorporated in the base schemas.
# Migrations 001-016 are already reflected in the schema files.
# Add new migration files here as they are created.
echo ">>> Running migrations..."
NEW_MIGRATIONS=(
  "migrations/pos/014-add-sale-traceability.sql"
  "migrations/general/017-tenant-hacienda-config.sql"
)

for f in "${NEW_MIGRATIONS[@]}"; do
  echo "  [+] Applying: $f"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done
echo ">>> Migrations completed successfully!"
