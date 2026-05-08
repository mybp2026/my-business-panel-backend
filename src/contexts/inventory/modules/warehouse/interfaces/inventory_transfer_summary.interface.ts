export interface InventoryTransferSummary {
  inventory_transfer_id: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  from_warehouse_name: string;
  to_warehouse_name: string;
  transfer_date: string;
  inventory_transfer_departure_date: string;
  inventory_transfer_arrival_date: string | null;
  total_units: number;
  total_lines: number;
  created_at: string;
  updated_at: string;
}
