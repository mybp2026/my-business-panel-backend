import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [ProductService, RoleAuthorizationGuard, LevelAuthorizationGuard],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
