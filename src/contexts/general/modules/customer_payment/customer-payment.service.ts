import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { NewCustomerPaymentDto } from './dto/NewCustomerPayment.dto';
import { bulkPayments, generalQueries } from '@general/general.queries';
import { Payment } from './interface/payments.interface';

const { customerPayment } = generalQueries;

@Injectable()
export class CustomerPaymentService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getEveryPayment() {
    const payments = await this.db.query(customerPayment.getPayments);
    return payments.rows;
  }

  async getCustomerPayments(customerId: string) {
    const payments = await this.db.query(customerPayment.getCustomerPayments, [
      customerId,
    ]);
    return payments.rows;
  }

  async bulkInsert(payments: Payment[], saleId: string) {
    console.log('Bulk inserting payments for sale:', saleId);
    if (!Array.isArray(payments) || payments.length === 0) return [];

    const val: any[] = [];
    const placeholders: string[] = [];
    let i = 1;

    const tuples = bulkPayments.length;

    payments.forEach((payment) => {
      const rowPlaceholder = [];

      for (let a = 0; a < tuples; a++) {
        rowPlaceholder.push(`$${i++}`);
      }

      placeholders.push(`(${rowPlaceholder.join(',')})`);

      bulkPayments.forEach((key) => {
        if (key === 'sale_id') {
          val.push(saleId);
        } else {
          val.push(payment[key as keyof Payment]);
        }
      });
    });

    console.log(placeholders, val);
    const q = `
        INSERT INTO pos_schema.customer_payment (tenant_customer_id, sale_id, payment_method_id, payment_amount, payment_date, currency_id, verified)
        VALUES ${placeholders.join(',')}
      `;

    const res = await this.db.query(q, val);
    return res;
  }

  async createCustomerPayment(paymentData: NewCustomerPaymentDto) {
    const {
      tenant_customer_id,
      sale_id,
      payment_method_id,
      payment_amount,
      payment_date,
      currency_id,
      verified,
    } = paymentData;

    const newPayment = await this.db.query(customerPayment.createNewPayment, [
      tenant_customer_id,
      sale_id,
      payment_method_id,
      payment_amount,
      payment_date,
      currency_id,
      verified,
    ]);

    return { message: 'Payment created', newPayment };
  }

  async deleteCustomerPayment(customerId: string) {
    await this.db.query(customerPayment.deletePayment, [customerId]);
    return { message: 'Payment deleted' };
  }
}
