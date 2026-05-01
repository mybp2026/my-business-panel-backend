import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { RequiredRole } from '@/common/decorators/role_metadata.decorator';

import { ExchangeRateService } from './exchange-rate.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@ApiBearerAuth()
@ApiTags('Exchange Rate')
@Controller('exchange-rate')
@UseGuards(AuthenticationGuard)
export class ExchangeRateController {
  constructor(private readonly service: ExchangeRateService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get('latest')
  getLatest(
    @Query('from_currency_id', ParseIntPipe) from: number,
    @Query('to_currency_id', ParseIntPipe) to: number,
  ) {
    return this.service.getLatestForPair(from, to);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(RoleAuthorizationGuard)
  @RequiredRole('admin', 'superuser')
  create(@Body() dto: CreateExchangeRateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(RoleAuthorizationGuard)
  @RequiredRole('admin', 'superuser')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExchangeRateDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RoleAuthorizationGuard)
  @RequiredRole('admin', 'superuser')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
