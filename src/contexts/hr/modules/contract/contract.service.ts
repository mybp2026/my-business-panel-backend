import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { ContractDto } from '../employee/dto/newEmployeeDto.dto';
import { hrQueries } from '@hr/hr.queries';
import { Contract } from '../employee/interface/employee.interface';

const { contract } = hrQueries;

@Injectable()
export class ContractService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async updateContract(contract_id: string, data: ContractDto) {
    const existingContract = await this.db.query(contract.byId, [contract_id]);

    if (existingContract.rows.length === 0) {
      throw new Error(`Contract with id ${contract_id} not found.`);
    }

    const { start_date, end_date, hours, base_salary, duties } = data;

    const updatedContract = await this.db.query(contract.update, [
      start_date,
      end_date,
      hours,
      base_salary,
      duties,
      contract_id,
    ]);

    return {
      message: 'Contract updated successfully',
      contract: updatedContract.rows[0],
    };
  }

  async getContractById(contract_id: string): Promise<Contract | null> {
    const result = await this.db.query(contract.byId, [contract_id]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }
}
