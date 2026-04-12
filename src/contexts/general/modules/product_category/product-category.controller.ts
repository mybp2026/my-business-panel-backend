import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductCategoryService } from './product-category.service';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import {
  getAllCategoriesDoc,
  createProductCategoryDoc,
  updateProductCategoryDoc,
  deleteProductCategoryDoc,
} from '@/docs/contexts/general/product_category';

// ? UseGuards(AuthorizationGuard)
@ApiTags('Product Category')
@Controller('category')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @ApiOperation(getAllCategoriesDoc.operation)
  @ApiResponse(getAllCategoriesDoc.responses[200])
  @ApiResponse(getAllCategoriesDoc.responses[401])
  @Get()
  async getAll() {
    return this.productCategoryService.getAllCategories();
  }

  @ApiOperation(createProductCategoryDoc.operation)
  @ApiResponse(createProductCategoryDoc.responses[201])
  @ApiResponse(createProductCategoryDoc.responses[400])
  @ApiResponse(createProductCategoryDoc.responses[401])
  @Post()
  async createCategory(@Body() req: { name: string }) {
    return this.productCategoryService.createCategory(req.name);
  }

  @ApiOperation(updateProductCategoryDoc.operation)
  @ApiResponse(updateProductCategoryDoc.responses[200])
  @ApiResponse(updateProductCategoryDoc.responses[401])
  @ApiResponse(updateProductCategoryDoc.responses[404])
  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() req: { name: string }) {
    return this.productCategoryService.updateCategory(id, req.name);
  }

  @ApiOperation(deleteProductCategoryDoc.operation)
  @ApiResponse(deleteProductCategoryDoc.responses[200])
  @ApiResponse(deleteProductCategoryDoc.responses[401])
  @ApiResponse(deleteProductCategoryDoc.responses[404])
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.productCategoryService.deleteCategory(id);
  }
}
