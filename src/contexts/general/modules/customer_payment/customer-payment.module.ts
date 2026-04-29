import { Module } from '@nestjs/common';
import { CustomerPaymentController } from './customer-payment.controller';
import { CustomerPaymentService } from './customer-payment.service';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  controllers: [CustomerPaymentController],
  providers: [
    CustomerPaymentService,
    RoleAuthorizationGuard,
    LevelAuthorizationGuard,
  ],
})
export class CustomerPaymentModule {}
