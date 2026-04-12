import { Body, Get, Controller, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { ReturnTransactionDto } from './dto/return_transaction.dto';
import { FindReturnsDto } from './dto/find_returns.dto';
import { UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';
import {
  createReturnTransactionDoc,
  findReturnsDoc,
} from '@/docs/contexts/pos/returns';

// @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  // @RequiredLevel(2)
  @ApiOperation(createReturnTransactionDoc.operation)
  @ApiResponse(createReturnTransactionDoc.responses[201])
  @ApiResponse(createReturnTransactionDoc.responses[500])
  @ApiResponse(createReturnTransactionDoc.responses[401])
  @Post()
  createReturnTransaction(@Body() req: ReturnTransactionDto) {
    return this.returnsService.createNewFullReturn(req);
  }

  // @RequiredLevel(2)
  @ApiOperation(findReturnsDoc.operation)
  @ApiResponse(findReturnsDoc.responses[200])
  @ApiResponse(findReturnsDoc.responses[401])
  @Get()
  findReturns(@Query() findReturnsDto: FindReturnsDto) {
    return this.returnsService.findReturns(findReturnsDto);
  }
}
