import { PartialType } from '@nestjs/mapped-types';
import { NewLoyalProgramDto } from './newLoyalProgram.dto';

export class UpdateLoyalProgramDto extends PartialType(NewLoyalProgramDto) {}
