import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductCompositionService } from './product-composition.service';
import {
  ReplaceCompositionDto,
  UpdateComponentQuantityDto,
} from './dto/product-composition.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';

@ApiTags('Product Composition')
@Controller('product-composition')
@UseGuards(AuthenticationGuard)
export class ProductCompositionController {
  constructor(private readonly service: ProductCompositionService) {}

  @Get(':tenantId/parent/:parentId')
  async byParent(
    @Param('tenantId') tenantId: string,
    @Param('parentId') parentId: string,
  ) {
    return this.service.getByParent(tenantId, parentId);
  }

  @Get(':tenantId/child/:childId')
  async byChild(
    @Param('tenantId') tenantId: string,
    @Param('childId') childId: string,
  ) {
    return this.service.getByChild(tenantId, childId);
  }

  @Get(':tenantId/availability/:parentId/:warehouseId')
  async availability(
    @Param('tenantId') tenantId: string,
    @Param('parentId') parentId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return {
      available: await this.service.getAvailability(
        tenantId,
        parentId,
        warehouseId,
      ),
    };
  }

  @Post()
  @UseGuards(LevelAuthorizationGuard)
  @RequiredLevel(2)
  async replace(@Body() body: ReplaceCompositionDto) {
    return this.service.replace(body);
  }

  @Patch(':tenantId/parent/:parentId/component/:childId')
  async updateQuantity(
    @Param('tenantId') tenantId: string,
    @Param('parentId') parentId: string,
    @Param('childId') childId: string,
    @Body() body: UpdateComponentQuantityDto,
  ) {
    return this.service.updateQuantity(tenantId, parentId, childId, body);
  }

  @Delete(':tenantId/parent/:parentId')
  @UseGuards(LevelAuthorizationGuard)
  @RequiredLevel(2)
  async clear(
    @Param('tenantId') tenantId: string,
    @Param('parentId') parentId: string,
  ) {
    return this.service.deleteAllForParent(tenantId, parentId);
  }
}
