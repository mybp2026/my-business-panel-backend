import { createQueries } from '@crane-technologies/database';

export const posQueryDefs = {
  sales: {
    createSale: `
      INSERT INTO pos_schema.sale ( branch_id, tenant_customer_id, sale_condition, sale_date, currency_id, subtotal_amount, tax_amount, total_amount, is_completed, has_electronic_invoice, seller_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING sale_id
    `,
    getSalesByBranch: `
      SELECT s.sale_id, s.sale_date, s.total_amount, s.subtotal_amount, s.tax_amount, s.is_completed, b.branch_id, b.branch_name, c.currency_code, c.symbol FROM pos_schema.sale s
      INNER JOIN general_schema.branch b USING(branch_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      WHERE s.branch_id = $1
    `,
    getSaleInfo: `
      SELECT * FROM pos_schema.sale s
      INNER JOIN general_schema.branch b USING(branch_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant_customer t USING(tenant_customer_id)
    `, //Pongan aqui cualquier info que requieran de la venta
    getConditions: `
      SELECT * FROM pos_schema.sale_condition
    `,
  },

  saleItems: {
    getItems: `
      SELECT pv.variant_name, pv.sku, si.sale_item_id, si.quantity, si.unit_price, si.total_price FROM pos_schema.sale_item si
      INNER JOIN general_schema.product_variant pv
        ON pv.tenant_id = si.tenant_id AND pv.product_variant_id = si.product_variant_id
      WHERE si.sale_id = $1
    `, // ? add pagination
    getItemById: 'SELECT * FROM pos_schema.sale_item WHERE sale_item_id = $1',
    delete:
      'DELETE FROM pos_schema.sale_item WHERE sale_item_id = $1 RETURNING sale_item_id',
  },

  dInvoice: {
    create: `
      INSERT INTO pos_schema.digital_sale_invoice (tenant_customer_id, currency_id, subtotal_amount, tax_amount, total_amount, invoiced_at, updated_at, sale_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    getBills: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, i.subtotal_amount, i.total_amount, i.invoiced_at FROM pos_schema.digital_sale_invoice i
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t ON t.tenant_id = tc.tenant_id
      WHERE t.tenant_id = $1
    `,
    getCustomerDInvoices: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, i.subtotal_amount, i.total_amount, i.invoiced_at FROM pos_schema.digital_sale_invoice i
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t ON t.tenant_id = tc.tenant_id
      WHERE t.tenant_id = $1 AND tc.document_number = $2
    `,
    getDInvoiceById: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, i.subtotal_amount, i.total_amount, i.invoiced_at FROM pos_schema.digital_sale_invoice i
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t ON t.tenant_id = tc.tenant_id
      WHERE i.digital_sale_invoice_id = $1
    `,
    deleteDInvoice:
      'DELETE FROM pos_schema.digital_sale_invoice WHERE digital_sale_invoice_id = $1 RETURNING digital_sale_invoice_id',
    updateAmount: `
    UPDATE pos_schema.digital_sale_invoice SET total_amount = total_amount - $1 WHERE digital_sale_invoice_id = $2
    `,
  },

  returns: {
    newTransaction: `
      INSERT INTO pos_schema.return_transaction (digital_sale_invoice_id, tenant_customer_id, total_refund_amount, refund_method, return_status_id, return_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING return_transaction_id
    `,
    find: `
      SELECT
          return_transaction_id,
          digital_sale_invoice_id,
          tenant_customer_id,
          total_refund_amount,
          refund_method,
          return_status_id,
          return_date
      FROM
          pos_schema.return_transaction
      WHERE
          ($1::uuid IS NULL OR digital_sale_invoice_id = $1)
          AND ($2::uuid IS NULL OR tenant_customer_id = $2)
          AND ($3::int IS NULL OR return_status_id = $3)
          AND ($4::int IS NULL OR refund_method = $4)
          AND ($5::timestamp IS NULL OR return_date >= $5)
          AND ($6::timestamp IS NULL OR return_date <= $6)
      ORDER BY return_date DESC`,
  },

  cashRegister: {
    all: `
    SELECT * FROM pos_schema.cash_register
    `,
    byId: `
    SELECT * FROM pos_schema.cash_register WHERE cash_register_id = $1 LIMIT 1
    `,
    byBranch: `
    SELECT * FROM pos_schema.cash_register WHERE branch_id = $1
    `,
    create: `
    INSERT INTO pos_schema.cash_register (branch_id, register_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *
    `,
    delete: `
    DELETE FROM pos_schema.cash_register WHERE cash_register_id = $1 RETURNING *
    `,
    update: `
    UPDATE pos_schema.cash_register SET branch_id = COALESCE($2, branch_id), register_name = COALESCE($3, register_name), is_active = COALESCE($4, is_active), updated_at = NOW() WHERE cash_register_id = $1 RETURNING *
    `,
    startSession: `
    INSERT INTO pos_schema.cash_register_session (cash_register_id, opened_at, opening_amount, user_id, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *
    `,
    getSessionById: `
    SELECT * FROM pos_schema.cash_register_session WHERE cash_register_session_id = $1 LIMIT 1
    `,
    getSessionsByCashRegister: `
    SELECT * FROM pos_schema.cash_register_session WHERE cash_register_id = $1 ORDER BY opened_at DESC
    `,
    closeSession: `
    UPDATE pos_schema.cash_register_session SET closed_at = $1, closing_amount = $2, is_active = false WHERE cash_register_session_id = $3 RETURNING *
    `,
    registerTransaction: `
    INSERT INTO cash_register_sale_transaction (cash_register_session_id, amount, transaction_time, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *
    `,
  },

  promotions: {
    getPromos: `
      SELECT p.promotion_name, p.promotion_code, c.segment_name, p.promotion_start_date, p.promotion_end_date, pt.type_name, p.is_active FROM pos_schema.promotion p
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_schema.promotion_type pt USING(promotion_type_id)
      WHERE p.tenant_id = $1
    `,
    getPromoInfo: `
      SELECT p.promotion_name, p.promotion_code, c.segment_name, p.promotion_start_date, p.promotion_end_date, p.is_active FROM pos_schema.promotion p
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_schema.promotion_type pt USING(promotion_type_id)
      WHERE p.promotion_id = $1 LIMIT 1
    `,
    insertPromo: `
      INSERT INTO pos_schema.promotion (tenant_id, promotion_name, promotion_code, promotion_description, promotion_type_id, customer_segment_id, promotion_start_date, promotion_end_date, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING promotion_id
    `,
    deletePromo:
      'DELETE FROM pos_schema.promotion WHERE promotion_id = $1 RETURNING promotion_id',
    updatePromo: `
      UPDATE pos_schema.promotion
      SET tenant_id = COALESCE($2, tenant_id),
          promotion_name = COALESCE($3, promotion_name),
          promotion_code = COALESCE($4, promotion_code),
          promotion_description = COALESCE($5, promotion_description),
          promotion_type_id = COALESCE($6, promotion_type_id),
          customer_segment_id = COALESCE($7, customer_segment_id),
          promotion_start_date = COALESCE($8, promotion_start_date),
          promotion_end_date = COALESCE($9, promotion_end_date),
          is_active = COALESCE($10, is_active)
      WHERE promotion_id = $1
      RETURNING promotion_id
    `,
  },

  promotionTypes: {
    getPromoTypes: `
      SELECT * FROM pos_schema.promotion_type
    `,
  },

  loyaltyProgram: {
    create: `
      INSERT INTO pos_schema.loyalty_program (tenant_id, points_earned_per_currency_unit, points_redeemed_per_currency_unit, minimum_purchase_for_points, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `,
    all: `
      SELECT * FROM pos_schema.loyalty_program WHERE tenant_id = $1
    `,
    delete: `
      DELETE FROM pos_schema.loyalty_program WHERE loyalty_program_id = $1 RETURNING loyalty_program_id
    `,
    byId: `
      SELECT * FROM pos_schema.loyalty_program WHERE loyalty_program_id = $1 LIMIT 1
    `,
    update: `
      UPDATE pos_schema.loyalty_program
      SET
        points_per_dollar = COALESCE($2, points_per_dollar),
        points_per_currency_unit = COALESCE($3, points_per_currency_unit),
        minimum_purchase_for_points = COALESCE($4, minimum_purchase_for_points)
      WHERE loyalty_program_id = $1
      RETURNING loyalty_program_id
    `,
  },

  eInvoice: {
    // Atomic upsert: increments the per-branch counter and returns the claimed value.
    // The row-level lock from INSERT ... ON CONFLICT DO UPDATE prevents race conditions.
    // $1 = branch_id (UUID)
    getNextInvoiceSequence: `
      INSERT INTO pos_schema.branch_einvoice_seq (branch_id, next_seq)
      VALUES ($1, 1)
      ON CONFLICT (branch_id) DO UPDATE
        SET next_seq = branch_einvoice_seq.next_seq + 1
      RETURNING next_seq
    `,
    // #1: status_id=1 (pending). next_check_at=NOW()+30s activa el cron como baseline.
    create: `
      INSERT INTO pos_schema.electronic_sale_invoice
      (sale_id, key_number, consecutive_number, xml_signed, status_id, check_attempts, next_check_at, created_at)
      VALUES ($1, $2, $3, $4, 1, 0, NOW() + INTERVAL '30 seconds', NOW())
      RETURNING electronic_sale_invoice_id
    `,
    // Cron: facturas pendientes cuyo next_check_at ya venció (máx. 100 por tick)
    getPendingInvoices: `
      SELECT electronic_sale_invoice_id, key_number, check_attempts
      FROM pos_schema.electronic_sale_invoice
      WHERE status_id = 1
        AND check_attempts < 20
        AND next_check_at <= NOW()
      ORDER BY next_check_at
      LIMIT 100
    `,
    // $1 = electronic_sale_invoice_id, $2 = check_attempts, $3 = next_check_at
    updateCheckAttempt: `
      UPDATE pos_schema.electronic_sale_invoice
      SET check_attempts = $2,
          next_check_at  = $3,
          updated_at     = NOW()
      WHERE electronic_sale_invoice_id = $1
    `,
    // #5: persiste los ítems en electronic_sale_invoice_items
    insertItem: `
      INSERT INTO pos_schema.electronic_sale_invoice_items
      (electronic_sale_invoice_id, tenant_id, product_variant_id, sale_item_id, line_number, discount_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING electronic_sale_invoice_item_id
    `,
    // #6: verifica que exista una digital_sale_invoice antes de generar la electrónica
    getDInvoice: `
      SELECT digital_sale_invoice_id
      FROM pos_schema.digital_sale_invoice
      WHERE sale_id = $1
      LIMIT 1
    `,
    markSaleAsEInvoiced: `
      UPDATE pos_schema.sale SET has_electronic_invoice = true WHERE sale_id = $1
    `,
    // $1 = electronic_sale_invoice_id, $2 = hacienda_response_xml (TEXT), $3 = status_id
    // status_id: 1=pendiente, 2=aceptada, 3=rechazada
    updateHaciendaResponse: `
      UPDATE pos_schema.electronic_sale_invoice
      SET hacienda_response_xml  = $2,
          hacienda_response_date = NOW(),
          status_id              = $3,
          updated_at             = NOW()
      WHERE electronic_sale_invoice_id = $1
    `,
    getEInvoicesByBranch: `
      SELECT * FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      WHERE s.branch_id = $1;
    `,
    getEInvoiceForSale: `
      SELECT * FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      WHERE e.sale_id = $1;
    `,
    getEInvoiceById: `
      SELECT * FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      WHERE e.electronic_sale_invoice_id = $1; 
    `,
    getSaleForEInvoice: `
      SELECT
        s.sale_id,
        s.branch_id,
        s.sale_condition,
        s.is_completed,
        s.has_electronic_invoice,
        EXISTS (
          SELECT 1 FROM pos_schema.electronic_sale_invoice e WHERE e.sale_id = s.sale_id
        ) AS already_invoiced,
        -- #3: extraer solo los 10 dígitos numéricos (posición 11-20) y castear a bigint
        COALESCE(
          (SELECT MAX(SUBSTRING(seq.consecutive_number FROM 11 FOR 10)::bigint)
          FROM pos_schema.electronic_sale_invoice seq
          INNER JOIN pos_schema.sale s2 ON s2.sale_id = seq.sale_id
          WHERE s2.branch_id = s.branch_id), 0
        )::bigint AS invoice_sequence,
        cur.currency_code,
        1.00000::numeric AS exchange_rate,
        s.subtotal_amount,
        s.tax_amount,
        s.total_amount,
        pm.code AS payment_method_code,
        t.econ_activity   AS activity_code,
        t.tenant_name     AS issuer_name,
        t.identification  AS issuer_identification,
        '02'::VARCHAR(2)  AS issuer_identification_type,
        t.contact_email   AS issuer_email,
        COALESCE(loc.provincia,   '1')  AS provincia,
        COALESCE(loc.canton,      '01') AS canton,
        COALESCE(loc.distrito,    '01') AS distrito,
        COALESCE(loc.otras_senas, '')   AS otras_senas,
        (tc.first_name || ' ' || tc.last_name) AS receiver_name,
        tc.document_number                     AS receiver_identification,
        COALESCE(dt.ident_code, '01')          AS receiver_identification_type,
        tc.email                               AS receiver_email,
        -- TODO: Discriminar servicios/mercancías cuando se agregue is_service a product
        0.00::numeric        AS total_serv_gravados,
        0.00::numeric        AS total_serv_exentos,
        0.00::numeric        AS total_serv_exonerados,
        s.subtotal_amount    AS total_mercancias_gravadas,
        0.00::numeric        AS total_mercancias_exentas,
        0.00::numeric        AS total_mercancias_exoneradas,
        COALESCE(
          (SELECT COUNT(*)::integer FROM pos_schema.cash_register cr2
           WHERE cr2.branch_id = b.branch_id AND cr2.created_at <= cr.created_at),
          1
        ) AS terminal_number,
        1 AS pos_number
      FROM pos_schema.sale s
      JOIN general_schema.branch b            ON b.branch_id = s.branch_id
      JOIN general_schema.tenant t            ON t.tenant_id = b.tenant_id
      LEFT JOIN general_schema.tenant_location loc ON loc.tenant_id = t.tenant_id
      JOIN general_schema.tenant_customer tc  ON tc.tenant_customer_id = s.tenant_customer_id
      LEFT JOIN general_schema.document_type dt ON dt.document_type_id = tc.document_type_id
      JOIN general_schema.currency cur        ON cur.currency_id = s.currency_id
      LEFT JOIN LATERAL (
        SELECT
          CASE pm2.name
            WHEN 'cash'        THEN '01'
            WHEN 'debit_card'  THEN '02'
            WHEN 'credit_card' THEN '02'
            WHEN 'credit'      THEN '04'
            ELSE '99'
          END AS code
        FROM pos_schema.customer_payment cp2
        JOIN general_schema.payment_method pm2 ON pm2.payment_method_id = cp2.payment_method_id
        WHERE cp2.sale_id = s.sale_id
        LIMIT 1
      ) pm ON true
      LEFT JOIN pos_schema.cash_register_sale crs ON crs.sale_id = s.sale_id
      LEFT JOIN pos_schema.cash_register_session crss ON crss.cash_register_session_id = crs.cash_register_session_id
      LEFT JOIN pos_schema.cash_register cr ON cr.cash_register_id = crss.cash_register_id
      WHERE s.sale_id = $1
    `,

    getSaleItemsForEInvoice: `
      SELECT
      ROW_NUMBER() OVER (ORDER BY si.created_at)::integer AS line_number,
      si.sale_item_id,
      si.product_variant_id,
      pv.tenant_id,
      pv.cabys_code,
      pv.variant_name::varchar(200) AS description,
      si.quantity::numeric(16,3),
      'Unid'::varchar(20) AS unit_of_measure,
      si.unit_price::numeric(18,5),
      si.total_price::numeric(18,5) AS total_amount,
      0.00::numeric(18,5) AS discount_amount,
      si.total_price::numeric(18,5) AS subtotal,
      CASE WHEN tr.tax_rate_id IS NOT NULL THEN '01' END::varchar(2) AS tax_code,
      COALESCE(
        tr.rate_code,
        CASE
          WHEN COALESCE(tr.rate_percentage, 0) = 0      THEN '01'
          WHEN COALESCE(tr.rate_percentage, 0) <= 0.015 THEN '05'
          WHEN COALESCE(tr.rate_percentage, 0) <= 0.025 THEN '06'
          WHEN COALESCE(tr.rate_percentage, 0) <= 0.05  THEN '07'
          WHEN COALESCE(tr.rate_percentage, 0) <= 0.14  THEN '08'
          ELSE '01'
        END
      )::varchar(2) AS tax_rate_code,
      (COALESCE(tr.rate_percentage, 0) * 100)::numeric(5,2) AS tax_rate,
      (si.total_price * COALESCE(tr.rate_percentage, 0))::numeric(18,5) AS tax_amount,
      (si.total_price * (1 + COALESCE(tr.rate_percentage, 0)))::numeric(18,5) AS total_line_amount
      FROM pos_schema.sale_item si
      JOIN general_schema.product_variant pv
        ON pv.tenant_id = si.tenant_id AND pv.product_variant_id = si.product_variant_id
      LEFT JOIN general_schema.product p     ON p.cabys_code = pv.cabys_code
      LEFT JOIN general_schema.tax_rate tr   ON tr.tax_rate_id = p.tax_rate_id
      WHERE si.sale_id = $1
      ORDER BY si.created_at;
    `,
  },
};

export const posQueries = createQueries(posQueryDefs);

export const bulkItems = [
  'sale_id',
  'tenant_id',
  'product_id',
  'quantity',
  'unit_price',
  'total_price',
];

export const bulkReturns = [
  'return_transaction_id',
  'quantity',
  'unit_price',
  'total_price',
  'sale_item_id',
];
