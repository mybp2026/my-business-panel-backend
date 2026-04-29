import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductVariantGroupAssignmentService } from './product-variant-group-assignment.service';
import { ReplaceVariantGroupsDto } from './dto/product-variant-group-assignment.dto';

@ApiTags('Product Variant Group Assignment')
@Controller('product-variant-group')
export class ProductVariantGroupAssignmentController {
  constructor(
    private readonly service: ProductVariantGroupAssignmentService,
  ) {}

  @Get(':tenantId/variant/:variantId')
  async getByVariant(
    @Param('tenantId') tenantId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.service.getByVariant(tenantId, variantId);
  }

  @Get(':tenantId/group/:groupId/variants')
  async getVariantsByGroup(
    @Param('tenantId') tenantId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.service.getVariantsByGroup(tenantId, groupId);
  }

  @Post()
  async replace(@Body() body: ReplaceVariantGroupsDto) {
    return this.service.replaceForVariant(body);
  }
}
