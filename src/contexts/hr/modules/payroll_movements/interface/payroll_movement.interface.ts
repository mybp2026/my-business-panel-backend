export interface PayrollMovement {
  movement_id: string;
  detail_id: string;
  concept_id: number;
  base_amount: number;
  calculated_amount: number;
  description?: string;
  employee_id: string;
  concept_name: string;
  concept_type: 'earning' | 'deduction';
}
