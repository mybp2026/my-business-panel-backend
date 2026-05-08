import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantProductGroupTypeService } from './tenant-product-group-type.service';
import {
  CreateTenantProductGroupTypeDto,
  UpdateTenantProductGroupTypeDto,
} from './dto/tenant-product-group-type.dto';

@ApiTags('Tenant Product Group Type')
@Controller('tenant-product-group-type')
export class TenantProductGroupTypeController {
  constructor(private readonly service: TenantProductGroupTypeService) {}

  @Get(':tenantId')
  async getByTenant(@Param('tenantId') tenantId: string) {
    return this.service.getByTenant(tenantId);
  }

  @Get(':tenantId/:id')
  async getById(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.getById(id, tenantId);
  }

  @Post()
  async create(@Body() body: CreateTenantProductGroupTypeDto) {
    return this.service.create(body);
  }

  @Patch(':tenantId/:id')
  async update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateTenantProductGroupTypeDto,
  ) {
    return this.service.update(id, tenantId, body);
  }

  @Delete(':tenantId/:id')
  async delete(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.delete(id, tenantId);
  }
}
