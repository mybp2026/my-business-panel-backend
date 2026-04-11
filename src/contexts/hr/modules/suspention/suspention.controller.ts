import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SuspentionService } from './suspention.service';

import {
  NewSuspentionDto,
  UpdateSuspention,
} from './dto/create_suspention.dto';

@Controller('suspention')
export class SuspentionController {
  constructor(private readonly suspentionService: SuspentionService) {}

  @Post()
  async registerNewSuspention(@Body() body: NewSuspentionDto) {
    return this.suspentionService.registerNewSuspention(body);
  }

  @Get('employee/:employeeId')
  async getSuspentionByEmployee(@Param('employeeId') id: string) {
    return this.suspentionService.getSuspentionsByEmployee(id);
  }

  @Get('branch/:branchId')
  async getSuspentionsByBranch(@Param('branchId') id: string) {
    return this.suspentionService.getSuspentionsByBranch(id);
  }

  @Patch(':suspentionId/close')
  async closeSuspention(@Param('suspentionId') id: string) {
    return this.suspentionService.closeSuspention(id);
  }

  @Patch(':suspentionId')
  async updateSuspention(
    @Param('suspentionId') id: string,
    @Body() body: UpdateSuspention,
  ) {
    return this.suspentionService.updateSuspention(id, body);
  }
}
