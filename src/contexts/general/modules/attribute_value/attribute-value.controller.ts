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
import { AttributeValueService } from './attribute-value.service';
import {
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from './dto/attribute-value.dto';

@ApiTags('Attribute Value')
@Controller('attribute-value')
export class AttributeValueController {
  constructor(private readonly service: AttributeValueService) {}

  @Get(':tenantId/by-attribute/:tenantAttributeId')
  async getByTenantAttribute(
    @Param('tenantId') tenantId: string,
    @Param('tenantAttributeId') tenantAttributeId: string,
  ) {
    return this.service.getByTenantAttribute(tenantAttributeId, tenantId);
  }

  @Get(':tenantId/:id')
  async getById(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.getById(id, tenantId);
  }

  @Post()
  async create(@Body() body: CreateAttributeValueDto) {
    return this.service.create(body);
  }

  @Patch(':tenantId/:id')
  async update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateAttributeValueDto,
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
