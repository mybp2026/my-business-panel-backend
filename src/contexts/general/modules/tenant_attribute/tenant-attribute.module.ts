import { Module } from '@nestjs/common';
import { TenantAttributeService } from './tenant-attribute.service';
import { TenantAttributeController } from './tenant-attribute.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    TenantAttributeService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [TenantAttributeController],
  exports: [TenantAttributeService],
})
export class TenantAttributeModule {}
