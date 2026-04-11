import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsNumber()
  @IsNotEmpty()
  role_id!: number;
}
