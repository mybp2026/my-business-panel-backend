import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentAlertsService } from './payment-alerts.service';
import { CreatePaymentAlertDto } from './dto/create-payment_alert.dto';
import { UpdatePaymentAlertDto } from './dto/update-payment_alert.dto';

@Controller('payment-alerts')
export class PaymentAlertsController {
  constructor(private readonly paymentAlertsService: PaymentAlertsService) {}

  @Post()
  create(@Body() createPaymentAlertDto: CreatePaymentAlertDto) {
    return this.paymentAlertsService.create(createPaymentAlertDto);
  }

  @Get()
  findAll() {
    return this.paymentAlertsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentAlertsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentAlertDto: UpdatePaymentAlertDto,
  ) {
    return this.paymentAlertsService.update(+id, updatePaymentAlertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentAlertsService.remove(+id);
  }
}
