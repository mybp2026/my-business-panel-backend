import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { hrQueries } from '@hr/hr.queries';
import { Turn } from './interface/turns.interface';
import { RegisterTurnDto, UpdateTurnDto } from './dto/create_turn.dto';
import { CreateTurnError } from '@/common/errors/create_turn.error';

const { turns } = hrQueries;

@Injectable()
export class TurnsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getTurnsByBranch(branchId: string): Promise<Turn[]> {
    try {
      const res = await this.db.query(turns.getByBranch, [branchId]);

      if (res.rows.length === 0) return [];

      return res.rows;
    } catch (error) {
      throw new Error('Failed to get turns by branch');
    }
  }

  async createNewTurn(data: RegisterTurnDto) {
    try {
      const { branchId, entry, out } = data;

      const res = await this.db.query(turns.create, [branchId, entry, out]);

      if (res.rows.length === 0) throw new CreateTurnError();

      return {
        message: 'Turn created successfully',
        turnId: res.rows[0].turn_id,
      };
    } catch (error) {
      throw new Error(`Failed to create turn. Internal error.`);
    }
  }

  async updateTurn(turnId: number, data: UpdateTurnDto) {
    try {
      const { entry, out } = data;

      const res = await this.db.query(turns.updateTurn, [entry, out, turnId]);

      if (res.rows.length === 0) throw new Error('Failed to update turn');

      return {
        message: 'Turn updated successfully',
        turnId: res.rows[0].turn_id,
      };
    } catch (error) {
      throw new Error(
        `Failed to update turn. Internal error. Check the body: ${error}`,
      );
    }
  }

  async deleteTurn(turnId: number) {
    try {
      const res = await this.db.query(turns.deleteTurn, [turnId]);
      if (res.rows.length === 0) throw new Error('Failed to delete turn');

      return {
        message: 'Turn deleted successfully',
        turnId: res.rows[0].turn_id,
      };
    } catch (error) {
      throw new Error(`Failed to delete turn. Internal error.`);
    }
  }
}
