import { createQueries } from '@crane-technologies/database';

export const purchaseQueryDefs = {
  purchase: {
    createPurchaseOrder: `
        SELECT purchase_schema.create_purchase_order(
        $1, $2, $3, $4, $5, $6
        ) AS purchase_order_id
    `,

    updateStatus: `
        UPDATE purchase_schema.purchase_order
        SET purchase_order_status_id = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE purchase_order_id = $2
        RETURNING purchase_order_id, purchase_order_status_id, updated_at
    `,

    updateOrderStatus: `
    UPDATE purchase_schema.purchase_order
    SET purchase_order_status_id = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE purchase_order_id = $2
    RETURNING purchase_order_id, purchase_order_status_id, updated_at
  `,

    getCurrentStatusByIdAndTenant: `
        SELECT
        po.purchase_order_id,
        po.purchase_order_status_id
        FROM purchase_schema.purchase_order po
        INNER JOIN inventory_schema.warehouse w ON w.warehouse_id = po.warehouse_id
        INNER JOIN general_schema.branch b ON b.branch_id = w.branch_id
        WHERE po.purchase_order_id = $1
        AND b.tenant_id = $2
        LIMIT 1
    `,

    getAllByTenant: `
        SELECT
            po.purchase_order_id,
            po.purchase_order_date,
            po.expected_delivery_date,
            po.purchase_order_status_id,
            pos.status_name AS purchase_order_status_name,
            s.supplier_id,
            s.supplier_name,
            pap.purchase_account_payable_id,
            pap.account_payable_status,
            aps.status_name AS account_payable_status_name,
            ap.subtotal,
            pap.tax_amount,
            ap.amount_paid,
            ap.balance_remaining,
            ap.is_paid,
            po.created_at,
            po.updated_at
        FROM purchase_schema.purchase_order po
        INNER JOIN inventory_schema.warehouse w ON w.warehouse_id = po.warehouse_id
        INNER JOIN general_schema.branch b ON b.branch_id = w.branch_id
        LEFT JOIN purchase_schema.supplier s ON s.supplier_id = po.supplier_id
        LEFT JOIN purchase_schema.purchase_order_status pos ON pos.status_id = po.purchase_order_status_id
        LEFT JOIN purchase_schema.purchase_account_payable pap ON pap.purchase_order_id = po.purchase_order_id
        LEFT JOIN general_schema.account_payable ap ON ap.account_payable_id = pap.account_payable_id
        LEFT JOIN general_schema.account_payable_status aps ON aps.status_id = pap.account_payable_status
        WHERE b.tenant_id = $1
        ORDER BY po.purchase_order_date DESC, po.created_at DESC
    `,

    getItemsForInventory: `
    SELECT
      poi.product_variant_id,
      poi.quantity_ordered,
      poi.unit_price AS unit_cost,
      poi.tenant_id,
      po.warehouse_id,
      po.purchase_order_id
    FROM purchase_schema.purchase_order_item poi
    JOIN purchase_schema.purchase_order po ON po.purchase_order_id = poi.purchase_order_id
    WHERE poi.purchase_order_id = $1
  `,

    getOrderAmountsForJournal: `
    SELECT
      ap.subtotal AS subtotal_amount,
      COALESCE(pap.tax_amount, 0) AS tax_amount,
      (ap.subtotal + COALESCE(pap.tax_amount, 0)) AS total_amount,
      b.tenant_id
    FROM purchase_schema.purchase_order po
    INNER JOIN inventory_schema.warehouse w ON w.warehouse_id = po.warehouse_id
    INNER JOIN general_schema.branch b ON b.branch_id = w.branch_id
    LEFT JOIN purchase_schema.purchase_account_payable pap ON pap.purchase_order_id = po.purchase_order_id
    LEFT JOIN general_schema.account_payable ap ON ap.account_payable_id = pap.account_payable_id
    WHERE po.purchase_order_id = $1
    LIMIT 1
  `,

    getById: `
        SELECT
            po.purchase_order_id,
            po.purchase_order_date,
            po.expected_delivery_date,
            po.purchase_order_status_id,
            pos.status_name AS purchase_order_status_name,
            s.supplier_id,
            s.supplier_name,
            pap.purchase_account_payable_id,
            pap.account_payable_status,
            aps.status_name AS account_payable_status_name,
            ap.subtotal,
            pap.tax_amount,
            ap.amount_paid,
            ap.balance_remaining,
            ap.is_paid,

            COALESCE((
            SELECT json_agg(poi ORDER BY poi.created_at)
            FROM purchase_schema.purchase_order_item poi
            WHERE poi.purchase_order_id = po.purchase_order_id
            ), '[]'::json) AS items,

            COALESCE((
            SELECT json_agg(si ORDER BY si.created_at)
            FROM purchase_schema.supplier_invoice si
            WHERE si.purchase_order_id = po.purchase_order_id
            ), '[]'::json) AS invoices,

            COALESCE((
            SELECT json_agg(pop ORDER BY pop.payment_date)
            FROM purchase_schema.purchase_order_payment pop
            WHERE pop.purchase_account_payable_id = pap.purchase_account_payable_id
            ), '[]'::json) AS payments,

            po.created_at,
            po.updated_at
        FROM purchase_schema.purchase_order po
        LEFT JOIN purchase_schema.supplier s ON s.supplier_id = po.supplier_id
        LEFT JOIN purchase_schema.purchase_order_status pos ON pos.status_id = po.purchase_order_status_id
        LEFT JOIN purchase_schema.purchase_account_payable pap ON pap.purchase_order_id = po.purchase_order_id
        LEFT JOIN general_schema.account_payable ap ON ap.account_payable_id = pap.account_payable_id
        LEFT JOIN general_schema.account_payable_status aps ON aps.status_id = pap.account_payable_status
        WHERE po.purchase_order_id = $1
        LIMIT 1
    `,

    threeWayMatching: `
        SELECT purchase_schema.execute_three_way_matching($1::uuid, $2::uuid)
    `,

    getMatchingByOrderId: `
    SELECT
      twm.matching_id,
      twm.purchase_order_id,
      twm.goods_receipt_id,
      twm.supplier_invoice_id,
      twm.amounts_matched,
      twm.quantities_matched,
      twm.is_matched,
      twm.matched_at,

      json_build_object(
        'order', json_build_object(
          'subtotal', ap.subtotal,
          'tax', pap.tax_amount,
          'total', (ap.subtotal + COALESCE(pap.tax_amount, 0))
        ),
        'invoice', json_build_object(
          'subtotal', si.subtotal_amount,
          'tax', si.tax_amount,
          'total', si.total_amount
        ),
        'receipt', json_build_object(
          'subtotal', gr.subtotal_amount,
          'tax', gr.tax_amount,
          'total', gr.total_amount
        ),
        'differences', json_build_object(
          'order_vs_invoice_total', ABS((ap.subtotal + COALESCE(pap.tax_amount, 0)) - si.total_amount),
          'order_vs_receipt_total', ABS((ap.subtotal + COALESCE(pap.tax_amount, 0)) - gr.total_amount),
          'invoice_vs_receipt_total', ABS(si.total_amount - gr.total_amount)
        )
      ) AS amount_comparison,

      json_build_object(
        'order_qty', COALESCE(poi.total_qty, 0),
        'invoice_qty', COALESCE(sii.total_qty, 0),
        'receipt_qty', COALESCE(gri.total_qty, 0),
        'differences', json_build_object(
          'order_vs_invoice', ABS(COALESCE(poi.total_qty, 0) - COALESCE(sii.total_qty, 0)),
          'order_vs_receipt', ABS(COALESCE(poi.total_qty, 0) - COALESCE(gri.total_qty, 0)),
          'invoice_vs_receipt', ABS(COALESCE(sii.total_qty, 0) - COALESCE(gri.total_qty, 0))
        )
      ) AS quantity_comparison

    FROM purchase_schema.three_way_matching twm
    INNER JOIN purchase_schema.purchase_order po ON po.purchase_order_id = twm.purchase_order_id
    LEFT JOIN purchase_schema.purchase_account_payable pap ON pap.purchase_order_id = po.purchase_order_id
    LEFT JOIN general_schema.account_payable ap ON ap.account_payable_id = pap.account_payable_id
    LEFT JOIN purchase_schema.supplier_invoice si ON si.supplier_invoice_id = twm.supplier_invoice_id
    LEFT JOIN purchase_schema.goods_receipt gr ON gr.goods_receipt_id = twm.goods_receipt_id

    LEFT JOIN LATERAL (
      SELECT SUM(quantity_ordered)::int AS total_qty
      FROM purchase_schema.purchase_order_item
      WHERE purchase_order_id = po.purchase_order_id
    ) poi ON TRUE

    LEFT JOIN LATERAL (
      SELECT SUM(quantity_billed)::int AS total_qty
      FROM purchase_schema.supplier_invoice_item
      WHERE supplier_invoice_id = twm.supplier_invoice_id
    ) sii ON TRUE

    LEFT JOIN LATERAL (
      SELECT SUM(quantity_received)::int AS total_qty
      FROM purchase_schema.goods_receipt_item
      WHERE goods_receipt_id = twm.goods_receipt_id
    ) gri ON TRUE

    WHERE twm.purchase_order_id = $1
    ORDER BY twm.created_at DESC
    LIMIT 1
  `,
  },

  suppliers: {
    create: `
    INSERT INTO purchase_schema.supplier (supplier_name, supplier_contact_info, supplier_address, supplier_notes, added_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,

    getAll: `
    SELECT * FROM purchase_schema.supplier
    `,

    getAllByTenant: `
    SELECT * FROM purchase_schema.supplier WHERE added_by = $1
  `,

    getById: `
    SELECT * FROM purchase_schema.supplier WHERE supplier_id = $1
    `,

    update: `
      UPDATE purchase_schema.supplier
      SET supplier_name = $1,
          supplier_contact_info = $2,
          supplier_address = $3,
          supplier_notes = $4
      WHERE supplier_id = $5
      RETURNING *
    `,

    delete: `
      DELETE FROM purchase_schema.supplier WHERE supplier_id = $1 RETURNING *
    `,
  },

  payments: {
    insertPayment: `
    INSERT INTO purchase_schema.purchase_order_payment
      (purchase_account_payable_id, amount_paid, payment_method_id, payment_reference)
    VALUES
      ($1, $2, $3, $4)
    RETURNING purchase_order_payment_id
  `,

    getPaymentAmountForJournal: `
    SELECT
      pop.amount_paid,
      b.tenant_id,
      po.purchase_order_id
    FROM purchase_schema.purchase_order_payment pop
    JOIN purchase_schema.purchase_account_payable pap ON pap.purchase_account_payable_id = pop.purchase_account_payable_id
    JOIN purchase_schema.purchase_order po ON po.purchase_order_id = pap.purchase_order_id
    JOIN inventory_schema.warehouse w ON w.warehouse_id = po.warehouse_id
    JOIN general_schema.branch b ON b.branch_id = w.branch_id
    WHERE pop.purchase_order_payment_id = $1
    LIMIT 1
  `,
  },

  //   account payable
  ap: {
    getUpdatedPayableById: `
    SELECT
      pap.purchase_account_payable_id,
      pap.account_payable_status,
      aps.status_name AS account_payable_status_name,
      ap.subtotal,
      pap.tax_amount,
      ap.amount_paid,
      ap.balance_remaining,
      ap.is_paid
    FROM purchase_schema.purchase_account_payable pap
    JOIN general_schema.account_payable ap
      ON ap.account_payable_id = pap.account_payable_id
    LEFT JOIN general_schema.account_payable_status aps
      ON aps.status_id = pap.account_payable_status
    WHERE pap.purchase_account_payable_id = $1
    LIMIT 1
  `,
  },
};

export const purchaseQueries = createQueries(purchaseQueryDefs);
