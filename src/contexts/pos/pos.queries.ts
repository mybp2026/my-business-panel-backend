import { createQueries } from '@crane-technologies/database';

export const posQueryDefs = {
  sales: {
    createSale: `
      INSERT INTO pos_schema.sale ( branch_id, tenant_customer_id, sale_condition, sale_date, currency_id, subtotal_amount, tax_amount, total_amount, is_completed, has_electronic_invoice, seller_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING sale_id
    `,
    linkSaleToActiveSession: `
      INSERT INTO pos_schema.cash_register_sale (
        cash_register_session_id,
        sale_id,
        transaction_time
      )
      SELECT
        crs.cash_register_session_id,
        $2,
        COALESCE($3::timestamp, NOW())
      FROM pos_schema.cash_register_session crs
      INNER JOIN pos_schema.cash_register cr
        ON cr.cash_register_id = crs.cash_register_id
      WHERE cr.branch_id = $1
        AND crs.is_active = true
        AND ($4::uuid IS NULL OR cr.cash_register_id = $4)
      ORDER BY crs.opened_at DESC
      LIMIT 1
      ON CONFLICT (sale_id) DO NOTHING
      RETURNING cash_register_sale_id
    `,
    getSalesByBranch: `
      SELECT s.sale_id, s.sale_date, s.total_amount, s.subtotal_amount, s.tax_amount, s.is_completed, s.has_electronic_invoice, b.branch_id, b.branch_name, c.currency_code, c.symbol FROM pos_schema.sale s
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
      WHERE i.sale_id = $1
    `,
    getDInvoiceBySaleId: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, i.subtotal_amount, i.total_amount, i.invoiced_at FROM pos_schema.digital_sale_invoice i
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t ON t.tenant_id = tc.tenant_id
      WHERE i.sale_id = $1
    `,
    deleteDInvoice:
      'DELETE FROM pos_schema.digital_sale_invoice WHERE digital_sale_invoice_id = $1 RETURNING digital_sale_invoice_id',
    updateAmount: `
    UPDATE pos_schema.digital_sale_invoice SET total_amount = total_amount - $1 WHERE digital_sale_invoice_id = $2
    `,
  },

  returns: {
    newTransaction: `
      INSERT INTO pos_schema.return_transaction (digital_sale_invoice_id, electronic_sale_invoice_id, tenant_customer_id, total_refund_amount, refund_method, return_status_id, return_date)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamp, NOW()))
      RETURNING return_transaction_id, return_date
    `,
    find: `
      SELECT
          return_transaction_id,
          digital_sale_invoice_id,
          electronic_sale_invoice_id,
          tenant_customer_id,
          total_refund_amount,
          refund_method,
          return_status_id,
          return_date
      FROM
          pos_schema.return_transaction
      WHERE
          ($1::uuid IS NULL OR digital_sale_invoice_id = $1 OR electronic_sale_invoice_id = $1)
          AND ($2::uuid IS NULL OR tenant_customer_id = $2)
          AND ($3::int IS NULL OR return_status_id = $3)
          AND ($4::int IS NULL OR refund_method = $4)
          AND ($5::timestamp IS NULL OR return_date >= $5)
          AND ($6::timestamp IS NULL OR return_date <= $6)
      ORDER BY return_date DESC`,

    // Get full sale + invoices context for the refund page
    getSaleContext: `
      SELECT
        s.sale_id,
        s.tenant_customer_id,
        s.sale_date,
        s.subtotal_amount,
        s.tax_amount,
        s.total_amount,
        s.has_electronic_invoice,
        s.is_completed,
        b.branch_id,
        b.branch_name,
        b.tenant_id,
        c.currency_code,
        c.symbol AS currency_symbol,
        tc.first_name,
        tc.last_name,
        tc.document_number,
        tc.email AS customer_email,
        dsi.digital_sale_invoice_id,
        dsi.invoice_number AS digital_invoice_number,
        dsi.invoiced_at AS digital_invoiced_at,
        dsi.subtotal_amount AS digital_subtotal,
        dsi.tax_amount AS digital_tax,
        dsi.total_amount AS digital_total,
        esi.electronic_sale_invoice_id,
        esi.key_number AS electronic_key_number,
        esi.consecutive_number AS electronic_consecutive,
        esi.status_id AS electronic_status_id,
        esi.created_at AS electronic_created_at
      FROM pos_schema.sale s
      LEFT JOIN general_schema.branch b ON b.branch_id = s.branch_id
      LEFT JOIN general_schema.currency c ON c.currency_id = s.currency_id
      LEFT JOIN general_schema.tenant_customer tc ON tc.tenant_customer_id = s.tenant_customer_id
      LEFT JOIN pos_schema.digital_sale_invoice dsi ON dsi.sale_id = s.sale_id
      LEFT JOIN pos_schema.electronic_sale_invoice esi ON esi.sale_id = s.sale_id
      WHERE s.sale_id = $1
      LIMIT 1
    `,

    // Get sale items joined with the digital invoice items (for partial refund UI)
    getSaleItemsForRefund: `
      SELECT
        si.sale_item_id,
        si.product_variant_id,
        si.quantity AS available_quantity,
        si.unit_price,
        si.total_price,
        pv.sku,
        pv.variant_name,
        dii.digital_sale_invoice_item_id,
        dii.tax_amount AS digital_tax_amount,
        dii.total_price AS digital_line_total,
        eii.electronic_sale_invoice_item_id,
        eii.line_number AS electronic_line_number
      FROM pos_schema.sale_item si
      INNER JOIN general_schema.product_variant pv
        ON pv.tenant_id = si.tenant_id
        AND pv.product_variant_id = si.product_variant_id
      LEFT JOIN pos_schema.digital_sale_invoice_item dii
        ON dii.sale_item_id = si.sale_item_id
      LEFT JOIN pos_schema.electronic_sale_invoice_items eii
        ON eii.sale_item_id = si.sale_item_id
      WHERE si.sale_id = $1
      ORDER BY si.created_at
    `,

    // Full refund: delete invoice records
    deleteDigitalInvoiceBySaleId: `
      DELETE FROM pos_schema.digital_sale_invoice
      WHERE sale_id = $1
      RETURNING digital_sale_invoice_id
    `,
    deleteElectronicInvoiceBySaleId: `
      DELETE FROM pos_schema.electronic_sale_invoice
      WHERE sale_id = $1
      RETURNING electronic_sale_invoice_id
    `,
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
    findSessions: `
      SELECT
        crs.cash_register_session_id,
        crs.cash_register_id,
        crs.user_id,
        crs.opened_at,
        crs.closed_at,
        crs.opening_amount,
        crs.closing_amount,
        crs.is_active,
        crs.created_at,
        crs.updated_at,
        cr.register_name,
        cr.branch_id,
        b.branch_name,
        b.tenant_id
      FROM pos_schema.cash_register_session crs
      INNER JOIN pos_schema.cash_register cr ON cr.cash_register_id = crs.cash_register_id
      INNER JOIN general_schema.branch b ON b.branch_id = cr.branch_id
      WHERE b.tenant_id = $1
        AND ($2::uuid IS NULL OR cr.branch_id = $2)
        AND ($3::boolean IS NULL OR crs.is_active = $3)
      ORDER BY crs.opened_at DESC
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
      SELECT
        p.promotion_id,
        p.tenant_id,
        p.promotion_name,
        p.promotion_code,
        p.promotion_description,
        p.promotion_type_id,
        p.customer_segment_id,
        c.segment_name,
        p.promotion_start_date,
        p.promotion_end_date,
        pt.type_name,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM pos_schema.promotion p
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_schema.promotion_type pt USING(promotion_type_id)
      WHERE p.tenant_id = $1
      ORDER BY p.created_at DESC
    `,
    getPromoInfo: `
      SELECT
        p.promotion_id,
        p.tenant_id,
        p.promotion_name,
        p.promotion_code,
        p.promotion_description,
        p.promotion_type_id,
        p.customer_segment_id,
        c.segment_name,
        p.promotion_start_date,
        p.promotion_end_date,
        pt.type_name,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM pos_schema.promotion p
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_schema.promotion_type pt USING(promotion_type_id)
      WHERE p.promotion_id = $1 LIMIT 1
    `,
    getPromotionRules: `
      SELECT *
      FROM pos_schema.promotion_rule
      WHERE promotion_id = $1
      ORDER BY tier_level NULLS FIRST, created_at
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

  promotionTarget: {
    byPromotion: `
      SELECT pt.promotion_target_id, pt.promotion_id, pt.tenant_id, pt.target_type,
             pt.target_product_variant_id, pt.target_group_id,
             pv.sku AS variant_sku, pv.variant_name,
             g.group_name, g.tenant_product_group_type_id,
             gt.type_name
      FROM pos_schema.promotion_target pt
      LEFT JOIN general_schema.product_variant pv
        ON pv.tenant_id = pt.tenant_id AND pv.product_variant_id = pt.target_product_variant_id
      LEFT JOIN general_schema.tenant_product_group g
        ON g.tenant_id = pt.tenant_id AND g.tenant_product_group_id = pt.target_group_id
      LEFT JOIN general_schema.tenant_product_group_type gt
        ON gt.tenant_id = g.tenant_id AND gt.tenant_product_group_type_id = g.tenant_product_group_type_id
      WHERE pt.promotion_id = $1
    `,
    deleteForPromotion: `
      DELETE FROM pos_schema.promotion_target WHERE promotion_id = $1
    `,
    insertVariantTarget: `
      INSERT INTO pos_schema.promotion_target
        (promotion_id, tenant_id, target_type, target_product_variant_id, target_group_id)
      VALUES ($1, $2, 'VARIANT', $3, NULL)
      RETURNING *
    `,
    insertGroupTarget: `
      INSERT INTO pos_schema.promotion_target
        (promotion_id, tenant_id, target_type, target_product_variant_id, target_group_id)
      VALUES ($1, $2, 'GROUP', NULL, $3)
      RETURNING *
    `,
    /**
     * Returns promotions applicable to a given variant: matches direct VARIANT
     * targets and GROUP targets where the variant is assigned to the target
     * group or any of its descendants. Filtered by active status and date.
     */
    getApplicableToVariant: `
      WITH RECURSIVE
      variant_groups AS (
        SELECT a.tenant_product_group_id
        FROM general_schema.product_variant_group_assignment a
        WHERE a.tenant_id = $1 AND a.product_variant_id = $2
      ),
      ancestor_groups(node) AS (
        SELECT g.tenant_product_group_id
        FROM general_schema.tenant_product_group g
        WHERE g.tenant_id = $1
          AND g.tenant_product_group_id IN (SELECT tenant_product_group_id FROM variant_groups)
        UNION
        SELECT pg.parent_group_id
        FROM general_schema.tenant_product_group pg
        JOIN ancestor_groups ag ON ag.node = pg.tenant_product_group_id
        WHERE pg.tenant_id = $1 AND pg.parent_group_id IS NOT NULL
      )
      SELECT DISTINCT p.promotion_id, p.promotion_name, p.promotion_code,
             p.promotion_type_id, p.customer_segment_id,
             p.promotion_start_date, p.promotion_end_date, p.is_active,
             pt.target_type, pt.target_product_variant_id, pt.target_group_id
      FROM pos_schema.promotion p
      JOIN pos_schema.promotion_target pt ON pt.promotion_id = p.promotion_id
      WHERE p.tenant_id = $1
        AND p.is_active = TRUE
        AND CURRENT_DATE BETWEEN p.promotion_start_date AND p.promotion_end_date
        AND (
          (pt.target_type = 'VARIANT' AND pt.target_product_variant_id = $2)
          OR (pt.target_type = 'GROUP' AND pt.target_group_id IN (SELECT node FROM ancestor_groups))
        )
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
        points_earned_per_currency_unit = COALESCE($2, points_earned_per_currency_unit),
        points_redeemed_per_currency_unit = COALESCE($3, points_redeemed_per_currency_unit),
        minimum_purchase_for_points = COALESCE($4, minimum_purchase_for_points),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
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
    create: `
      INSERT INTO pos_schema.electronic_sale_invoice
      (sale_id, key_number, consecutive_number, xml_signed, status_id, created_at)
      VALUES ($1, $2, $3, $4, 1, NOW())
      RETURNING electronic_sale_invoice_id
    `,
    // Batch dispatcher: facturas pendientes dentro del TTL
    // $1 = TTL interval (e.g. '3 hours')
    getPendingInvoicesForBatch: `
      SELECT e.electronic_sale_invoice_id, e.key_number, e.created_at,
             b.tenant_id
      FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      INNER JOIN general_schema.branch b USING(branch_id)
      INNER JOIN general_schema.tenant t ON t.tenant_id = b.tenant_id
      WHERE e.status_id = 1
        AND t.tax_regime = 'traditional'
        AND e.created_at > NOW() - $1::interval
      ORDER BY e.created_at
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
      INNER JOIN general_schema.branch b USING(branch_id)
      WHERE b.branch_id = $1 AND b.tenant_id = $2;
    `,
    getEInvoiceForSale: `
      SELECT * FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      INNER JOIN general_schema.branch b USING(branch_id)
      WHERE s.sale_id = $1 AND b.tenant_id = $2;
    `,
    getEInvoiceById: `
      SELECT * FROM pos_schema.electronic_sale_invoice e
      INNER JOIN pos_schema.sale s USING(sale_id)
      INNER JOIN general_schema.branch b USING(branch_id)
      WHERE e.electronic_sale_invoice_id = $1 AND b.tenant_id = $2; 
    `,
    getSaleForEInvoice: `
      SELECT
        s.sale_id,
        s.branch_id,
        t.tenant_id,
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
        t.econ_activity::VARCHAR(6) AS activity_code,
        t.tenant_name     AS issuer_name,
        t.identification  AS issuer_identification,
        COALESCE(tenant_dt.ident_code, '04')::VARCHAR(2) AS issuer_identification_type,
        t.contact_email   AS issuer_email,
        COALESCE(loc.provincia,   '1')  AS provincia,
        COALESCE(loc.canton,      '01') AS canton,
        COALESCE(loc.distrito,    '01') AS distrito,
        COALESCE(loc.otras_senas, 'San José')   AS otras_senas,
        (tc.first_name || ' ' || tc.last_name) AS receiver_name,
        tc.document_number::VARCHAR(20)        AS receiver_identification,
        COALESCE(dt.ident_code, '01')::VARCHAR(2) AS receiver_identification_type,
        tc.email                               AS receiver_email,
        -- CABYS codes starting with '9' = services; '1'-'8' = merchandise
        COALESCE((
          SELECT SUM(si2.total_price)
          FROM pos_schema.sale_item si2
          JOIN general_schema.product_variant pv2
            ON pv2.tenant_id = si2.tenant_id AND pv2.product_variant_id = si2.product_variant_id
          WHERE si2.sale_id = s.sale_id AND LEFT(pv2.cabys_code, 1) = '9'
        ), 0.00)::numeric    AS total_serv_gravados,
        0.00::numeric        AS total_serv_exentos,
        0.00::numeric        AS total_serv_exonerados,
        COALESCE((
          SELECT SUM(si2.total_price)
          FROM pos_schema.sale_item si2
          JOIN general_schema.product_variant pv2
            ON pv2.tenant_id = si2.tenant_id AND pv2.product_variant_id = si2.product_variant_id
          WHERE si2.sale_id = s.sale_id AND (pv2.cabys_code IS NULL OR LEFT(pv2.cabys_code, 1) != '9')
        ), 0.00)::numeric    AS total_mercancias_gravadas,
        0.00::numeric        AS total_mercancias_exentas,
        0.00::numeric        AS total_mercancias_exoneradas,
        GREATEST(
          (SELECT COUNT(*)::integer FROM pos_schema.cash_register cr2
           WHERE cr2.branch_id = b.branch_id AND cr2.created_at <= cr.created_at),
          1
        ) AS terminal_number,
        1 AS pos_number
      FROM pos_schema.sale s
      JOIN general_schema.branch b            ON b.branch_id = s.branch_id
      JOIN general_schema.tenant t            ON t.tenant_id = b.tenant_id
      LEFT JOIN general_schema.branch_location loc ON loc.branch_id = b.branch_id
      JOIN general_schema.tenant_customer tc  ON tc.tenant_customer_id = s.tenant_customer_id
      LEFT JOIN general_schema.identification_type dt ON dt.identification_type_id = tc.identification_type_id
      LEFT JOIN general_schema.identification_type tenant_dt ON tenant_dt.identification_type_id = t.identification_type_id
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
      '01'::varchar(2) AS tax_code,
      '08'::varchar(2) AS tax_rate_code,
      13.00::numeric(5,2) AS tax_rate,
      (si.total_price * 0.13)::numeric(18,5) AS tax_amount,
      (si.total_price * 1.13)::numeric(18,5) AS total_line_amount
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
