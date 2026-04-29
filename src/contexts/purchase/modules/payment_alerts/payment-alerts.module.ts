import { Module } from '@nestjs/common';
import { PaymentAlertsService } from './payment-alerts.service';
import { PaymentAlertsController } from './payment-alerts.controller';

@Module({
  controllers: [PaymentAlertsController],
  providers: [PaymentAlertsService],
})
export class PaymentAlertsModule {}
