import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Customer } from './interface/customer.interface';
import { NewClientDto } from './dto/newClient.dto';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database/dist/components/Database';
import { generalQueries } from '@general/general.queries';
import { UpdateClientDto } from './dto/updateClient.dto';
import { ClientCreateError } from '@/common/errors/client_create.error';

const { customer } = generalQueries;

// ? Activate when everything is ready
// @UseGuards(AuthorizationGuard)
@Injectable()
export class CustomerService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /**
   * Find a client by their document ID
   * @param clientId: string
   * @returns: Customer
   */
  async findCustomerByDocumentId(clientId: string): Promise<Customer> {
    const { rows } = await this.db.query(customer.getInfo, [clientId]);

    if (!rows || rows.length === 0) {
      throw new NotFoundException('Customer not found');
    }

    return rows[0];
  }

  async findCustomerById(customerId: string): Promise<Customer> {
    const { rows } = await this.db.query(customer.byId, [customerId]);
    if (!rows || rows.length === 0) {
      throw new NotFoundException('Customer not found');
    }

    return rows[0];
  }

  /**
   * @returns: Customer[]
   */
  async getAllCustomers(tenantId: string): Promise<Customer[]> {
    const { rows } = await this.db.query(customer.all, [tenantId]);
    return rows;
  }

  /**
   *
   * @param customerData: Customer
   * @returns: Customer
   */
  async createCustomer(customerData: NewClientDto) {
    const {
      tenant_id,
      first_name,
      last_name,
      document_type_id,
      document_number,
      economic_activity,
      email,
      phone,
      birthdate,
      address,
      is_tenant,
    } = customerData;

    const { rows } = await this.db.query(customer.create, [
      tenant_id,
      first_name,
      last_name,
      document_type_id,
      document_number,
      economic_activity,
      email,
      phone,
      birthdate || null,
      address,
      is_tenant || false,
    ]);

    if (rows.length == 0) throw new ClientCreateError(email);
    return { message: 'Customer created', customer: rows[0] };
  }

  /**
   * Find a customer by their ID and updates the information of the customer
   * @param customerId: string
   * @param customerData: Partial<Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>>
   * @returns: Customer
   */
  async updateCustomer(customerId: string, customerData: UpdateClientDto) {
    const { ...updates } = customerData;

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

    paramsArray.push(customerId);

    const setString = setClause.join(', ');

    const queryString = `
      UPDATE general_schema.tenant_customer
      SET ${setString}
      WHERE tenant_customer_id = $${index}
      RETURNING *
    `;

    try {
      const res = await this.db.query(queryString, paramsArray);
      return res.rows[0];
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Find a customer by their ID and deletes the customer
   * @param customerId: string
   * @returns: void
   */
  async deleteCustomer(customerId: string) {
    const result = await this.findCustomerById(customerId);

    if (!result) {
      throw new Error('Customer not found');
    }

    try {
      await this.db.query(customer.delete, [customerId]);
      return { message: 'Customer deleted' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
