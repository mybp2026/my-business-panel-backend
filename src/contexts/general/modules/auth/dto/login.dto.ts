import { loginDoc } from '@/docs/contexts/general/auth/login.doc';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty(loginDoc.dto.email)
  @IsString()
  email!: string;

  @ApiProperty(loginDoc.dto.password)
  @IsString()
  password!: string;
}
