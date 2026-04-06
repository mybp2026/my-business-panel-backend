export interface ProductProfitability {
  product_variant_id: string;
  sku: string;
  variant_name: string | null;
  product_name: string | null;
  total_units_sold: string;
  total_revenue: string;
  total_cogs: string;
  gross_profit: string;
  gross_margin_pct: string;
  current_avg_cost: string;
  current_sale_price: string;
}

export interface SaleProfitability {
  sale_id: string;
  sale_date: string;
  revenue: string;
  tax_amount: string;
  total_amount: string;
  sale_condition: string;
  total_cogs: string;
  gross_profit: string;
  gross_margin_pct: string;
  seller_email: string | null;
  seller_name: string | null;
}

export interface IncomeStatementRow {
  account_code: string;
  account_name: string;
  type_name: string;
  nature: string;
  parent_account_id: string | null;
  parent_code: string | null;
  parent_name: string | null;
  total_debit: string;
  total_credit: string;
  balance: string;
}

export interface IncomeStatementResult {
  period: { startDate: string; endDate: string };
  income: IncomeStatementRow[];
  expenses: IncomeStatementRow[];
  costs: IncomeStatementRow[];
  totals: {
    totalIncome: number;
    totalExpenses: number;
    totalCosts: number;
    grossProfit: number;
    netIncome: number;
  };
}

export interface ExpenseSummaryByCategory {
  category_id: string;
  category_name: string;
  account_code: string;
  is_fixed: boolean;
  expense_count: string;
  subtotal: string;
  total_tax: string;
  total_amount: string;
}

export interface ExpenseFixedVsVariable {
  is_fixed: boolean;
  expense_type: string;
  expense_count: string;
  subtotal: string;
  total_tax: string;
  total_amount: string;
}

export interface ExpenseMonthlyTrend {
  month: string;
  total_amount: string;
  expense_count: string;
}

export interface SellerPerformance {
  seller_user_id: string | null;
  seller_email: string | null;
  seller_name: string;
  total_sales: string;
  total_revenue: string;
  total_tax: string;
  total_amount: string;
  total_cogs: string;
  gross_profit: string;
  gross_margin_pct: string;
  avg_ticket: string;
}

export interface FinancialKpis {
  total_revenue: string;
  total_tax_collected: string;
  total_sales_amount: string;
  total_sales_count: string;
  total_cogs: string;
  gross_profit: string;
  gross_margin_pct: string;
  total_expenses: string;
  fixed_expenses: string;
  variable_expenses: string;
  total_payroll: string;
  total_operating_expenses: string;
  net_operating_income: string;
  operating_margin_pct: string;
  avg_ticket: string;
}

export interface TrialBalanceRow {
  account_code: string;
  account_name: string;
  type_name: string;
  nature: string;
  allows_transactions: boolean;
  total_debit: string;
  total_credit: string;
  balance: string;
}
