import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class FindReturnsDto {
  @IsOptional()
  @IsUUID()
  invoice_id?: string;

  @IsOptional()
  @IsUUID()
  tenant_customer_id?: string;

  @IsOptional()
  @IsNumberString()
  return_status_id?: string;

  @IsOptional()
  @IsNumberString()
  refund_method?: string;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;
}
