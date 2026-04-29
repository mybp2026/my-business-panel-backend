import { IsUUID, IsNumber, IsPositive, IsDateString, IsOptional } from 'class-validator';

export class AddProductToWarehouseDto {
    @IsUUID()
    warehouse_id!: string;
    
    @IsUUID()
    product_id!: string;

    @IsNumber()
    @IsPositive()
    amount!: number;

    @IsOptional()
    @IsDateString()
    expiration_date?: string;
}
