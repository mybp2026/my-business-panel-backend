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

  async listRules(tenantId: string, typeId?: string) {
    const { rows } = await this.db.query(q.listRulesByTenant, [tenantId, typeId ?? null]);
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
      dto.tenant_product_group_type_id ?? null,
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
    const { rows: optRows } = await this.db.query(q.getOptionWithRule, [royaltyOptionId]);
    const option = optRows[0] as {
      tenant_id: string;
      tenant_product_group_id: string;
      min_amount: number;
    } | undefined;

    await this.db.query(q.clearOptionProducts, [royaltyOptionId]);
    const inserted: unknown[] = [];
    for (const variantId of dto.product_variant_ids) {
      const { rows } = await this.db.query(q.addOptionProduct, [
        royaltyOptionId,
        variantId,
      ]);
      if (rows.length) inserted.push(rows[0]);
    }

    // Propagate products to all lower-tier rules sharing the same group.
    // Only targets 'specific' scope options; 'any' scope already covers all giftable products.
    if (option && dto.product_variant_ids.length > 0) {
      await this.db.query(q.propagateToLowerRules, [
        option.tenant_id,
        option.tenant_product_group_id,
        option.min_amount,
        dto.product_variant_ids,
      ]);
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
