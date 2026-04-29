import { IsString, IsUUID } from 'class-validator';

export class CountAllInWarehouseDto {
    @IsUUID()
    warehouse_id!: string
}