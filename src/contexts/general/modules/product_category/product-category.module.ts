import { Module } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { ProductCategoryController } from './product-category.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    ProductCategoryService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [ProductCategoryController],
})
export class ProductCategoryModule {}
