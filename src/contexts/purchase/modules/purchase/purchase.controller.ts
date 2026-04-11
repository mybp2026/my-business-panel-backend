import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import {
  createPurchaseOrderDoc,
  threeWayMatchingDoc,
  registerPaymentDoc,
  getAllPurchaseOrdersDoc,
  getPurchaseOrderByIdDoc,
  getThreeWayMatchingDoc,
  updateOrderStatusDoc,
  updatePurchaseOrderDoc,
} from '@/docs/contexts/purchase/purchase';

@ApiTags('Purchase')
@UseGuards(AuthenticationGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @ApiOperation(createPurchaseOrderDoc.operation)
  @ApiResponse(createPurchaseOrderDoc.responses[201])
  @ApiResponse(createPurchaseOrderDoc.responses[401])
  @Post()
  createPurchaseOrder(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.createPurchaseOrder(createPurchaseDto);
  }

  @ApiOperation(threeWayMatchingDoc.operation)
  @ApiResponse(threeWayMatchingDoc.responses[201])
  @ApiResponse(threeWayMatchingDoc.responses[400])
  @ApiResponse(threeWayMatchingDoc.responses[401])
  @Post('twm')
  threeWayMatching(@Body() createPurchaseDto: any) {
    return this.purchaseService.threeWayMatching(createPurchaseDto);
  }

  @ApiOperation(registerPaymentDoc.operation)
  @ApiResponse(registerPaymentDoc.responses[201])
  @ApiResponse(registerPaymentDoc.responses[400])
  @ApiResponse(registerPaymentDoc.responses[401])
  @Post('payment')
  registerPayment(@Body() dto: CreatePaymentDto) {
    return this.purchaseService.registerPayment(dto);
  }

  @ApiOperation(getAllPurchaseOrdersDoc.operation)
  @ApiResponse(getAllPurchaseOrdersDoc.responses[200])
  @ApiResponse(getAllPurchaseOrdersDoc.responses[401])
  @Get()
  getAllPurchaseOrders(@Session() session: IUserSession) {
    return this.purchaseService.getAllPurchaseOrders(session.tenant_id);
  }

  @ApiOperation(getThreeWayMatchingDoc.operation)
  @ApiResponse(getThreeWayMatchingDoc.responses[200])
  @ApiResponse(getThreeWayMatchingDoc.responses[401])
  @Get(':id/matching')
  getThreeWayMatching(@Param('id') id: string) {
    return this.purchaseService.getThreeWayMatching(id);
  }

  @ApiOperation(getPurchaseOrderByIdDoc.operation)
  @ApiResponse(getPurchaseOrderByIdDoc.responses[200])
  @ApiResponse(getPurchaseOrderByIdDoc.responses[401])
  @ApiResponse(getPurchaseOrderByIdDoc.responses[404])
  @Get(':id')
  getPurchaseOrderById(@Param('id') id: string) {
    return this.purchaseService.getPurchaseOrderById(id);
  }

  @ApiOperation(updateOrderStatusDoc.operation)
  @ApiResponse(updateOrderStatusDoc.responses[200])
  @ApiResponse(updateOrderStatusDoc.responses[400])
  @ApiResponse(updateOrderStatusDoc.responses[401])
  @ApiResponse(updateOrderStatusDoc.responses[404])
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Session() session: IUserSession,
  ) {
    return this.purchaseService.updateOrderStatus(id, dto.status_id, session.tenant_id);
  }

  @ApiOperation(updatePurchaseOrderDoc.operation)
  @ApiResponse(updatePurchaseOrderDoc.responses[200])
  @ApiResponse(updatePurchaseOrderDoc.responses[401])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
    return this.purchaseService.updatePurchaseOrder(id, updatePurchaseDto);
  }
}