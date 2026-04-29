export const inventoryQueries = {
  create: `
    INSERT INTO inventory_schema.warehouse
      (branch_id, warehouse_name, warehouse_address, is_branch, created_at, updated_at)
      VALUES ($1, $2, $3, COALESCE($4, false), NOW(), NOW())
    RETURNING *`,
  update: `
    UPDATE inventory_schema.warehouse
    SET
      warehouse_name = COALESCE($2, warehouse_name),
      warehouse_address = COALESCE($3, warehouse_address),
      is_branch = COALESCE($4, is_branch),
      updated_at = NOW()
    WHERE warehouse_id = $1
    RETURNING *`,
  delete: `
    DELETE FROM inventory_schema.warehouse
    WHERE warehouse_id = $1`,
  byId: `
    SELECT * FROM inventory_schema.warehouse 
    WHERE warehouse_id = $1`,
  byTenant: `
    SELECT 
      wh.warehouse_id, wh.branch_id, wh.warehouse_name, wh.warehouse_address, wh.is_branch, br.branch_name, br.tenant_id 
    FROM inventory_schema.warehouse wh 
      INNER JOIN general_schema.branch br USING(branch_id)
    WHERE tenant_id = $1`,
  byBranch: `
    SELECT 
      wh.warehouse_id, wh.branch_id, wh.warehouse_name, wh.warehouse_address, wh.is_branch, br.branch_name, br.tenant_id
    FROM inventory_schema.warehouse wh
      INNER JOIN general_schema.branch br USING(branch_id)
    WHERE wh.branch_id = $1`,
  byTenantAndId: `
    SELECT 
      wh.warehouse_id, wh.branch_id, wh.warehouse_name, wh.warehouse_address, wh.is_branch, br.branch_name, br.tenant_id
    FROM inventory_schema.warehouse wh 
      INNER JOIN general_schema.branch br USING(branch_id)
    WHERE wh.warehouse_id = $1 AND br.tenant_id = $2`,
  insertIntoInventory: `
    INSERT INTO inventory_schema.inventory
      (tenant_id, warehouse_id, product_variant_id, stock, expiration_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *`,
  bulkInsertInventory: `
    INSERT INTO inventory_schema.inventory
      (tenant_id, warehouse_id, product_variant_id, stock, expiration_date, created_at, updated_at)
    SELECT $1::uuid, $2::uuid, x.product_variant_id, x.stock, x.expiration_date, NOW(), NOW()
    FROM jsonb_to_recordset($3::jsonb)
      AS x(product_variant_id uuid, stock integer, expiration_date timestamp)
    RETURNING *`,
  listInventoryByWarehouse: `
    SELECT
      i.inventory_id,
      i.tenant_id,
      i.product_variant_id,
      i.warehouse_id,
      i.stock,
      i.expiration_date,
      i.created_at,
      i.updated_at,
      pv.variant_name,
      pv.sku,
      pv.product_variant_id AS product_id,
      pv.variant_name AS product_name
    FROM inventory_schema.inventory i
    INNER JOIN general_schema.product_variant pv USING(tenant_id, product_variant_id)
    WHERE i.warehouse_id = $1 AND i.tenant_id = $2
      AND ($3::text IS NULL OR $3 = '' OR
        pv.variant_name ILIKE '%' || $3 || '%' OR
        pv.sku ILIKE '%' || $3 || '%' OR
        i.inventory_id::text ILIKE '%' || $3 || '%'
      )
    ORDER BY pv.variant_name`,
  updateInventoryItem: `
    UPDATE inventory_schema.inventory
    SET
      stock = COALESCE($2::integer, stock),
      expiration_date = $3::timestamp,
      updated_at = NOW()
    WHERE inventory_id = $1 AND tenant_id = $4
    RETURNING *`,
  deleteInventoryItem: `
    DELETE FROM inventory_schema.inventory
    WHERE inventory_id = $1 AND tenant_id = $2`,
  addStock: `
    UPDATE inventory_schema.inventory
    SET stock = stock + $1, updated_at = NOW()
    WHERE warehouse_id = $2 AND product_variant_id = $3 AND tenant_id = $4
    RETURNING *`,
  removeStock: `
    UPDATE inventory_schema.inventory
    SET stock = GREATEST(0, stock - $1), updated_at = NOW()
    WHERE warehouse_id = $2 AND product_variant_id = $3 AND tenant_id = $4
    RETURNING *`,
  countAllInWarehouse: `
    SELECT
      pv.product_variant_id,
      pv.variant_name,
      pv.variant_name AS product_name,
      SUM(i.stock) AS total_amount
    FROM
      inventory_schema.inventory i
    INNER JOIN
      general_schema.product_variant pv USING(tenant_id, product_variant_id)
    WHERE
      i.warehouse_id = $1 AND i.tenant_id = $2
    GROUP BY
      pv.product_variant_id, pv.variant_name`,
  createDiscrepancyReport: `
    INSERT INTO inventory_schema.discrepancy_count
      (tenant_id, product_variant_id, warehouse_id, stored_quantity, physical_quantity, discrepancy_reason, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *`,
  getAllDiscrepancyReports: `
    SELECT
      dc.discrepancy_count_id,
      dc.tenant_id,
      dc.product_variant_id,
      dc.warehouse_id,
      dc.stored_quantity,
      dc.physical_quantity,
      dc.discrepancy_reason,
      dc.created_at,
      dc.updated_at,
      pv.variant_name,
      pv.sku
    FROM inventory_schema.discrepancy_count dc
    LEFT JOIN general_schema.product_variant pv
      ON pv.product_variant_id = dc.product_variant_id AND pv.tenant_id = dc.tenant_id
    WHERE dc.warehouse_id = $1 AND dc.tenant_id = $2
    ORDER BY dc.created_at DESC`,
  getDiscrepancyReportById: `
    SELECT * FROM inventory_schema.discrepancy_count
    WHERE discrepancy_count_id = $1 AND tenant_id = $2`,

  createInventoryTransfer: `
    INSERT INTO inventory_schema.inventory_transfer
      (from_warehouse_id, to_warehouse_id, transfer_date, inventory_transfer_departure_date, inventory_transfer_arrival_date, created_at, updated_at)
    VALUES ($1, $2, NOW(), $3, $4, NOW(), NOW())
    RETURNING *`,
  addProductToInventoryTransfer: `
    INSERT INTO inventory_schema.inventory_transfer_product
      (inventory_transfer_id, tenant_id, product_variant_id, quantity, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())`,
  getInventoryTransfers: `
    SELECT it.*
    FROM inventory_schema.inventory_transfer it
    WHERE it.from_warehouse_id = $1 OR it.to_warehouse_id = $1
    ORDER BY it.transfer_date DESC`,
  getInventoryTransfersByTenant: `
    SELECT
      it.inventory_transfer_id,
      it.from_warehouse_id,
      it.to_warehouse_id,
      it.transfer_date,
      it.inventory_transfer_departure_date,
      it.inventory_transfer_arrival_date,
      it.created_at,
      it.updated_at,
      wf.warehouse_name AS from_warehouse_name,
      wt.warehouse_name AS to_warehouse_name,
      COALESCE(SUM(itp.quantity), 0)::int AS total_units,
      COUNT(itp.inventory_transfer_product_id)::int AS total_lines
    FROM inventory_schema.inventory_transfer it
      INNER JOIN inventory_schema.warehouse wf
        ON wf.warehouse_id = it.from_warehouse_id
      INNER JOIN inventory_schema.warehouse wt
        ON wt.warehouse_id = it.to_warehouse_id
      INNER JOIN general_schema.branch bf
        ON bf.branch_id = wf.branch_id
      LEFT JOIN inventory_schema.inventory_transfer_product itp
        ON itp.inventory_transfer_id = it.inventory_transfer_id
       AND itp.tenant_id = $1
    WHERE bf.tenant_id = $1
    GROUP BY it.inventory_transfer_id, wf.warehouse_name, wt.warehouse_name
    ORDER BY it.transfer_date DESC`,
  getInventoryTransferById: `
    SELECT * FROM inventory_schema.inventory_transfer
    WHERE inventory_transfer_id = $1`,
  getInventoryTransferProducts: `
    SELECT
      itp.inventory_transfer_product_id,
      itp.inventory_transfer_id,
      itp.tenant_id,
      itp.product_variant_id,
      itp.quantity,
      pv.variant_name,
      pv.sku,
      pv.variant_name AS product_name
    FROM inventory_schema.inventory_transfer_product itp
      INNER JOIN general_schema.product_variant pv USING(tenant_id, product_variant_id)
    WHERE itp.inventory_transfer_id = $1 AND itp.tenant_id = $2`,
  logInventoryMovement: `
    INSERT INTO inventory_schema.inventory_log
      (inventory_log_type_id, warehouse_id, tenant_id, product_variant_id, quantity, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *`,
  updateProductCost: `
    SELECT general_schema.update_product_cost_on_receipt(
      $1::uuid, $2::uuid, $3::uuid, $4::int, $5::numeric, $6::int, $7::numeric
    )`,
};
