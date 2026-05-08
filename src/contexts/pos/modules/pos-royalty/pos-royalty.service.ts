import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database/dist/components/Database';
import { posRoyaltyQueries } from './pos-royalty.queries';
import type {
  CreateRoyaltyRuleDto,
  UpdateRoyaltyRuleDto,
  CreateRoyaltyOptionDto,
  UpdateRoyaltyOptionDto,
  SetOptionProductsDto,
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

  async createOption(dto: CreateRoyaltyOptionDto) {
    const { rows } = await this.db.query(q.createOption, [
      dto.royalty_rule_id,
      dto.tenant_product_group_id,
      dto.quantity,
      dto.scope,
    ]);
    return rows[0];
  }

  async updateOption(royaltyOptionId: string, dto: UpdateRoyaltyOptionDto) {
    const { rows } = await this.db.query(q.updateOption, [
      royaltyOptionId,
      dto.quantity,
      dto.scope,
    ]);
    if (!rows.length) throw new NotFoundException('Royalty option not found');
    return rows[0];
  }

  async deleteOption(royaltyOptionId: string) {
    await this.db.query(q.deleteOption, [royaltyOptionId]);
    return { deleted: true };
  }

  async setOptionProducts(royaltyOptionId: string, dto: SetOptionProductsDto) {
    await this.db.query(q.clearOptionProducts, [royaltyOptionId]);
    const inserted: unknown[] = [];
    for (const variantId of dto.product_variant_ids) {
      const { rows } = await this.db.query(q.addOptionProduct, [
        royaltyOptionId,
        variantId,
      ]);
      if (rows.length) inserted.push(rows[0]);
    }
    return inserted;
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
