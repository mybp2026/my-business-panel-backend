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
  createCategoryDoc,
  updateCategoryDoc,
  deleteCategoryDoc,
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
  @Get()
  async getAll() {
    return this.productCategoryService.getAllCategories();
  }

  @ApiOperation(createCategoryDoc.operation)
  @ApiResponse(createCategoryDoc.responses[201])
  @ApiResponse(createCategoryDoc.responses[400])
  @Post()
  async createCategory(@Body() req: { name: string }) {
    return this.productCategoryService.createCategory(req.name);
  }

  @ApiOperation(updateCategoryDoc.operation)
  @ApiResponse(updateCategoryDoc.responses[200])
  @ApiResponse(updateCategoryDoc.responses[400])
  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() req: { name: string }) {
    return this.productCategoryService.updateCategory(id, req.name);
  }

  @ApiOperation(deleteCategoryDoc.operation)
  @ApiResponse(deleteCategoryDoc.responses[200])
  @ApiResponse(deleteCategoryDoc.responses[400])
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.productCategoryService.deleteCategory(id);
  }
}
