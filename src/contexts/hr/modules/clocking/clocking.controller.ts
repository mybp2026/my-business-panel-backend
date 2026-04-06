import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ClockingService } from './clocking.service';
import { ClockInDto } from './dto/clockIn.dto';

@Controller('clocking')
export class ClockingController {
  constructor(private readonly clockingService: ClockingService) {}

  @Post()
  async clockIn(@Body() data: ClockInDto) {
    return this.clockingService.registerClockIn(data);
  }

  @Patch()
  async clockOut(@Body() data: { employeeId: string }) {
    return this.clockingService.registerClockOut(data.employeeId);
  }
}
