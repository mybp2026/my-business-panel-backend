import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database/dist/components/Database';
import { posRoyaltyQueries } from './pos-royalty.queries';
import type {
  CreateRoyaltyRuleDto,
  UpdateRoyaltyRuleDto,
  CreateRoyaltyOptionDto,
  UpdateRoyaltyOptionDto,
  SetRuleDimensionsDto,
} from './dto/pos-royalty.dto';

const q = posRoyaltyQueries;

@Injectable()
export class PosRoyaltyService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async listRules(tenantId: string) {
    const { rows } = await this.db.query(q.listRulesByTenant, [tenantId]);
    return rows;
  }

  async getRule(royaltyRuleId: string) {
    const { rows } = await this.db.query(q.getRuleById, [royaltyRuleId]);
    if (!rows.length) throw new NotFoundException('Royalty rule not found');
    return rows[0];
  }

  async createRule(dto: CreateRoyaltyRuleDto) {
    const { rows } = await this.db.query(q.createRule, [
      dto.tenant_id,
      dto.min_amount,
    ]);
    return rows[0];
  }

  async updateRule(royaltyRuleId: string, dto: UpdateRoyaltyRuleDto) {
    const { rows } = await this.db.query(q.updateRule, [
      royaltyRuleId,
      dto.min_amount,
    ]);
    if (!rows.length) throw new NotFoundException('Royalty rule not found');
    return rows[0];
  }

  async deleteRule(royaltyRuleId: string) {
    await this.db.query(q.deleteRule, [royaltyRuleId]);
    return { deleted: true };
  }

  // Replace the rule's dimension set in a single txn. Options whose group
  // belongs to a removed dimension are deleted to keep state consistent.
  async setRuleDimensions(royaltyRuleId: string, dto: SetRuleDimensionsDto) {
    const { rows: tenantRows } = await this.db.query(q.getRuleTenantId, [
      royaltyRuleId,
    ]);
    if (!tenantRows.length) {
      throw new NotFoundException('Royalty rule not found');
    }
    const tenantId = tenantRows[0].tenant_id as string;
    const typeIds = Array.from(new Set(dto.tenant_product_group_type_ids ?? []));

    await this.db.query(q.deleteOptionsByRuleExcludingTypes, [
      royaltyRuleId,
      typeIds,
    ]);
    await this.db.query(q.clearRuleDimensions, [royaltyRuleId]);
    for (const typeId of typeIds) {
      await this.db.query(q.insertRuleDimension, [
        royaltyRuleId,
        tenantId,
        typeId,
      ]);
    }
    return this.getRule(royaltyRuleId);
  }

  async createOption(dto: CreateRoyaltyOptionDto) {
    const { rows: allowedRows } = await this.db.query(
      q.isGroupInRuleDimensions,
      [dto.royalty_rule_id, dto.tenant_product_group_id],
    );
    if (!allowedRows.length) {
      throw new BadRequestException(
        'Group dimension is not enabled for this rule',
      );
    }
    const { rows } = await this.db.query(q.createOption, [
      dto.royalty_rule_id,
      dto.tenant_product_group_id,
      dto.quantity,
    ]);
    return rows[0];
  }

  async updateOption(royaltyOptionId: string, dto: UpdateRoyaltyOptionDto) {
    const { rows } = await this.db.query(q.updateOption, [
      royaltyOptionId,
      dto.quantity,
    ]);
    if (!rows.length) throw new NotFoundException('Royalty option not found');
    return rows[0];
  }

  async deleteOption(royaltyOptionId: string) {
    await this.db.query(q.deleteOption, [royaltyOptionId]);
    return { deleted: true };
  }

  async getApplicableRules(tenantId: string, amount: number) {
    const { rows } = await this.db.query(q.getApplicableRules, [tenantId, amount]);
    return rows;
  }

  async getGiftableProductsByGroup(tenantProductGroupId: string) {
    const { rows } = await this.db.query(q.getGiftableProductsByGroup, [
      tenantProductGroupId,
    ]);
    return rows;
  }
}
