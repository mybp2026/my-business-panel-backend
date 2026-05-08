import { PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { NewMarginDto } from './newMargin.dto';

export class UpdateMarginDto extends PartialType(NewMarginDto) {}
