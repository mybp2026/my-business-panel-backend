import { Module } from '@nestjs/common';
import { GlobalAttributeService } from './global-attribute.service';
import { GlobalAttributeController } from './global-attribute.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    GlobalAttributeService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [GlobalAttributeController],
  exports: [GlobalAttributeService],
})
export class GlobalAttributeModule {}
