import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [TenantService, LevelAuthorizationGuard],
  controllers: [TenantController],
})
export class TenantModule {}
