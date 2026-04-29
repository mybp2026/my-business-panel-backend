export const inventoryQueries = {
  create: `
    INSERT INTO inventory_schema.warehouse 
      (branch_id, warehouse_name, warehouse_address, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW()) 
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
  addStock: `
    UPDATE inventory_schema.inventory
    SET stock = stock + $1, updated_at = NOW()
    WHERE warehouse_id = $2 AND product_variant_id = $3 AND tenant_id = $4
    RETURNING *`,
  removeStock: `
    UPDATE inventory_schema.inventory
   SET stock = stock - $1, updated_at = NOW()
    WHERE stock >= $1 AND warehouse_id = $2 AND product_variant_id = $3 AND tenant_id = $4
    RETURNING *`,
  countAllInWarehouse: `
    SELECT 
      pv.product_variant_id,
      pv.variant_name,
      p.product_name,
      SUM(i.stock) AS total_amount
    FROM 
      inventory_schema.inventory i
    INNER JOIN 
      general_schema.product_variant pv USING(tenant_id, product_variant_id)
    INNER JOIN
      general_schema.product p ON p.product_id = pv.product_id AND p.tenant_id = pv.tenant_id
    WHERE 
      i.warehouse_id = $1 AND i.tenant_id = $2
    GROUP BY 
      pv.product_variant_id, pv.variant_name, p.product_name`,
  createDiscrepancyReport: `
    INSERT INTO inventory_schema.discrepancy_count
      (tenant_id, product_variant_id, warehouse_id, stored_quantity, physical_quantity, discrepancy_reason, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *`,
  getAllDiscrepancyReports: `
    SELECT * FROM inventory_schema.discrepancy_count
    WHERE warehouse_id = $1 AND tenant_id = $2
    ORDER BY created_at DESC`,
  getDiscrepancyReportById: `
    SELECT * FROM inventory_schema.discrepancy_count
    WHERE discrepancy_count_id = $1 AND tenant_id = $2`,

  applyDiscrepancyReport: `
  UPDATE inventory_schema.discrepancy_count
  SET is_applied = TRUE, updated_at = NOW()
  WHERE discrepancy_count_id = $1 AND tenant_id = $2
  RETURNING *`,

  createInventoryTransfer: `
    INSERT INTO inventory_schema.inventory_transfer
      (from_warehouse_id, to_warehouse_id, transfer_date, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW(), NOW())
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
  getInventoryTransferById: `
    SELECT * FROM inventory_schema.inventory_transfer
    WHERE inventory_transfer_id = $1`,
  logInventoryMovement: `
    INSERT INTO inventory_schema.inventory_log
      (inventory_log_type_id, warehouse_id, tenant_id, product_variant_id, quantity, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *`,
  getExpiringStock: `
    SELECT
      i.inventory_id,
      i.warehouse_id,
      w.warehouse_name,
      i.product_variant_id,
      pv.variant_name,
      p.product_name,
      i.stock,
      i.expiration_date,
      (i.expiration_date - CURRENT_DATE) AS days_until_expiry
    FROM inventory_schema.inventory i
    INNER JOIN inventory_schema.warehouse w USING(warehouse_id)
    INNER JOIN general_schema.branch br ON br.branch_id = w.branch_id
    INNER JOIN general_schema.product_variant pv
      ON pv.product_variant_id = i.product_variant_id
      AND pv.tenant_id = i.tenant_id
    INNER JOIN general_schema.product p
      ON p.product_id = pv.product_id
      AND p.tenant_id = pv.tenant_id
    WHERE i.tenant_id = $1
      AND i.expiration_date IS NOT NULL
      AND i.expiration_date <= CURRENT_DATE + ($2 * INTERVAL '1 day')
      AND i.stock > 0
    ORDER BY i.expiration_date ASC`,
  updateProductCost: `
    SELECT general_schema.update_product_cost_on_receipt(
      $1::uuid, $2::uuid, $3::uuid, $4::int, $5::numeric, $6::int, $7::numeric
    )`,
};
