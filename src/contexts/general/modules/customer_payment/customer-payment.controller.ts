import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerPaymentService } from '@/contexts/general/modules/customer_payment/customer-payment.service';
import { NewCustomerPaymentDto, testdto } from './dto/NewCustomerPayment.dto';
import {
  getAllPaymentsDoc,
  getCustomerPaymentsDoc,
  newPaymentDoc,
  bulkInsertDoc,
  deleteCustomerPaymentDoc,
} from '@/docs/contexts/general/customer_payment';

// ? @UseGuards(AuthorizationGuard)
@ApiTags('Payment')
@Controller('payment')
export class CustomerPaymentController {
  constructor(private readonly paymentsService: CustomerPaymentService) {}

  @ApiOperation(getAllPaymentsDoc.operation)
  @ApiResponse(getAllPaymentsDoc.responses[200])
  @Get()
  async getAllPayments() {
    return this.paymentsService.getEveryPayment();
  }

  @ApiOperation(getCustomerPaymentsDoc.operation)
  @ApiResponse(getCustomerPaymentsDoc.responses[200])
  @Get(':id')
  async getCustomerPayments(@Param('id') id: string) {
    return this.paymentsService.getCustomerPayments(id);
  }

  @ApiOperation(newPaymentDoc.operation)
  @ApiResponse(newPaymentDoc.responses[201])
  @ApiResponse(newPaymentDoc.responses[400])
  @Post()
  async newPayment(@Body() req: NewCustomerPaymentDto) {
    return this.paymentsService.createCustomerPayment(req);
  }

  @ApiOperation(bulkInsertDoc.operation)
  @ApiResponse(bulkInsertDoc.responses[201])
  @ApiResponse(bulkInsertDoc.responses[400])
  @Post('bulk')
  async bulkInsert(@Body() req: testdto) {
    return this.paymentsService.bulkInsert(req.payments, req.sale_id);
  }

  @ApiOperation(deleteCustomerPaymentDoc.operation)
  @ApiResponse(deleteCustomerPaymentDoc.responses[200])
  @ApiResponse(deleteCustomerPaymentDoc.responses[400])
  @Delete(':id')
  async deleteCustomerPayment(@Param('id') id: string) {
    return this.paymentsService.deleteCustomerPayment(id);
  }
}
