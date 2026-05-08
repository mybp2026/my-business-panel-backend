import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RegisterTurnDto {
  @IsNotEmpty()
  @IsUUID()
  branchId!: string;

  @IsNotEmpty()
  @IsString()
  entry!: string;

  @IsNotEmpty()
  @IsString()
  out!: string;
}

export class UpdateTurnDto extends PartialType(RegisterTurnDto) {}
