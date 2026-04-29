import { Module } from '@nestjs/common';
import { AttributeValueService } from './attribute-value.service';
import { AttributeValueController } from './attribute-value.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    AttributeValueService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [AttributeValueController],
  exports: [AttributeValueService],
})
export class AttributeValueModule {}
