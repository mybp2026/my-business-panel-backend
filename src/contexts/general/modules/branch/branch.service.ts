import Database from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import { Branch } from '@/contexts/general/modules/branch/interfaces/branch.interface';
import { CreateBranchDto } from '@/contexts/general/modules/branch/dto/create_branch.dto';
import { UpdateBranchDto } from '@/contexts/general/modules/branch/dto/update_branch.dto';
import { generalQueries } from '@general/general.queries';
import { InvalidBranchError } from '@/common/errors/invalid_branch.error';
import { InvalidSessionError } from '@/common/errors/invalid_session.error';
import { StateService } from '@/contexts/general/modules/state/state.service';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';

const { branch } = generalQueries;

@Injectable()
export class BranchService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
  ) {}

  async findById(branchId: string): Promise<Branch> {
    const { rows } = await this.db.query(branch.byId, [branchId]);
    return rows[0];
  }

  async findByTenant(tenantId: string): Promise<Branch[]> {
    const { rows } = await this.db.query(branch.byTenant, [tenantId]);
    return rows;
  }

  async findByTenantPaginated(
    tenantId: string,
    page = 1,
    limit = 100,
  ): Promise<{ branches: Branch[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.db.query(branch.byTenantPaginated, [tenantId, limit, offset]),
      this.db.query(branch.countByTenant, [tenantId]),
    ]);
    return {
      branches: dataResult.rows,
      total: countResult.rows[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async findAllGlobal(
    page = 1,
    limit = 100,
  ): Promise<{ branches: Branch[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.db.query(branch.allPaginated, [limit, offset]),
      this.db.query(branch.countAll, []),
    ]);
    return {
      branches: dataResult.rows,
      total: countResult.rows[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async findBranchByName(branchName: string): Promise<Branch> {
    const { rows } = await this.db.query(branch.byName, [branchName]);
    return rows[0];
  }

  async createBranch(
    user_tenant_id: string,
    createBranchDto: CreateBranchDto,
  ): Promise<Branch> {
    const {
      tenant_id,
      branch_name,
      branch_number,
      branch_address,
      contact_email,
      is_main_branch,
    } = createBranchDto;

    if (user_tenant_id !== tenant_id)
      throw new InvalidSessionError('UNAUTHORIZED');

    const txn = await this.db.transaction();
    let committed = false;

    try {
      const { rows } = await txn.query(branch.create, [
        tenant_id,
        branch_name,
        branch_number,
        branch_address || null,
        contact_email || null,
        is_main_branch,
      ]);

      await txn.commit();
      committed = true;
      return rows[0];
    } catch (error) {
      if (!committed) {
        try {
          await txn.rollback();
        } catch (rollbackError) {
          console.error(
            '[BranchService.createBranch] Rollback failed:',
            rollbackError,
          );
        }
      }
      throw error;
    }
  }

  async deleteBranch(branchId: string): Promise<Branch> {
    const { rows } = await this.db.query(branch.delete, [branchId]);
    return rows[0];
  }

  async updateBranch(
    branch_id: string,
    updateBranchDto: UpdateBranchDto,
  ): Promise<Branch> {
    const {
      branch_name,
      branch_number,
      branch_address,
      contact_email,
      is_main_branch,
    } = updateBranchDto;

    await this.validateBranch(branch_id);

    const { rows } = await this.db.query(branch.update, [
      branch_id,
      branch_name,
      branch_number,
      branch_address || null,
      contact_email || null,
      is_main_branch,
    ]);

    return rows[0];
  }

  async validateBranch(branchId: string, tenantId?: string): Promise<void> {
    const branch = await this.findById(branchId);
    if (!branch) throw new InvalidBranchError();
    if (tenantId && branch.tenant_id !== tenantId)
      throw new InvalidTenantError(tenantId);
  }
}
