import { IsArray, IsUUID } from 'class-validator';
import { Item } from '../interface/sale-item.interface';

export class TestDto {
  @IsUUID()
  sale_id!: string;

  @IsArray()
  items!: Item[];
}
