import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import {
  BulkUpdateProducts,
  ReturnProduct,
  ReturnTransactionDto,
} from './dto/return_transaction.dto';
import { bulkReturns, posQueries } from '@pos/pos.queries';
import { FindReturnsDto } from './dto/find_returns.dto';

const { returns, dInvoice } = posQueries;

@Injectable()
export class ReturnsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createNewFullReturn(data: ReturnTransactionDto) {
    const {
      invoice_id,
      tenant_customer_id,
      total_refund_amount,
      refund_method,
      return_status_id,
      return_date,
      return_products,
    } = data;
    await this.db.query('BEGIN');
    try {
      //Primero se crea la transacción de devolución
      const res = await this.db.query(returns.newTransaction, [
        invoice_id,
        tenant_customer_id,
        total_refund_amount,
        refund_method,
        return_status_id,
        return_date,
      ]);

      // Luego se guardan los productos retornados
      const productsInsert = this.bulkInsertReturns(
        return_products,
        res.rows[0].return_transaction_id,
      );

      const productRes = await this.db.query(
        productsInsert.query,
        productsInsert.values,
      );
      // Actualizar los productos
      const updateProducts = this.generateBulkUpdate(productRes.rows);
      await this.db.query(updateProducts.query, updateProducts.values);

      //Actualizar total de la factura
      await this.db.query(dInvoice.updateAmount, [
        total_refund_amount,
        invoice_id,
      ]);

      await this.db.query('COMMIT');
      return { message: 'Return transaction created successfully' };
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw new InternalServerErrorException(error);
    }
  }

  async findReturns(findReturnsDto: FindReturnsDto) {
    const { rows } = await this.db.query(returns.find, [
      findReturnsDto.invoice_id,
      findReturnsDto.tenant_customer_id,
      findReturnsDto.return_status_id,
      findReturnsDto.refund_method,
      findReturnsDto.date_from,
      findReturnsDto.date_to,
    ]);
    return { results: rows };
  }

  bulkInsertReturns(
    products: ReturnProduct[],
    returnTransaction: string,
  ): { query: string; values: any[] } {
    if (!Array.isArray(products) || products.length === 0)
      return { query: '', values: [] };

    const values: any[] = [];
    const placeholders: string[] = [];
    let index = 1;

    const tuples = bulkReturns.length;

    products.forEach((p) => {
      const rowPlaceholder = [];

      for (let i = 0; i < tuples; i++) {
        rowPlaceholder.push(`$${index++}`);
      }
      placeholders.push(`(${rowPlaceholder.join(', ')})`);

      bulkReturns.forEach((k) => {
        if (k === 'return_transaction_id') {
          values.push(returnTransaction);
        } else {
          values.push(p[k as keyof ReturnProduct]);
        }
      });
    });

    const query = `
      INSERT INTO pos_schema.return_product (${bulkReturns.join(', ')})
      VALUES ${placeholders.join(', ')}
      RETURNING sale_item_id, quantity, total_price
    `;

    console.log('Bulk insert', query, values);
    return { query, values };
  }

  generateBulkUpdate(data: BulkUpdateProducts[]) {
    const values: any[] = [];
    const placeholder: string[] = [];
    let index = 1;

    data.forEach((d) => {
      placeholder.push(`($${index++}::uuid, $${index++}, $${index++})`);
      values.push(d.sale_item_id, d.quantity, d.total_price);
    });

    const q = `
      UPDATE pos_schema.sale_item AS s
      SET
          quantity = COALESCE(s.quantity, 0) - data.quantity::integer,
          total_price = COALESCE(s.total_price, 0) - data.total_price::numeric
      FROM (
        VALUES ${placeholder.join(', ')}
      ) AS data(sale_item_id, quantity, total_price)
      WHERE s.sale_item_id = data.sale_item_id AND (COALESCE(s.quantity, 0) - data.quantity::integer) >= 0
    `;
    console.log('Bulk update', q, values);
    return { query: q, values: values };
  }
}
