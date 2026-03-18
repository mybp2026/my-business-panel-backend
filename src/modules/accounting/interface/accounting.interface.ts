export interface AccountFromDb {
  account_id: string;
  tenant_id: string;
  account_code: string;
  account_name: string;
  account_type_id: number;
  type_name: string;
  nature: string;
  parent_account_id: string | null;
  parent_code: string | null;
  parent_name: string | null;
  cost_center_id: string | null;
  center_name: string | null;
  is_active: boolean;
  is_system: boolean;
  allows_transactions: boolean;
  created_at: string;
  updated_at: string;
}

export interface CostCenterFromDb {
  cost_center_id: string;
  tenant_id: string;
  center_code: string;
  center_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryFromDb {
  entry_id: string;
  tenant_id: string;
  entry_number: number;
  source_type_id: number;
  source_name: string;
  source_id: string | null;
  entry_date: string;
  description: string | null;
  status_id: number;
  status_name: string;
  total_debit: string;
  total_credit: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  lines?: JournalEntryLineFromDb[];
}

// -------------------------------------------------------
// Journal Generation Params (Phase 2)
// -------------------------------------------------------

export interface SaleJournalParams {
  tenantId: string;
  saleId: string;
  saleCondition: string; // '01' = contado, '02'+ = crédito
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  entryDate: Date;
}

export interface CogsJournalParams {
  tenantId: string;
  saleId: string;
  totalCost: number;
  entryDate: Date;
}

export interface PurchaseJournalParams {
  tenantId: string;
  purchaseOrderId: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  entryDate: Date;
}

export interface PaymentJournalParams {
  tenantId: string;
  sourceId: string;
  amount: number;
  entryDate: Date;
  description?: string;
}

export interface JournalEntryLineFromDb {
  line_id: string;
  entry_id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  cost_center_id: string | null;
  center_name: string | null;
  debit_amount: string;
  credit_amount: string;
  description: string | null;
}
