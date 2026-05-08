export const expenseQueries = {
  // -------------------------------------------------------
  // EXPENSE CATEGORIES
  // -------------------------------------------------------

  getCategoriesByTenant: `
    SELECT
      ec.category_id,
      ec.tenant_id,
      ec.name,
      ec.account_code,
      ec.parent_category_id,
      ec.is_fixed,
      ec.is_active,
      ec.created_at,
      ec.updated_at
    FROM accounting_schema.expense_category ec
    WHERE ec.tenant_id = $1
    ORDER BY ec.account_code
  `,

  getCategoryById: `
    SELECT *
    FROM accounting_schema.expense_category
    WHERE category_id = $1 AND tenant_id = $2
    LIMIT 1
  `,

  createCategory: `
    INSERT INTO accounting_schema.expense_category
      (tenant_id, name, account_code, parent_category_id, is_fixed)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING category_id
  `,

  updateCategory: `
    UPDATE accounting_schema.expense_category
    SET
      name = COALESCE($3, name),
      account_code = COALESCE($4, account_code),
      is_fixed = COALESCE($5, is_fixed),
      is_active = COALESCE($6, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE category_id = $1 AND tenant_id = $2
    RETURNING category_id
  `,

  provisionTenantExpenseCategories: `
    INSERT INTO accounting_schema.expense_category (tenant_id, name, account_code, is_fixed)
    SELECT $1, t.name, t.account_code, t.is_fixed
    FROM accounting_schema.expense_category_template t
    WHERE NOT EXISTS (
      SELECT 1 FROM accounting_schema.expense_category ec
      WHERE ec.tenant_id = $1 AND ec.name = t.name
    )
    RETURNING category_id
  `,

  // -------------------------------------------------------
  // EXPENSES
  // -------------------------------------------------------

  getExpensesByTenant: `
    SELECT
      e.expense_id,
      e.tenant_id,
      e.branch_id,
      e.category_id,
      ec.name AS category_name,
      ec.account_code,
      e.description,
      e.amount,
      e.tax_amount,
      e.total_amount,
      e.currency_id,
      e.expense_date,
      e.payment_method,
      e.reference_number,
      e.notes,
      e.created_by,
      e.created_at,
      e.updated_at
    FROM accounting_schema.expense e
    INNER JOIN accounting_schema.expense_category ec ON ec.category_id = e.category_id
    WHERE e.tenant_id = $1
    ORDER BY e.expense_date DESC, e.created_at DESC
  `,

  getExpensesByBranch: `
    SELECT
      e.expense_id,
      e.tenant_id,
      e.branch_id,
      e.category_id,
      ec.name AS category_name,
      ec.account_code,
      e.description,
      e.amount,
      e.tax_amount,
      e.total_amount,
      e.currency_id,
      e.expense_date,
      e.payment_method,
      e.reference_number,
      e.notes,
      e.created_by,
      e.created_at,
      e.updated_at
    FROM accounting_schema.expense e
    INNER JOIN accounting_schema.expense_category ec ON ec.category_id = e.category_id
    WHERE e.tenant_id = $1 AND e.branch_id = $2
    ORDER BY e.expense_date DESC, e.created_at DESC
  `,

  getExpenseById: `
    SELECT
      e.expense_id,
      e.tenant_id,
      e.branch_id,
      e.category_id,
      ec.name AS category_name,
      ec.account_code,
      e.description,
      e.amount,
      e.tax_amount,
      e.total_amount,
      e.currency_id,
      e.expense_date,
      e.payment_method,
      e.reference_number,
      e.notes,
      e.created_by,
      e.created_at,
      e.updated_at
    FROM accounting_schema.expense e
    INNER JOIN accounting_schema.expense_category ec ON ec.category_id = e.category_id
    WHERE e.expense_id = $1 AND e.tenant_id = $2
    LIMIT 1
  `,

  createExpense: `
    INSERT INTO accounting_schema.expense
      (tenant_id, branch_id, category_id, description, amount, tax_amount, total_amount,
       currency_id, expense_date, payment_method, reference_number, notes, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING expense_id
  `,

  getExpensesByDateRange: `
    SELECT
      e.expense_id,
      e.tenant_id,
      e.branch_id,
      e.category_id,
      ec.name AS category_name,
      ec.account_code,
      e.description,
      e.amount,
      e.tax_amount,
      e.total_amount,
      e.currency_id,
      e.expense_date,
      e.payment_method,
      e.reference_number,
      e.notes,
      e.created_by,
      e.created_at,
      e.updated_at
    FROM accounting_schema.expense e
    INNER JOIN accounting_schema.expense_category ec ON ec.category_id = e.category_id
    WHERE e.tenant_id = $1 AND e.expense_date BETWEEN $2 AND $3
    ORDER BY e.expense_date DESC
  `,

  // -------------------------------------------------------
  // FISCAL PERIODS
  // -------------------------------------------------------

  getFiscalPeriodsByTenant: `
    SELECT * FROM accounting_schema.fiscal_period
    WHERE tenant_id = $1
    ORDER BY start_date DESC
  `,

  getFiscalPeriodById: `
    SELECT * FROM accounting_schema.fiscal_period
    WHERE period_id = $1 AND tenant_id = $2
    LIMIT 1
  `,

  createFiscalPeriod: `
    INSERT INTO accounting_schema.fiscal_period
      (tenant_id, name, start_date, end_date)
    VALUES ($1, $2, $3, $4)
    RETURNING period_id
  `,

  closeFiscalPeriod: `
    UPDATE accounting_schema.fiscal_period
    SET is_closed = TRUE, closed_at = CURRENT_TIMESTAMP
    WHERE period_id = $1 AND tenant_id = $2 AND is_closed = FALSE
    RETURNING period_id
  `,
};
