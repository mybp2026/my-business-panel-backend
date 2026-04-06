import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { ClockInDto } from './dto/clockIn.dto';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeNotFoundError } from '@/common/errors/employee_not_found.error';
import { hrQueries } from '@hr/hr.queries';

const { turns, clocking, tardiness } = hrQueries;

@Injectable()
export class ClockingService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly employeeService: EmployeeService,
  ) {}

  async registerClockIn(data: ClockInDto) {
    const { employeeId, branchId } = data;

    const employee = await this.employeeService.getEmployeeById(employeeId);

    if (!employee) {
      throw new EmployeeNotFoundError(employeeId);
    }

    const turn = await this.db.query(turns.getEntry, [employee.turn_id]);

    const clockInRecord = await this.db.query(clocking.clock_in, [
      employeeId,
      branchId,
    ]);

    if (clockInRecord.rows.length === 0) {
      throw new Error('Failed to register clock-in. Check the provided data.');
    }

    let alertMessage = 'Clock-in registered successfully';

    if (turn.rows.length > 0) {
      const entry = turn.rows[0].entry;
      const now = new Date();
      const [hours, minutes] = entry.split(':').map(Number);

      const scheduled = new Date();
      scheduled.setHours(hours, minutes, 0, 0);

      if (now > scheduled) {
        const diffInMinutes = Math.floor(
          (now.getTime() - scheduled.getTime()) / 60000,
        );
        alertMessage += `. Note: Clocking in ${diffInMinutes} minutes late.`;
        await this.db.query(tardiness.create, [
          employeeId,
          branchId,
          'late',
          `${employee.first_name} ${employee.last_name} clocked in ${diffInMinutes} minutes late on ${new Date().toISOString()}`,
        ]);
        console.warn(alertMessage);
      } else {
        const diffInMinutes = Math.floor(
          (scheduled.getTime() - now.getTime()) / 60000,
        );
        alertMessage += `. Note: Clocking in ${diffInMinutes} minutes early.`;
        await this.db.query(tardiness.create, [
          employeeId,
          branchId,
          'early',
          `${employee.first_name} ${employee.last_name} clocked in ${diffInMinutes} minutes early on ${new Date().toISOString()}`,
        ]);
        console.warn(alertMessage);
      }
    }

    return {
      message: alertMessage,
      clockIn: clockInRecord.rows[0].clocking_id,
    };
  }

  async registerClockOut(employeeId: string) {
    const emp = await this.employeeService.getEmployeeById(employeeId);

    if (!emp) {
      throw new EmployeeNotFoundError(employeeId);
    }

    const turn = await this.db.query(turns.getOut, [emp.turn_id]);

    const clockOutRecord = await this.db.query(clocking.clock_out, [
      employeeId,
    ]);

    if (clockOutRecord.rows.length === 0) {
      throw new Error('Failed to register clock-out. Check the provided data.');
    }

    let alertMessage = 'Clock-out registered successfully';

    if (turn.rows.length > 0) {
      const out = turn.rows[0].out;
      const now = new Date();
      const [hours, minutes] = out.split(':').map(Number);

      const scheduled = new Date();
      scheduled.setHours(hours, minutes, 0, 0);
      if (now < scheduled) {
        const diffInMinutes = Math.floor(
          (scheduled.getTime() - now.getTime()) / 60000,
        );
        alertMessage += `. Note: You are clocking out ${diffInMinutes} minutes early.`;
        await this.db.query(tardiness.create, [
          employeeId,
          emp.branch_id,
          'early',
          `${emp.first_name} ${emp.last_name} clocked out ${diffInMinutes} minutes early on ${new Date().toISOString()}`,
        ]);
        console.warn(alertMessage);
      } else {
        const diffInMinutes = Math.floor(
          (now.getTime() - scheduled.getTime()) / 60000,
        );
        if (diffInMinutes > 0) {
          alertMessage += `. Note: You are clocking out ${diffInMinutes} minutes late.`;
          await this.db.query(tardiness.create, [
            employeeId,
            emp.branch_id,
            'late',
            `${emp.first_name} ${emp.last_name} clocked out ${diffInMinutes} minutes late on ${new Date().toISOString()}`,
          ]);
          console.warn(alertMessage);
        }
      }
    }

    return {
      message: alertMessage,
      clockOut: clockOutRecord.rows[0].clocking_id,
    };
  }
}
