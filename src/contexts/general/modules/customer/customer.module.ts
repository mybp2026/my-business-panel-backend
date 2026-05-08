import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, RoleAuthorizationGuard, LevelAuthorizationGuard],
})
export class CustomerModule {}