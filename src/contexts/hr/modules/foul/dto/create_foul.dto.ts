import { IsDateString, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class RegisterFoulDto {
  @IsNotEmpty()
  @IsUUID()
  employee_id!: string;

  @IsNotEmpty()
  @IsUUID()
  branch_id!: string;

  @IsNotEmpty()
  @IsString()
  identificator!: string;

  @IsNotEmpty()
  @IsDateString()
  foul_date!: string;

  @IsNotEmpty()
  @IsString()
  foul_hour!: string;

  @IsNotEmpty()
  @IsString()
  description!: string; 
}