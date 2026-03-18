import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';

@UseGuards(AuthenticationGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  createPurchaseOrder(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.createPurchaseOrder(createPurchaseDto);
  }

  @Post('twm')
  threeWayMatching(@Body() createPurchaseDto: any) {
    return this.purchaseService.threeWayMatching(createPurchaseDto);
  }

  @Post('payment')
  registerPayment(@Body() dto: CreatePaymentDto) {
    return this.purchaseService.registerPayment(dto);
  }

  @Get()
  getAllPurchaseOrders(@Session() session: IUserSession) {
    return this.purchaseService.getAllPurchaseOrders(session.tenant_id);
  }

  @Get(':id/matching')
  getThreeWayMatching(@Param('id') id: string) {
    return this.purchaseService.getThreeWayMatching(id);
  }

  @Get(':id')
  getPurchaseOrderById(@Param('id') id: string) {
    return this.purchaseService.getPurchaseOrderById(id);
  }

  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Session() session: IUserSession,
  ) {
    return this.purchaseService.updateOrderStatus(id, dto.status_id, session.tenant_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
    return this.purchaseService.updatePurchaseOrder(id, updatePurchaseDto);
  }
}