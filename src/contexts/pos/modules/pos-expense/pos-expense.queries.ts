export const posExpenseQueries = {
  listTypesByTenant: `
    SELECT expense_type_id, tenant_id, expense_type_name, expense_type_detail, created_at
    FROM pos_schema.expense_type
    WHERE tenant_id = $1
    ORDER BY expense_type_name ASC
  `,

  createType: `
    INSERT INTO pos_schema.expense_type (tenant_id, expense_type_name, expense_type_detail)
    VALUES ($1, $2, $3)
    RETURNING expense_type_id, tenant_id, expense_type_name, expense_type_detail, created_at
  `,

  listByBranch: `
    SELECT
      e.expense_id,
      e.expense_type_id,
      et.expense_type_name,
      e.expense_amount,
      e.branch_id,
      e.user_id,
      u.email as user_email,
      e.status,
      e.rejection_reason,
      e.created_at
    FROM pos_schema.expense e
    INNER JOIN pos_schema.expense_type et ON et.expense_type_id = e.expense_type_id
    INNER JOIN general_schema.users u ON u.user_id = e.user_id
    WHERE e.branch_id = $1
    ORDER BY e.created_at DESC
  `,

  create: `
    INSERT INTO pos_schema.expense (expense_type_id, expense_amount, branch_id, user_id, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING expense_id, expense_type_id, expense_amount, branch_id, user_id, status, created_at
  `,
  updateStatus: `
    UPDATE pos_schema.expense
    SET status = $2, rejection_reason = $3
    WHERE expense_id = $1
    RETURNING *
  `,
  getById: `
    SELECT
      e.expense_id,
      e.expense_type_id,
      et.expense_type_name,
      e.expense_amount,
      e.branch_id,
      e.user_id,
      u.email as user_email,
      e.status,
      e.rejection_reason,
      e.created_at
    FROM pos_schema.expense e
    INNER JOIN pos_schema.expense_type et ON et.expense_type_id = e.expense_type_id
    INNER JOIN general_schema.users u ON u.user_id = e.user_id
    WHERE e.expense_id = $1
  `,
};
