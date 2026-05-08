import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateDiscrepancyReport {
    @IsUUID()
    product_id!: string;

    @IsUUID()
    warehouse_id!: string;

    @IsNumber()
    @IsPositive()   
    stored_quantity!: number;
    
    @IsNumber()
    @IsPositive()
    physical_quantity!: number;

    @IsOptional()
    @IsString()
    discrepancy_reason!: string;
}
