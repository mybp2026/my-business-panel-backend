// Consultas crudas para la Vista de Rentabilidad.
// El backend solo agrega componentes monetarios por sucursal + bucket de tiempo;
// las formulas de margen/utilidad se calculan en el frontend.
//
// Parametros comunes:
//   $1 = tenant_id (uuid)        -> aislamiento multi-tenant (la venta no tiene tenant_id,
//                                   se obtiene via general_schema.branch)
//   $2 = bucket_unit (text)      -> 'hour' | 'day' | 'week' | 'month' para date_trunc
//   $3 = range_start (timestamp) -> inicio del rango (now - intervalo)

// Componentes de ventas, agrupados por (sucursal, bucket, moneda).
// net_sales = total_price (ya neto de descuento); discounts y cogs explicitos.
export const salesComponents = `
  SELECT
    b.branch_id,
    date_trunc($2, s.sale_date)                          AS bucket_start,
    COALESCE(s.currency_id, 1)                           AS currency_id,
    SUM(si.total_price)                                  AS net_sales,
    SUM(COALESCE(si.discount_applied, 0))                AS discounts,
    SUM(COALESCE(si.cost_price_at_sale, 0) * si.quantity) AS cogs
  FROM pos_schema.sale s
  INNER JOIN general_schema.branch b
    ON b.branch_id = s.branch_id
  INNER JOIN pos_schema.sale_item si
    ON si.sale_id = s.sale_id
  WHERE b.tenant_id = $1
    AND s.is_completed = TRUE
    AND s.sale_date >= $3
  GROUP BY b.branch_id, bucket_start, COALESCE(s.currency_id, 1)
`;

// Componentes de devoluciones, agrupados por (sucursal, bucket, moneda).
// El bucket se calcula con la fecha de la devolucion (return_date); el costo de lo
// devuelto se obtiene del sale_item original (cost_price_at_sale).
export const returnsComponents = `
  SELECT
    b.branch_id,
    date_trunc($2, rt.return_date)                       AS bucket_start,
    COALESCE(s.currency_id, 1)                           AS currency_id,
    SUM(rp.total_price)                                  AS returns,
    SUM(COALESCE(si.cost_price_at_sale, 0) * rp.quantity) AS returns_cogs
  FROM pos_schema.return_product rp
  INNER JOIN pos_schema.return_transaction rt
    ON rt.return_transaction_id = rp.return_transaction_id
  INNER JOIN pos_schema.sale_item si
    ON si.sale_item_id = rp.sale_item_id
  INNER JOIN pos_schema.sale s
    ON s.sale_id = si.sale_id
  INNER JOIN general_schema.branch b
    ON b.branch_id = s.branch_id
  WHERE b.tenant_id = $1
    AND rt.return_date >= $3
  GROUP BY b.branch_id, bucket_start, COALESCE(s.currency_id, 1)
`;

// Gastos operativos aprobados, agrupados por (sucursal, bucket). Montos en CRC (la tabla
// expense no almacena moneda).
export const expenseComponents = `
  SELECT
    b.branch_id,
    date_trunc($2, e.created_at)                         AS bucket_start,
    SUM(e.expense_amount)                                AS amount_crc
  FROM pos_schema.expense e
  INNER JOIN general_schema.branch b
    ON b.branch_id = e.branch_id
  WHERE b.tenant_id = $1
    AND e.status = 'approved'
    AND e.created_at >= $3
  GROUP BY b.branch_id, bucket_start
`;

// Sucursales del tenant (para generar los N graficos aunque una sede no tenga ventas).
export const tenantBranches = `
  SELECT branch_id, branch_name
  FROM general_schema.branch
  WHERE tenant_id = $1
  ORDER BY branch_name
`;
