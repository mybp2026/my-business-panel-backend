import { Module } from '@nestjs/common';
import { ProductVariantGroupAssignmentService } from './product-variant-group-assignment.service';
import { ProductVariantGroupAssignmentController } from './product-variant-group-assignment.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    ProductVariantGroupAssignmentService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [ProductVariantGroupAssignmentController],
  exports: [ProductVariantGroupAssignmentService],
})
export class ProductVariantGroupAssignmentModule {}
