import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { Promo } from './interface/promo.interface';
import { NewPromoDto, PromoRules } from './dto/newPromo.dto';
import { RuleCreationError } from '@/common/errors/create_rule.error';
import { PromotionCreationError } from '@/common/errors/create_promo.error';
import { UpdatePromotionDto } from './dto/updatePromo.dto';
import { posQueries } from '@pos/pos.queries';

const { promotions, promotionTypes } = posQueries;

@Injectable()
export class PromosService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getPromos(tenantId: string): Promise<Promo[]> {
    const promos = await this.db.query(promotions.getPromos, [tenantId]);
    return promos.rows;
  }

  async getPromoInfo(promoID: string): Promise<Promo> {
    const promo = await this.db.query(promotions.getPromoInfo, [promoID]);
    return promo.rows[0];
  }

  async createPromoWithRule(newPromoDto: NewPromoDto) {
    const {
      tenant_id,
      promotion_name,
      promotion_code,
      promotion_description,
      promotion_type_id,
      customer_segment_id,
      promotion_start_date,
      promotion_end_date,
      is_active,
      rules,
    } = newPromoDto;

    const promo = await this.db.query(promotions.insertPromo, [
      tenant_id,
      promotion_name,
      promotion_code,
      promotion_description,
      promotion_type_id,
      customer_segment_id,
      promotion_start_date,
      promotion_end_date,
      is_active,
    ]);

    if (promo.rows.length === 0) {
      throw new PromotionCreationError();
    }

    rules.promotion_id = promo.rows[0].promotion_id;
    const rule = await this.insertRules(rules);

    return {
      message: `Promotion and rule with id: ${rule} created successfully`,
    };
  }

  async insertRules(data: PromoRules) {
    const insertKeys = Object.keys(data).filter(
      (key) => data[key as keyof typeof data] !== undefined,
    );

    if (insertKeys.length === 0) {
      throw new RuleCreationError();
    }

    const insertClause: string[] = [];
    const paramsArray: any[] = [];
    const placeholders: any[] = [];
    let i = 1;

    for (const key of insertKeys) {
      insertClause.push(`"${key}"`);
      paramsArray.push(data[key as keyof typeof data]);
      placeholders.push(`$${i}`);
      i++;
    }

    const q = `
      INSERT INTO pos_schema.promotion_rule(${insertClause.join(', ')})
      VALUES(${placeholders.join(', ')})
      RETURNING *
    `;

    const new_rule = await this.db.query(q, paramsArray);

    return new_rule.rows[0].promotion_rule_id;
  }

  async deletePromotion(promotionId: string) {
    const result = await this.db.query(promotions.deletePromo, [promotionId]);
    if (result.rows.length === 0) {
      throw new InternalServerErrorException('Failed to delete promotion');
    }
    return {
      message: `Promotion with id: ${result.rows[0].promotion_id} deleted successfully`,
    };
  }

  async updatePromotion(
    promotionId: string,
    updatePromoDto: UpdatePromotionDto,
  ) {
    const {
      tenant_id,
      promotion_name,
      promotion_code,
      promotion_description,
      promotion_type_id,
      customer_segment_id,
      promotion_start_date,
      promotion_end_date,
      is_active,
    } = updatePromoDto;

    let updateRule: { queryString: string; paramsArray: any[] } | null = null;

    if (updatePromoDto.rules) {
      updateRule = this.buildUpdateQuery(updatePromoDto.rules);
    }

    try {
      await this.db.query('BEGIN');

      const updatedPromo = await this.db.query(promotions.updatePromo, [
        promotionId,
        tenant_id,
        promotion_name,
        promotion_code,
        promotion_description,
        promotion_type_id,
        customer_segment_id,
        promotion_start_date,
        promotion_end_date,
        is_active,
      ]);

      if (updateRule) {
        await this.db.query(updateRule.queryString, updateRule.paramsArray);
      }

      await this.db.query('COMMIT');

      if (!updatedPromo.rows || updatedPromo.rows.length === 0) {
        throw new Error('Promotion not found or update failed.');
      }

      return {
        message: `Promotion with id: ${updatedPromo.rows[0].promotion_id} updated successfully`,
      };
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  buildUpdateQuery(data: PromoRules) {
    const { ...updates } = data;

    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );

    if (updateKeys.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const setClause: string[] = [];
    const paramsArray: any[] = [];
    let index = 1;

    for (const key of updateKeys) {
      const validKey = key as keyof typeof updates;
      setClause.push(`"${key}" = $${index}`);
      paramsArray.push(updates[validKey]);
      index++;
    }

    paramsArray.push(data.promotion_id);

    const setString = setClause.join(', ');

    const queryString = `
      UPDATE pos_schema.promotion_rule
      SET ${setString}
      WHERE promotion_rule_id = $${index}
      RETURNING *
      `;

    return { queryString, paramsArray };
  }

  async getPromoTypes() {
    const promoType = await this.db.query(promotionTypes.getPromoTypes);
    return promoType.rows;
  }
}
