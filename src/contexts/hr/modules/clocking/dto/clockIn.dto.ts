import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { clockInDoc } from '@/docs/contexts/hr/clocking';

export class ClockInDto {
  @ApiProperty(clockInDoc.dto.employeeId)
  @IsUUID()
  employeeId!: string;

  @ApiProperty(clockInDoc.dto.branchId)
  @IsUUID()
  branchId!: string;
}