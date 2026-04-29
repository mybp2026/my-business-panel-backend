import { PartialType } from '@nestjs/mapped-types';
import { NewPromoDto } from './newPromo.dto';

export class UpdatePromotionDto extends PartialType(NewPromoDto) {}
