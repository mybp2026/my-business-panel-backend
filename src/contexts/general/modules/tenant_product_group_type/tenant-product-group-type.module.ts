import { Module } from '@nestjs/common';
import { TenantProductGroupTypeService } from './tenant-product-group-type.service';
import { TenantProductGroupTypeController } from './tenant-product-group-type.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    TenantProductGroupTypeService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [TenantProductGroupTypeController],
  exports: [TenantProductGroupTypeService],
})
export class TenantProductGroupTypeModule {}
