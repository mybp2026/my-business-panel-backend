import { Module } from '@nestjs/common';
import { ProductCompositionService } from './product-composition.service';
import { ProductCompositionController } from './product-composition.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    ProductCompositionService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [ProductCompositionController],
  exports: [ProductCompositionService],
})
export class ProductCompositionModule {}
