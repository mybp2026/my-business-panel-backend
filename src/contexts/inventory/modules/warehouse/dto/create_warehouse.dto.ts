import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWarehouseDto {
    @IsUUID()
    @IsNotEmpty()
    branch_id!: string;

    @IsString()
    @IsNotEmpty()
    warehouse_name!: string;

    @IsString()
    @IsNotEmpty()
    warehouse_address!: string;
}