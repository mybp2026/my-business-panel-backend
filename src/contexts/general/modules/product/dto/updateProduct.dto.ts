import { PartialType } from '@nestjs/mapped-types';
import { NewProductDto } from './newProduct.dto';

export class UpdateProductDto extends PartialType(NewProductDto) {}
