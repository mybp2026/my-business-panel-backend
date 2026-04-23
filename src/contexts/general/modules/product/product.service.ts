import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { bulkProducts, generalQueries } from '@general/general.queries';
import {
  // NewProductDto,
  ProductInsert,
  ProductInsertDto,
} from './dto/newProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { Product } from './interface/product.interface';
import { isUUID } from 'class-validator';

const { products } = generalQueries;

@Injectable()
export class ProductService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllProducts(tenantId: string): Promise<Product[]> {
    const result = await this.db.query(products.getAll, [tenantId]);
    return result.rows;
  }

  async getAllProductsPaginated(
    tenantId: string,
    page = 1,
    limit = 100,
  ): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.db.query(products.getAllPaginated, [tenantId, limit, offset]),
      this.db.query(products.countByTenant, [tenantId]),
    ]);
    return {
      products: dataResult.rows,
      total: countResult.rows[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async getAllProductsGlobal(
    page = 1,
    limit = 100,
  ): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.db.query(products.getAllGlobal, [limit, offset]),
      this.db.query(products.countAll, []),
    ]);
    return {
      products: dataResult.rows,
      total: countResult.rows[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async getProductBySku(sku: string): Promise<Product> {
    const product = await this.db.query(products.getBySku, [sku]);
    return product.rows[0];
  }

  async getProductById(productId: string, tenantId: string): Promise<Product> {
    if (!isUUID(productId)) {
      throw new BadRequestException('Invalid product ID format');
    }
    if (!isUUID(tenantId)) {
      throw new BadRequestException('Invalid tenant ID format');
    }
    const product = await this.db.query(products.getById, [
      productId,
      tenantId,
    ]);
    return product.rows[0];
  }

  async createProduct(data: ProductInsertDto) {
    const { products } = data;

    const insertData = this.bulkInsertProducts(products);

    let newProducts;
    try {
      newProducts = await this.db.query(insertData.query, insertData.values);
    } catch (error: any) {
      if (error?.code === '23503' && error?.constraint === 'product_variant_cabys_code_fkey') {
        throw new BadRequestException(
          `The cabys_code provided does not exist in the CABYS catalog`,
        );
      }
      throw new InternalServerErrorException(error);
    }

    return {
      message: 'Products created successfully!',
      product: newProducts.rows,
    };
  }

  bulkInsertProducts(products: ProductInsert[]): {
    query: string;
    values: any[];
  } {
    if (!Array.isArray(products) || products.length === 0)
      return { query: '', values: [] };

    const values: any[] = [];
    const placeholders: string[] = [];
    let index = 1;

    const tuples = bulkProducts.length;

    products.forEach((p) => {
      const rowPlaceholder = [];

      for (let i = 0; i < tuples; i++) {
        rowPlaceholder.push(`$${index++}`);
      }
      placeholders.push(`(${rowPlaceholder.join(', ')})`);

      bulkProducts.forEach((k) => {
        const valInsert = p[k as keyof ProductInsert];

        if (k === 'product_description') {
          values.push(
            valInsert === undefined ? 'No existe descripcion' : valInsert,
          );
        } else {
          values.push(valInsert === undefined ? null : valInsert);
        }
      });
    });

    const query = `
        INSERT INTO general_schema.product_variant (${bulkProducts.join(', ')})
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (tenant_id, sku) DO NOTHING
        RETURNING product_variant_id
      `;

    return { query, values };
  }

  async updateProduct(data: UpdateProductDto, productId: string) {
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

    paramsArray.push(productId);

    const setString = setClause.join(', ');

    const queryString = `
          UPDATE general_schema.product_variant
          SET ${setString}
          WHERE product_variant_id = $${index}
          RETURNING *
        `;

    try {
      const res = await this.db.query(queryString, paramsArray);
      return { message: 'Product updated successfully!', product: res.rows[0] };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteProduct(productId: string) {
    await this.db.query(products.delete, [productId]);
    return { message: `Product with id ${productId} deleted` };
  }
}
