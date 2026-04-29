import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { FullItem, Item, ItemFromDb } from './interface/sale-item.interface';
import { bulkItems, posQueries } from '@pos/pos.queries';

const { saleItems } = posQueries;

@Injectable()
export class SaleItemService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllItems(sale_id: string): Promise<ItemFromDb[]> {
    const items = await this.db.query(saleItems.getItems, [sale_id]);
    return items.rows;
  }

  async getItemById(id: string): Promise<FullItem | null> {
    const item = await this.db.query(saleItems.getItemById, [id]);
    return item.rows[0] || null;
  }

  async deleteItem(id: string) {
    await this.db.query(saleItems.delete, [id]);
    return { message: `Deleted item with id ${id}` };
  }

  async bulkInsert(items: Item[], saleId: string) {
    console.log('Bulk inserting items for sale:', saleId);
    if (!Array.isArray(items) || items.length === 0) return [];

    const val: any[] = [];
    const placeholders: string[] = [];
    let i = 1;

    const tuples = bulkItems.length;

    items.forEach((item) => {
      const rowPlaceholder = [];

      for (let a = 0; a < tuples; a++) {
        rowPlaceholder.push(`$${i++}`);
      }

      placeholders.push(`(${rowPlaceholder.join(',')})`);

      bulkItems.forEach((key) => {
        if (key === 'sale_id') {
          val.push(saleId);
        } else {
          val.push(item[key as keyof Item]);
        }
      });
    });

    console.log(placeholders, val);
    const q = `
      INSERT INTO pos_schema.sale_item (sale_id, tenant_id, product_id, quantity, unit_price, total_price)
      VALUES ${placeholders.join(',')}
    `;

    await this.db.query(q, val);
    return { message: `Inserted ${items.length} items for sale ${saleId}` };
  }
}
