import { PartialType } from '@nestjs/mapped-types';
import { NewTenantDto } from './newTenant.dto';

export class UpdateTenantDto extends PartialType(NewTenantDto) {}
