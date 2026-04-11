import { Module } from '@nestjs/common';
import { CustomerSegmentMarginService } from './customer_segment_margin.service';
import { CustomerSegmentMarginController } from './customer_segment_margin.controller';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [CustomerSegmentMarginService, RoleAuthorizationGuard, LevelAuthorizationGuard],
  controllers: [CustomerSegmentMarginController],
})
export class CustomerSegmentMarginModule {}
