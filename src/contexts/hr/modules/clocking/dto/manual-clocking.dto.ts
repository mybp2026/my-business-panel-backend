import { IsUUID, IsDateString, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ManualClockInDto {
  @ApiProperty({ description: 'Employee UUID' })
  @IsUUID()
  employeeId!: string;

  @ApiProperty({ description: 'Branch UUID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Clock-in timestamp (ISO 8601)', example: '2026-05-01T08:00:00' })
  @IsDateString()
  clockIn!: string;
}

export class ManualClockOutDto {
  @ApiProperty({ description: 'Clocking record ID to close' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clockingId!: number;

  @ApiProperty({ description: 'Clock-out timestamp (ISO 8601)', example: '2026-05-01T17:00:00' })
  @IsDateString()
  clockOut!: string;
}
