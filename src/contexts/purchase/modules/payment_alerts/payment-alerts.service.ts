import { Injectable } from '@nestjs/common';
import { CreatePaymentAlertDto } from './dto/create-payment_alert.dto';
import { UpdatePaymentAlertDto } from './dto/update-payment_alert.dto';
import { purchaseQueries } from '@purchase/purchase.queries';

const { payments } = purchaseQueries;

@Injectable()
export class PaymentAlertsService {
  create(createPaymentAlertDto: CreatePaymentAlertDto) {
    return 'This action adds a new paymentAlert';
  }

  findAll() {
    return `This action returns all paymentAlerts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentAlert`;
  }

  update(id: number, updatePaymentAlertDto: UpdatePaymentAlertDto) {
    return `This action updates a #${id} paymentAlert`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentAlert`;
  }
}
