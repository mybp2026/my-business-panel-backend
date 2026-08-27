export const ivaQueries = {
  getSummary: `
    WITH

    -- R2.1: IVA Débito — cobrado en ventas con factura electrónica aceptada (status_id = 2).
    -- El IVA se lee del encabezado de la factura digital (digital_sale_invoice.tax_amount),
    -- que se puebla en toda venta. EXISTS evita fan-out por multiples items/facturas.
    debito AS (
      SELECT COALESCE(SUM(di.tax_amount), 0) AS total
      FROM pos_schema.digital_sale_invoice di
      JOIN pos_schema.sale s
        ON s.sale_id = di.sale_id
      JOIN general_schema.branch b
        ON b.branch_id = s.branch_id AND b.tenant_id = $1
      WHERE di.invoiced_at BETWEEN $2::timestamptz AND $3::timestamptz
        AND EXISTS (
          SELECT 1
          FROM pos_schema.electronic_sale_invoice esi
          WHERE esi.sale_id = s.sale_id AND esi.status_id = 2
        )
    ),

    -- R2.2: IVA Crédito — compras con factura ya pagada
    credito AS (
      SELECT COALESCE(SUM(si.tax_amount), 0) AS total
      FROM purchase_schema.supplier_invoice si
      JOIN purchase_schema.purchase_order po
        ON po.purchase_order_id = si.purchase_order_id
      JOIN purchase_schema.supplier sup
        ON sup.supplier_id = po.supplier_id AND sup.added_by = $1
      WHERE si.paid = TRUE
        AND si.invoice_date BETWEEN $2::timestamptz AND $3::timestamptz
    ),

    -- R2.3: IVA CxP — compras con factura emitida pero pago pendiente
    cxp AS (
      SELECT COALESCE(SUM(si.tax_amount), 0) AS total
      FROM purchase_schema.supplier_invoice si
      JOIN purchase_schema.purchase_order po
        ON po.purchase_order_id = si.purchase_order_id
      JOIN purchase_schema.supplier sup
        ON sup.supplier_id = po.supplier_id AND sup.added_by = $1
      WHERE si.paid = FALSE
        AND si.invoice_date BETWEEN $2::timestamptz AND $3::timestamptz
    ),

    -- R2.5: IVA Notas de Crédito — IVA revertido por devoluciones
    notas_credito AS (
      SELECT COALESCE(SUM(rp.total_price * COALESCE(dii.tax_rate_percentage, 0) / 100.0), 0) AS total
      FROM pos_schema.return_product rp
      JOIN pos_schema.return_transaction rt
        ON rt.return_transaction_id = rp.return_transaction_id
      LEFT JOIN pos_schema.digital_sale_invoice di
        ON di.digital_sale_invoice_id = rt.digital_sale_invoice_id
      LEFT JOIN pos_schema.electronic_sale_invoice esi
        ON esi.electronic_sale_invoice_id = rt.electronic_sale_invoice_id
      JOIN pos_schema.sale s
        ON s.sale_id = COALESCE(di.sale_id, esi.sale_id)
      JOIN general_schema.branch b
        ON b.branch_id = s.branch_id AND b.tenant_id = $1
      LEFT JOIN pos_schema.digital_sale_invoice_item dii
        ON dii.sale_item_id = rp.sale_item_id
      WHERE rt.return_date BETWEEN $2::timestamptz AND $3::timestamptz
    )

    SELECT
      d.total::numeric(18,2)                                   AS iva_debito,
      c.total::numeric(18,2)                                   AS iva_credito,
      cx.total::numeric(18,2)                                  AS iva_cxp,
      (c.total + cx.total)::numeric(18,2)                     AS iva_recuperable,
      n.total::numeric(18,2)                                   AS iva_notas_credito,
      (d.total - n.total)::numeric(18,2)                      AS iva_debito_ajustado,
      (d.total - n.total - c.total - cx.total)::numeric(18,2) AS iva_neto
    FROM debito d, credito c, cxp cx, notas_credito n
  `,
};
