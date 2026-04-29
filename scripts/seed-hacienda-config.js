/**
 * One-time script: upserts tenant_hacienda_config for a given tenant.
 * Uses the same AES-256-GCM encryption as the backend service.
 *
 * Usage:
 *   node scripts/seed-hacienda-config.js
 */

'use strict';

require('dotenv').config();

const { randomBytes, createCipheriv, createDecipheriv } = require('crypto');
const { Pool } = require('pg');

// ── Config ────────────────────────────────────────────────────────────────────

const TENANT_ID       = 'a57174b6-c757-4bb9-bae2-ea4e7ffa6088';
const USERNAME        = 'nite-3140001694@stag.comprobanteselectronicos.go.cr';
const PASSWORD        = '2J$!%Lkf%H9%sxRHTyRY';
const CLIENT_ID       = 'api-stag';
const P12_PASSWORD    = '050405';
const P12_BASE64      = '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';

// ── AES-256-GCM helpers (same as backend crypto module) ───────────────────────

const ALGORITHM  = 'aes-256-gcm';
const IV_LENGTH  = 12;
const TAG_LENGTH = 16;

function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) throw new Error('ENCRYPTION_KEY not set');
  const buf = Buffer.from(hex, 'hex');
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must be 64 hex chars');
  return buf;
}

function encrypt(plaintext) {
  const key = getKey();
  const iv  = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString('base64');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const pool = new Pool({
    connectionString: process.env.DB_CONNECTION,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const enc_username    = encrypt(USERNAME);
    const enc_password    = encrypt(PASSWORD);
    const enc_p12_base64  = encrypt(P12_BASE64);
    const enc_p12_password = encrypt(P12_PASSWORD);

    const { rows } = await pool.query(
      `INSERT INTO general_schema.tenant_hacienda_config
         (tenant_id, hacienda_username, hacienda_password, hacienda_client_id, p12_base64, p12_password, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       ON CONFLICT (tenant_id) DO UPDATE SET
         hacienda_username  = EXCLUDED.hacienda_username,
         hacienda_password  = EXCLUDED.hacienda_password,
         hacienda_client_id = EXCLUDED.hacienda_client_id,
         p12_base64         = EXCLUDED.p12_base64,
         p12_password       = EXCLUDED.p12_password,
         is_active          = TRUE,
         updated_at         = NOW()
       RETURNING tenant_hacienda_config_id`,
      [TENANT_ID, enc_username, enc_password, CLIENT_ID, enc_p12_base64, enc_p12_password],
    );

    console.log('✓ Hacienda config saved. ID:', rows[0].tenant_hacienda_config_id);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});
