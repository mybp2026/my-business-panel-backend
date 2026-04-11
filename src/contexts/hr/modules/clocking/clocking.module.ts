import { Module } from '@nestjs/common';
import { ClockingService } from './clocking.service';
import { ClockingController } from './clocking.controller';
import { EmployeeService } from '../employee/employee.service';

@Module({
  providers: [ClockingService, EmployeeService],
  controllers: [ClockingController],
})
export class ClockingModule {}
