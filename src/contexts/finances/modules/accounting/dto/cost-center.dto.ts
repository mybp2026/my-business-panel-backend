import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCostCenterDto {
  @IsString()
  @MaxLength(20)
  center_code!: string;

  @IsString()
  @MaxLength(100)
  center_name!: string;
}

export class UpdateCostCenterDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  center_name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
