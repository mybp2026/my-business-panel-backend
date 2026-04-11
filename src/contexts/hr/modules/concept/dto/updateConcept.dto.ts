import { PartialType } from '@nestjs/mapped-types';
import { NewConceptDto } from './newConcept.dto';

export class UpdateConceptDto extends PartialType(NewConceptDto) {}
