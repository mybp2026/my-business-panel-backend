import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { registerFoulDoc } from '@/docs/contexts/hr/foul';

const { dto } = registerFoulDoc;

export class RegisterFoulDto {
  @ApiProperty(dto.employee_id)
  @IsNotEmpty()
  @IsUUID()
  employee_id!: string;

  @ApiProperty(dto.branch_id)
  @IsNotEmpty()
  @IsUUID()
  branch_id!: string;

  @ApiProperty(dto.identificator)
  @IsNotEmpty()
  @IsString()
  identificator!: string;

  @ApiProperty(dto.foul_date)
  @IsNotEmpty()
  @IsDateString()
  foul_date!: string;

  @ApiProperty(dto.foul_hour)
  @IsNotEmpty()
  @IsString()
  foul_hour!: string;

  @ApiProperty(dto.description)
  @IsNotEmpty()
  @IsString()
  description!: string;
}
