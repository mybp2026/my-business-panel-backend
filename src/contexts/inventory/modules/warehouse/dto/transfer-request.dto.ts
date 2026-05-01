import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from 'class-validator';

export class TransferRequestProductDto {
  @IsUUID()
  product_variant_id!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;
}

export class CreateTransferRequestDto {
  @IsUUID()
  from_warehouse_id!: string;

  @IsUUID()
  to_warehouse_id!: string;

  @IsOptional()
  @IsDateString()
  inventory_transfer_departure_date?: string | null;

  @IsOptional()
  @IsDateString()
  inventory_transfer_arrival_date?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferRequestProductDto)
  products!: TransferRequestProductDto[];
}

export enum TransferRequestStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export class UpdateTransferRequestStatusDto {
  @IsEnum(TransferRequestStatus)
  status!: TransferRequestStatus;

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
