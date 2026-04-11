import { Inject, Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import Database from '@crane-technologies/database/dist/components/Database';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import { purchaseQueries } from '@purchase/purchase.queries';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { InvalidSessionError } from '@/common/errors/invalid_session.error';

const { suppliers } = purchaseQueries;

@Injectable()
export class SuppliersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createSupplier(
    createSupplierDto: CreateSupplierDto,
    userSession: IUserSession,
  ) {
    try {
      if (!userSession || !userSession.tenant_id) {
        throw new InvalidSessionError('INVALID');
      }

      const {
        supplier_name,
        supplier_contact_info,
        supplier_address,
        supplier_notes,
      } = createSupplierDto;

      const newSupplier = await this.db.query(suppliers.create, [
        supplier_name,
        supplier_contact_info,
        supplier_address,
        supplier_notes,
        userSession.tenant_id,
      ]);

      return newSupplier.rows[0];
    } catch (error) {
      console.error('Error creating supplier:', error);
      if (error instanceof InvalidSessionError) {
        throw error;
      }
      throw new Error('Failed to create supplier');
    }
  }

  async createSuppliersBulk(
    createSuppliersDto: CreateSupplierDto[],
    userSession: IUserSession,
  ) {
    try {
      if (!userSession || !userSession.tenant_id) {
        throw new InvalidSessionError('INVALID');
      }

      const rows = createSuppliersDto.map((dto) => {
        return [
          dto.supplier_name,
          dto.supplier_contact_info,
          dto.supplier_address,
          dto.supplier_notes,
          userSession.tenant_id,
        ];
      });

      await this.db.query('BEGIN');

      await this.db.bulkInsert(
        'purchase_schema.supplier',
        [
          'supplier_name',
          'supplier_contact_info',
          'supplier_address',
          'supplier_notes',
          'added_by',
        ],
        rows,
        { header: false },
      );

      const tenantsSuppliers = await this.getAllSuppliersByTenant(
        userSession.tenant_id,
      );

      await this.db.query('COMMIT');

      return {
        message: 'suppliers added successfully!',
        count: rows.length,
        suppliers: tenantsSuppliers.slice(-rows.length).map((supplier) => ({
          supplier_id: supplier.supplier_id,
          supplier_name: supplier.supplier_name,
        })),
      };
    } catch (error) {
      await this.db.query('ROLLBACK');
      console.error('Error bulk creating suppliers:', error);
      if (error instanceof InvalidSessionError) {
        throw error;
      }
      throw new Error('Failed to bulk create suppliers');
    }
  }

  async getAllSuppliers() {
    try {
      const result = await this.db.query(suppliers.getAll);
      return result.rows;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  async getAllSuppliersByTenant(tenantId: string) {
    try {
      const result = await this.db.query(suppliers.getAllByTenant, [tenantId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  async getSupplierById(id: string) {
    try {
      const result = await this.db.query(suppliers.getById, [id]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error fetching supplier with id ${id}:`, error);
      throw new Error('Failed to fetch supplier');
    }
  }

  async updateSupplier(
    supplierId: string,
    updateSupplierDto: UpdateSupplierDto,
  ) {
    const { ...updates } = updateSupplierDto;

    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );

    if (updateKeys.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause: string[] = [];
    const paramsArray: any[] = [];
    let index = 1;

    for (const key of updateKeys) {
      const validKey = key as keyof typeof updates;
      setClause.push(`${key} = $${index}`);
      paramsArray.push(updates[validKey]);
      index++;
    }

    paramsArray.push(supplierId);

    const result = await this.db.query(suppliers.update, paramsArray);

    return {
      message: 'Supplier updated successfully',
      supplier: result.rows[0],
    };
  }

  async deleteSupplier(supplierId: string) {
    const exist = await this.getSupplierById(supplierId);
    if (!exist) {
      throw new Error('Supplier not found');
    }

    const result = await this.db.query(suppliers.delete, [supplierId]);
    return {
      message: 'Supplier deleted successfully',
      supplier: result.rows[0],
    };
  }
}
