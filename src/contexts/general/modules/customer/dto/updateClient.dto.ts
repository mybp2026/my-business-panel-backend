import { PartialType } from '@nestjs/mapped-types';
import { NewClientDto } from './newClient.dto';

export class UpdateClientDto extends PartialType(NewClientDto) {}
