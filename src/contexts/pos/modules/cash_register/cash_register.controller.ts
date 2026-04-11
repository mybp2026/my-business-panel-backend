import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CashRegisterService } from './cash_register.service';
import { CreateCashRegisterDto } from './dto/create_cash_register.dto';
import { UpdateCashRegisterDto } from './dto/update_cash_register.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { UseGuards } from '@nestjs/common';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { StartCashRegisterSessionDto } from './dto/start_cash_register_session.dto';
import { CloseCashRegisterSessionDto } from './dto/close_cash_register_session.dto';

@UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
@Controller('cash-register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @RequiredLevel(4)
  @Post()
  create(
    @Body() createCashRegisterDto: CreateCashRegisterDto,
    @Session() session: IUserSession,
  ) {
    return this.cashRegisterService.create(
      session.tenant_id,
      createCashRegisterDto,
    );
  }

  @RequiredLevel(2)
  @Get()
  find(@Query() query: { branch_id?: string }) {
    return query.branch_id
      ? this.cashRegisterService.findByBranch(query.branch_id)
      : this.cashRegisterService.findAll();
  }

  @RequiredLevel(1)
  @Post('start')
  startSession(
    @Session() session: IUserSession,
    @Body() startSessionDto: StartCashRegisterSessionDto,
  ) {
    return this.cashRegisterService.startSession(
      session.user_id,
      startSessionDto,
    );
  }

  @RequiredLevel(1)
  @Post('close')
  closeSession(@Body() closeSessionDto: CloseCashRegisterSessionDto) {
    return this.cashRegisterService.closeSession(closeSessionDto);
  }

  @RequiredLevel(1)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashRegisterService.findById(id);
  }

  @RequiredLevel(4)
  @Put(':id')
  update(@Body() updateCashRegisterDto: UpdateCashRegisterDto) {
    return this.cashRegisterService.update(updateCashRegisterDto);
  }

  @RequiredLevel(4)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashRegisterService.remove(id);
  }
}
