import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductInsertDto } from './dto/newProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { isUUID } from 'class-validator';

// ? @UseGuards(AuthorizationGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ? Apply pagination
  @Get(':tenantId')
  async getAllProductsByTenant(@Param('tenantId') tenantId: string) {
    if (!tenantId || !isUUID(tenantId) ) {
      throw new InternalServerErrorException('Tenant ID is required');
    }
    return this.productService.getAllProducts(tenantId);
  }

  @Get('sku/:sku')
  async getProductBySku(@Param('sku') sku: string) {
    return this.productService.getProductBySku(sku)
  }

  @Post()
  async createNewProduct(@Body() req: ProductInsertDto) {
    return this.productService.createProduct(req);
  }

  @Patch(':id')
  async updateProduct(@Param('id') id: string, @Body() req: UpdateProductDto) {
    return this.productService.updateProduct(req, id);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
