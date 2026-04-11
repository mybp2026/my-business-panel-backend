import { IsNumber, IsUUID } from "class-validator";

export class ReturnProductDto {
  @IsUUID()
  return_transaction_id!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unit_price!: number;

  @IsNumber()
  total_price!: number;

  @IsUUID()
  sale_item_id!: string;
}