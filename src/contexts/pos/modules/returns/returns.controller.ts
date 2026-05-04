import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { ReturnTransactionDto } from './dto/return_transaction.dto';
import { FindReturnsDto } from './dto/find_returns.dto';
import {
  createReturnTransactionDoc,
  findReturnsDoc,
} from '@/docs/contexts/pos/returns';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @ApiOperation(createReturnTransactionDoc.operation)
  @ApiResponse(createReturnTransactionDoc.responses[201])
  @ApiResponse(createReturnTransactionDoc.responses[500])
  @ApiResponse(createReturnTransactionDoc.responses[401])
  @Post()
  createReturnTransaction(@Body() req: ReturnTransactionDto) {
    return this.returnsService.createPartialRefund(req);
  }

  @ApiOperation(findReturnsDoc.operation)
  @ApiResponse(findReturnsDoc.responses[200])
  @ApiResponse(findReturnsDoc.responses[401])
  @Get()
  findReturns(@Query() findReturnsDto: FindReturnsDto) {
    return this.returnsService.findReturns(findReturnsDto);
  }

  @Get(':id/detail')
  getReturnDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnsService.getReturnDetail(id);
  }

  /**
   * Get the full refund context (sale + digital + electronic invoices + items)
   * for a given sale_id. Used by the refunds UI to populate fields after
   * the user enters a sale ID.
   */
  @Get('sale/:saleId')
  getSaleRefundContext(@Param('saleId', ParseUUIDPipe) saleId: string) {
    return this.returnsService.getSaleRefundContext(saleId);
  }

  /**
   * Full refund: deletes the digital and electronic invoice records for a sale.
   */
  @Delete('sale/:saleId')
  processFullRefund(@Param('saleId', ParseUUIDPipe) saleId: string) {
    return this.returnsService.processFullRefund(saleId);
  }
}
