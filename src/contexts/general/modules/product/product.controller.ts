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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductInsertDto } from './dto/newProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { isUUID } from 'class-validator';
import {
  getAllProductsByTenantDoc,
  getProductBySkuDoc,
  createNewProductDoc,
  updateProductDoc,
  deleteProductDoc,
} from '@/docs/contexts/general/product';

// ? @UseGuards(AuthorizationGuard)
@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ? Apply pagination
  @ApiOperation(getAllProductsByTenantDoc.operation)
  @ApiResponse(getAllProductsByTenantDoc.responses[200])
  @ApiResponse(getAllProductsByTenantDoc.responses[400])
  @ApiResponse(getAllProductsByTenantDoc.responses[401])
  @Get(':tenantId')
  async getAllProductsByTenant(@Param('tenantId') tenantId: string) {
    if (!tenantId || !isUUID(tenantId) ) {
      throw new InternalServerErrorException('Tenant ID is required');
    }
    return this.productService.getAllProducts(tenantId);
  }

  @ApiOperation(getProductBySkuDoc.operation)
  @ApiResponse(getProductBySkuDoc.responses[200])
  @ApiResponse(getProductBySkuDoc.responses[401])
  @Get('sku/:sku')
  async getProductBySku(@Param('sku') sku: string) {
    return this.productService.getProductBySku(sku)
  }

  @ApiOperation(createNewProductDoc.operation)
  @ApiResponse(createNewProductDoc.responses[201])
  @ApiResponse(createNewProductDoc.responses[400])
  @ApiResponse(createNewProductDoc.responses[401])
  @Post()
  async createNewProduct(@Body() req: ProductInsertDto) {
    return this.productService.createProduct(req);
  }

  @ApiOperation(updateProductDoc.operation)
  @ApiResponse(updateProductDoc.responses[200])
  @ApiResponse(updateProductDoc.responses[400])
  @ApiResponse(updateProductDoc.responses[401])
  @Patch(':id')
  async updateProduct(@Param('id') id: string, @Body() req: UpdateProductDto) {
    return this.productService.updateProduct(req, id);
  }

  @ApiOperation(deleteProductDoc.operation)
  @ApiResponse(deleteProductDoc.responses[200])
  @ApiResponse(deleteProductDoc.responses[401])
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
