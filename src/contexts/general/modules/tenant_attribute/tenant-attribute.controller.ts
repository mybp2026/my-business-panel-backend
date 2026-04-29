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
import { TenantAttributeService } from './tenant-attribute.service';
import {
  CreateTenantAttributeDto,
  UpdateTenantAttributeDto,
} from './dto/tenant-attribute.dto';

@ApiTags('Tenant Attribute')
@Controller('tenant-attribute')
export class TenantAttributeController {
  constructor(private readonly service: TenantAttributeService) {}

  @Get(':tenantId/search')
  async searchUnified(
    @Param('tenantId') tenantId: string,
    @Query('q') q = '',
    @Query('page') page = '1',
    @Query('limit') limit = '100',
  ) {
    return this.service.searchUnified(
      tenantId,
      q,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

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
  async create(@Body() body: CreateTenantAttributeDto) {
    return this.service.create(body);
  }

  @Patch(':tenantId/:id')
  async update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateTenantAttributeDto,
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
