import { Module } from '@nestjs/common';
import { IdentificationTypeService } from './identification-type.service';
import { IdentificationTypeController } from './identification-type.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    IdentificationTypeService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [IdentificationTypeController],
})
export class IdentificationTypeModule {}
