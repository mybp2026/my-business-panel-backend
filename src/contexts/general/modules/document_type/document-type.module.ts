import { Module } from '@nestjs/common';
import { DocumentTypeService } from './document-type.service';
import { DocumentTypeController } from './document-type.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [
    DocumentTypeService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
  controllers: [DocumentTypeController],
})
export class DocumentTypeModule {}
