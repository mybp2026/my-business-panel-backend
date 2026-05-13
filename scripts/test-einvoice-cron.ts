/* eslint-disable no-console */
/**
 * Smoke test for the e-invoice cron reconciliation.
 *
 * Prereqs:
 *   - .env.development with DB_CONNECTION and Hacienda mock enabled
 *     (HACIENDA_MOCK=true) to skip real Hacienda calls.
 *   - At least one row in pos_schema.electronic_sale_invoice. Easiest path:
 *     run a normal sale → invoice flow once, copy its electronic_sale_invoice_id.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/test-einvoice-cron.ts <electronic_sale_invoice_id>
 *
 * The script:
 *   1) Resets the chosen invoice to status_id=1, check_attempts=0,
 *      next_check_at=NOW() so the cron picks it on the next tick.
 *   2) Boots a minimal NestApplicationContext and runs `checkPendingInvoices`
 *      once.
 *   3) Reads back the row and prints status, attempts and next_check_at.
 *
 * Expected outcomes with HACIENDA_MOCK=true (mock returns "aceptado"):
 *   - status_id transitions from 1 → 2.
 *   - check_attempts stays at 0 (terminal state reached on first check).
 *   - next_check_at is NULL.
 */

import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from '../src/app/app.module';
import { EInvoiceStatusCron } from '../src/contexts/pos/modules/e-invoice/cron/einvoice-status.cron';
import { DATABASE } from '../src/contexts/general/modules/db/db.provider';

dotenv.config({ path: '.env.development' });

async function main() {
  const invoiceId = process.argv[2];
  if (!invoiceId) {
    console.error(
      'Usage: ts-node scripts/test-einvoice-cron.ts <electronic_sale_invoice_id>',
    );
    process.exit(1);
  }

  console.log(`[smoke] resetting invoice ${invoiceId} to pending...`);
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const db: any = app.get(DATABASE);
  const cron = app.get(EInvoiceStatusCron);

  const reset = await db.query(
    `UPDATE pos_schema.electronic_sale_invoice
       SET status_id = 1,
           check_attempts = 0,
           next_check_at = NOW(),
           hacienda_response_xml = NULL,
           hacienda_response_date = NULL,
           updated_at = NOW()
     WHERE electronic_sale_invoice_id = $1
     RETURNING electronic_sale_invoice_id, key_number, status_id, check_attempts, next_check_at`,
    [invoiceId],
  );

  if (!reset.rows.length) {
    console.error(`[smoke] no row for ${invoiceId}, aborting.`);
    await app.close();
    process.exit(2);
  }
  console.log('[smoke] before tick:', reset.rows[0]);

  console.log('[smoke] running cron tick once...');
  await cron.checkPendingInvoices();

  const after = await db.query(
    `SELECT electronic_sale_invoice_id, key_number, status_id, check_attempts,
            next_check_at, hacienda_response_date
       FROM pos_schema.electronic_sale_invoice
      WHERE electronic_sale_invoice_id = $1`,
    [invoiceId],
  );
  console.log('[smoke] after tick: ', after.rows[0]);

  await app.close();
}

main().catch((err) => {
  console.error('[smoke] failed:', err);
  process.exit(1);
});
