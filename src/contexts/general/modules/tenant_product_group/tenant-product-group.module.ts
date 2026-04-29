import { Module } from '@nestjs/common';
import { TenantProductGroupService } from './tenant-product-group.service';
import { TenantProductGroupController } from './tenant-product-group.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    TenantProductGroupService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [TenantProductGroupController],
  exports: [TenantProductGroupService],
})
export class TenantProductGroupModule {}
