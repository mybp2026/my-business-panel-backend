import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateDutiesTypeDto {
  @IsUUID()
  tenant_id!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDutiesTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
