#!/bin/bash
set -e

echo ">>> Running database bootstrap..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /db-scripts/backup/database_backup.sql
echo ">>> Bootstrap completed successfully!"
