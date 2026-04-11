import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentAlertsService } from './payment-alerts.service';
import { CreatePaymentAlertDto } from './dto/create-payment_alert.dto';
import { UpdatePaymentAlertDto } from './dto/update-payment_alert.dto';
import {
  createPaymentAlertDoc,
  findAllPaymentAlertsDoc,
  findOnePaymentAlertDoc,
  updatePaymentAlertDoc,
  removePaymentAlertDoc,
} from '@/docs/contexts/purchase/payment_alerts';

@ApiTags('Payment Alerts')
@Controller('payment-alerts')
export class PaymentAlertsController {
  constructor(private readonly paymentAlertsService: PaymentAlertsService) {}

  @ApiOperation(createPaymentAlertDoc.operation)
  @ApiResponse(createPaymentAlertDoc.responses[201])
  @ApiResponse(createPaymentAlertDoc.responses[400])
  @ApiResponse(createPaymentAlertDoc.responses[401])
  @Post()
  create(@Body() createPaymentAlertDto: CreatePaymentAlertDto) {
    return this.paymentAlertsService.create(createPaymentAlertDto);
  }

  @ApiOperation(findAllPaymentAlertsDoc.operation)
  @ApiResponse(findAllPaymentAlertsDoc.responses[200])
  @ApiResponse(findAllPaymentAlertsDoc.responses[401])
  @Get()
  findAll() {
    return this.paymentAlertsService.findAll();
  }

  @ApiOperation(findOnePaymentAlertDoc.operation)
  @ApiResponse(findOnePaymentAlertDoc.responses[200])
  @ApiResponse(findOnePaymentAlertDoc.responses[401])
  @ApiResponse(findOnePaymentAlertDoc.responses[404])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentAlertsService.findOne(+id);
  }

  @ApiOperation(updatePaymentAlertDoc.operation)
  @ApiResponse(updatePaymentAlertDoc.responses[200])
  @ApiResponse(updatePaymentAlertDoc.responses[400])
  @ApiResponse(updatePaymentAlertDoc.responses[401])
  @ApiResponse(updatePaymentAlertDoc.responses[404])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentAlertDto: UpdatePaymentAlertDto,
  ) {
    return this.paymentAlertsService.update(+id, updatePaymentAlertDto);
  }

  @ApiOperation(removePaymentAlertDoc.operation)
  @ApiResponse(removePaymentAlertDoc.responses[200])
  @ApiResponse(removePaymentAlertDoc.responses[401])
  @ApiResponse(removePaymentAlertDoc.responses[404])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentAlertsService.remove(+id);
  }
}
