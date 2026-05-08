import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { RegisterFoulDto } from './dto/create_foul.dto';
import { hrQueries } from '@hr/hr.queries';
import { CreateFoulError } from '@/common/errors/foul_create.error';
import { Cron, CronExpression } from '@nestjs/schedule';

const { foul } = hrQueries;

@Injectable()
export class FoulService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async registerFoul(data: RegisterFoulDto) {
    try {
      const {
        employee_id,
        branch_id,
        identificator,
        foul_date,
        foul_hour,
        description,
      } = data;

      const res = await this.db.query(foul.create, [
        employee_id,
        branch_id,
        identificator,
        foul_date,
        foul_hour,
        description,
      ]);

      if (res.rows.length === 0) throw new CreateFoulError();

      return {
        message: 'Foul registered succesfully',
        foulId: res.rows[0].foul_id,
      };
    } catch (error) {
      console.log(`Error registering foul: ${error}`);
      throw new CreateFoulError();
    }
  }

  async getFoulsByEmployee(employeeId: string) {
    try {
      const count = await this.db.query(foul.foulCounts, [employeeId]);
      const fouls = await this.db.query(foul.getByEmployee, [employeeId]);

      return {
        totalFouls: count.rows[0].total_fouls,
        fouls: fouls.rows,
      };
    } catch (error) {
      console.log(`Error fetching fouls for employee ${employeeId}: ${error}`);
      throw new Error('Failed to fetch fouls for employee');
    }
  }

  async getFoulsByBranch(branchId: string) {
    try {
      const count = await this.db.query(foul.foulCountByBranch, [branchId]);
      const fouls = await this.db.query(foul.getByBranch, [branchId]);

      return {
        totalFouls: count.rows[0].total_fouls,
        fouls: fouls.rows,
      };
    } catch (error) {
      console.log(`Error fetching fouls for branch ${branchId}: ${error}`);
      throw new Error('Failed to fetch fouls for branch');
    }
  }

  async getFoulsByPeriod(startDate: string, endDate: string) {
    try {
      const fouls = await this.db.query(foul.getByPeriod, [startDate, endDate]);

      return fouls.rows;
    } catch (error) {
      console.log(
        `Error fetching fouls for period ${startDate} to ${endDate}: ${error}`,
      );
      throw new Error('Failed to fetch fouls for specified period');
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanFoulsByBranch() {
    try {
      console.log(
        'Starting scheduled task: Cleaning old fouls for all branches',
      );
      const config = await this.db.query(foul.getConfigforBranch);
      console.log(`Fetched configuration for ${config.rows.length} branches`);

      for (const c of config.rows) {
        const res = await this.db.query(foul.cleanOldFouls, [
          c.branch_id,
          c.foul_expiration_months,
        ]);
        if (res.rowCount && res.rowCount > 0) {
          console.log(
            `Cleaned ${res.rowCount} fouls for branch ${c.branch_id} older than ${c.foul_expiration_months} months.`,
          );
        }
      }
    } catch (error) {
      console.log(`Error cleaning old fouls: ${error}`);
      throw new Error('Failed to clean old fouls');
    }
  }
}
