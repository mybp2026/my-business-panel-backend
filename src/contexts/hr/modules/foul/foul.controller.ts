import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FoulService } from './foul.service';
import { RegisterFoulDto } from './dto/create_foul.dto';

@Controller('foul')
export class FoulController {
  constructor(private readonly foulService: FoulService) {}

  @Post()
  async createFoul(@Body() body: RegisterFoulDto) {
    return this.foulService.registerFoul(body);
  }

  @Get('employee/:employeeId')
  async getFoulsByEmployee(@Param('employeeId') employeeId: string) {
    return this.foulService.getFoulsByEmployee(employeeId);
  }

  @Get('branch/:branchId')
  async getFoulsByBranch(@Param('branchId') branchId: string) {
    return this.foulService.getFoulsByBranch(branchId);
  }

  @Get('/period')
  async getFoulsByPeriod(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.foulService.getFoulsByPeriod(start, end);
  }
}
