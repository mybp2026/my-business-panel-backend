import { PartialType } from '@nestjs/swagger';
import { CreatePaymentAlertDto } from './create-payment_alert.dto';

export class UpdatePaymentAlertDto extends PartialType(CreatePaymentAlertDto) {}
