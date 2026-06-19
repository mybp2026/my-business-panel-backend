import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import { generalQueries } from '@general/general.queries';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

const { exchangeRate } = generalQueries;

@Injectable()
export class ExchangeRateService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAll() {
    const result = await this.db.query(exchangeRate.all);
    return result.rows;
  }

  async getById(id: string) {
    const result = await this.db.query(exchangeRate.byId, [id]);
    if (!result.rows[0]) throw new NotFoundException('Exchange rate not found');
    return result.rows[0];
  }

  async getLatestForPair(fromCurrencyId: number, toCurrencyId: number) {
    if (fromCurrencyId === toCurrencyId) {
      throw new BadRequestException(
        'from_currency_id must differ from to_currency_id',
      );
    }
    const result = await this.db.query(exchangeRate.latestForPair, [
      fromCurrencyId,
      toCurrencyId,
    ]);
    return result.rows[0] ?? null;
  }

  async create(dto: CreateExchangeRateDto) {
    if (dto.from_currency_id === dto.to_currency_id) {
      throw new BadRequestException(
        'from_currency_id must differ from to_currency_id',
      );
    }
    const result = await this.db.query(exchangeRate.upsert, [
      dto.from_currency_id,
      dto.to_currency_id,
      dto.rate,
      dto.effective_date,
      dto.source ?? 'MANUAL',
    ]);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateExchangeRateDto) {
    const updatedKeys = Object.entries(dto).filter(([, v]) => v !== undefined);
    if (updatedKeys.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }
    const result = await this.db.query(exchangeRate.update, [
      id,
      dto.rate ?? null,
      dto.effective_date ?? null,
      dto.source ?? null,
    ]);
    if (!result.rows[0]) throw new NotFoundException('Exchange rate not found');
    return result.rows[0];
  }

  async delete(id: string) {
    const result = await this.db.query(exchangeRate.delete, [id]);
    if (!result.rows[0]) throw new NotFoundException('Exchange rate not found');
    return { message: 'Exchange rate deleted', exchange_rate_id: id };
  }
}
