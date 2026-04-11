import { Body, Get, Controller, Post, Query } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnTransactionDto } from './dto/return_transaction.dto';
import { FindReturnsDto } from './dto/find_returns.dto';
import { UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';

// @UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  // @RequiredLevel(2)
  @Post()
  createReturnTransaction(@Body() req: ReturnTransactionDto) {
    return this.returnsService.createNewFullReturn(req);
  }

  // @RequiredLevel(2)
  @Get()
  findReturns(@Query() findReturnsDto: FindReturnsDto) {
    return this.returnsService.findReturns(findReturnsDto);
  }
}
