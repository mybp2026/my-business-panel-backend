import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantProductGroupService } from './tenant-product-group.service';
import {
  CreateTenantProductGroupDto,
  UpdateTenantProductGroupDto,
} from './dto/tenant-product-group.dto';

@ApiTags('Tenant Product Group')
@Controller('tenant-product-group')
export class TenantProductGroupController {
  constructor(private readonly service: TenantProductGroupService) {}

  @Get(':tenantId')
  async list(@Param('tenantId') tenantId: string) {
    return this.service.getByTenant(tenantId);
  }

  @Get(':tenantId/tree')
  async tree(
    @Param('tenantId') tenantId: string,
    @Query('typeId') typeId: string,
  ) {
    return this.service.getTree(tenantId, typeId);
  }

  @Get(':tenantId/:id')
  async getById(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.getById(id, tenantId);
  }

  @Get(':tenantId/:id/descendants')
  async descendants(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.getDescendants(tenantId, id);
  }

  @Post()
  async create(@Body() body: CreateTenantProductGroupDto) {
    return this.service.create(body);
  }

  @Patch(':tenantId/:id')
  async update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateTenantProductGroupDto,
  ) {
    return this.service.update(id, tenantId, body);
  }

  @Delete(':tenantId/:id')
  async delete(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.delete(id, tenantId);
  }
}
