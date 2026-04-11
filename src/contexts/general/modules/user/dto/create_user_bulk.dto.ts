import { CreateUserDto } from './create_user.dto';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserBulkDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users!: CreateUserDto[];
}
