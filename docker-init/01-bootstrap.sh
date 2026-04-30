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
  "migrations/hr/001-make-contract-turn-id-nullable.sql"
  "migrations/hr/002-add-identification-type-to-employee.sql"
  "migrations/hr/003-ensure-contract-turn-id-nullable.sql"
  "migrations/general/029-add-bank-transfer-payment-method.sql"
  "migrations/general/030-create-special-code.sql"
  "migrations/general/028-ensure-product-variant-cost-price.sql"
  "migrations/pos/017-sale-customer-nullable.sql"
  "migrations/pos/018-customer-payment-customer-nullable.sql"
  "migrations/purchase/007-apply-inventory-on-delivery.sql"
)

for f in "${NEW_MIGRATIONS[@]}"; do
  echo "  [+] Applying: $f"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done
echo ">>> Migrations completed successfully!"
