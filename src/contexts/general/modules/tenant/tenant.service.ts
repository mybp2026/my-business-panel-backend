import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DATABASE } from '@/contexts/general/modules/db/db.provider';
import Database from '@crane-technologies/database';
import Stripe from 'stripe';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { generalQueries } from '@general/general.queries';
import { hrQueries } from '@hr/hr.queries';
import { encrypt } from '@/common/crypto/aes-256-gcm';
import { StateService } from '../state/state.service';
import { NewTenantDto } from './dto/newTenant.dto';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import { Tenant } from './interface/tenant.interface';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { UserCreationError } from '@/common/errors/user_create.error';
import { CreateFullEmployeeError } from '@/common/errors/create_full_employee.error';

const { tenant, branch, users, subscriptions, tenantHaciendaConfig } =
  generalQueries;
const { employee } = hrQueries;

type TransactionClient = Awaited<ReturnType<Database['transaction']>>;

@Injectable()
export class TenantService {
  private readonly tiers: Record<string, string | undefined>;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly jwtService: JwtService,
    private readonly stateService: StateService,
  ) {
    this.tiers = {
      standard: process.env.STANDARD,
      test: process.env.TEST,
      premium: process.env.PREMIUM,
    };
  }

  private async rollbackSafely(
    txn: TransactionClient,
    context: string,
  ): Promise<void> {
    try {
      await txn.rollback();
    } catch (rollbackError) {
      console.error(
        `[TenantService.${context}] Rollback failed:`,
        rollbackError,
      );
    }
  }

  async getAllTenants(): Promise<Tenant[]> {
    const { rows } = await this.db.query(tenant.all);
    return rows;
  }

  async getTenantById(tenantId: string): Promise<Tenant> {
    const { rows } = await this.db.query(tenant.byId, [tenantId]);
    return rows[0];
  }

  async createTenant(tenantInfo: NewTenantDto) {
    if (tenantInfo.user && tenantInfo.hacienda && tenantInfo.subscription) {
      return this.createTenantWithOnboarding(tenantInfo);
    }

    const {
      tenant_name,
      contact_email,
      contact_phone,
      is_subscribed,
      region_id,
      identification_type_id,
      economic_activity,
      sign,
      identification,
    } = tenantInfo;

    const txn = await this.db.transaction();
    let committed = false;

    try {
      const { rows } = await txn.query(tenant.create, [
        tenant_name,
        contact_email,
        contact_phone ?? null,
        identification,
        economic_activity,
        sign,
        is_subscribed,
        region_id,
        identification_type_id,
      ]);

      await txn.commit();
      committed = true;
      this.stateService.addTenant(rows[0]);
      return rows[0];
    } catch (error) {
      if (!committed) await this.rollbackSafely(txn, 'createTenant');
      throw error;
    }
  }

  /**
   * Ejecuta el flujo completo de onboarding en una sola transacción:
   * 1. Crear tenant
   * 2. Crear sucursal principal
   * 3. Crear usuario administrador + empleado
   * 4. Guardar configuración de Hacienda (cifrada)
   * 5. Crear customer y suscripción en Stripe
   * 6. Registrar pago y suscripción en BD
   * 7. Generar token JWT
   *
   * Si cualquier paso falla, se revierte toda la transacción y se
   * compensa la suscripción en Stripe si ya se había creado.
   */
  private async createTenantWithOnboarding(tenantInfo: NewTenantDto) {
    const { user, hacienda, subscription } = tenantInfo as Required<
      Pick<NewTenantDto, 'user' | 'hacienda' | 'subscription'>
    > &
      NewTenantDto;
    const branchInfo = tenantInfo.branch;

    const txn = await this.db.transaction();
    let committed = false;
    let stripeSubscriptionIdToCompensate: string | null = null;

    try {
      // ── 1. Crear tenant ───────────────────────────────────────────────────
      const { rows: tenantRows } = await txn.query(tenant.create, [
        tenantInfo.tenant_name,
        tenantInfo.contact_email,
        tenantInfo.contact_phone ?? null,
        tenantInfo.identification,
        tenantInfo.economic_activity,
        tenantInfo.sign,
        true, // is_subscribed = true desde el onboarding; el pago se confirma en el frontend antes de navegar al dashboard
        tenantInfo.region_id,
        tenantInfo.identification_type_id,
      ]);
      const newTenant = tenantRows[0];
      const tenantId: string = newTenant.tenant_id;

      // ── 2. Crear sucursal principal ───────────────────────────────────────
      const branchName =
        branchInfo?.branch_name || `${tenantInfo.tenant_name} - Principal`;
      const branchNumber = branchInfo?.branch_number || '1';
      const branchAddress = branchInfo?.branch_address || null;

      const { rows: branchRows } = await txn.query(branch.create, [
        tenantId,
        branchName,
        branchNumber,
        branchAddress,
        tenantInfo.contact_email,
        true, // is_main_branch
      ]);
      const newBranch = branchRows[0];
      const branchId: string = newBranch.branch_id;

      // ── 3. Crear usuario administrador ────────────────────────────────────
      const passwordHash = await hash(
        user.password,
        this.stateService.getConstant<number>('PASSWORD_SALT_ROUNDS'),
      );

      const { rows: userRows } = await txn.query(users.create, [
        tenantId,
        user.email,
        passwordHash,
        2, // role_id = admin
      ]);
      if (userRows.length === 0) throw new UserCreationError(user.email);
      const userId: string = userRows[0].user_id;

      // Crear empleado asociado vía stored procedure
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const { rows: employeeRows } = await txn.query(employee.full, [
        today, // start_date
        nextYear, // end_date
        40, // hours
        0, // base_salary
        'Administrador', // duties
        1, // turn_type
        1, // turn_id
        userId,
        tenantId,
        user.first_name,
        user.last_name,
        user.document_number,
        user.phone,
        user.email,
        1, // payment_schedule_id
        branchId,
      ]);
      if (employeeRows.length === 0) throw new CreateFullEmployeeError();

      // ── 4. Guardar configuración de Hacienda (cifrada) ────────────────────
      await txn.query(tenantHaciendaConfig.create, [
        tenantId,
        encrypt(hacienda.hacienda_username),
        encrypt(hacienda.hacienda_password),
        hacienda.hacienda_client_id,
        encrypt(hacienda.p12_base64),
        encrypt(hacienda.p12_password),
      ]);

      // ── 5. Operaciones con Stripe (externas) ─────────────────────────────
      const newCustomer = await this.stripe.customers.create({
        email: tenantInfo.contact_email,
        name: tenantInfo.tenant_name,
        metadata: { tenant_id: tenantId },
      });
      const tenantStripeId = newCustomer.id;

      await this.stripe.paymentMethods.attach(
        subscription.stripe_payment_method_id,
        { customer: tenantStripeId },
      );
      await this.stripe.customers.update(tenantStripeId, {
        invoice_settings: {
          default_payment_method: subscription.stripe_payment_method_id,
        },
      });

      const priceId =
        this.tiers[subscription.plan.toLowerCase() as keyof typeof this.tiers];
      const tenantPaymentId = randomUUID();

      const stripeSubscription = await this.stripe.subscriptions.create({
        customer: tenantStripeId,
        items: [{ price: priceId }],
        default_payment_method: subscription.stripe_payment_method_id,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        metadata: { tenantPaymentId, tenantId },
        expand: ['latest_invoice.confirmation_secret'],
      });
      stripeSubscriptionIdToCompensate = stripeSubscription.id;

      const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      if (!invoice) throw new Error('No invoice found on subscription');

      const clientSecret = invoice.confirmation_secret?.client_secret ?? null;
      if (!clientSecret)
        throw new Error('Could not obtain payment client_secret from Stripe');

      // ── 6. Registrar pago y suscripción en BD (misma transacción) ─────────
      await txn.query(tenant.updateStripeId, [tenantStripeId, tenantId]);

      await txn.rawQuery(
        `INSERT INTO general_schema.tenant_payment
           (tenant_payment_id, tenant_id, payment_method_id, payment_amount, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          tenantPaymentId,
          tenantId,
          subscription.payment_method_id,
          subscription.payment_amount,
          `Suscripción plan ${subscription.plan} - onboarding`,
        ],
      );

      await txn.query(subscriptions.createSubscription, [
        tenantId,
        subscription.subscription_type_id,
        tenantPaymentId,
        subscription.start_date,
        subscription.end_date,
      ]);

      // ── 7. Commit ─────────────────────────────────────────────────────────
      await txn.commit();
      committed = true;

      // Registrar el nuevo tenant en el cache en memoria del StateService
      this.stateService.addTenant(newTenant);

      // ── 8. Generar token JWT (post-commit, datos ya persisten) ────────────
      const userSession: IUserSession = {
        user_id: userId,
        email: user.email,
        tenant_id: tenantId,
        role_id: 2,
      };
      const token = await this.jwtService.signAsync(userSession);

      return {
        tenant: newTenant,
        branch: newBranch,
        user: { user_id: userId, email: user.email },
        subscription: {
          subscriptionId: stripeSubscription.id,
          clientSecret,
          invoice: invoice.id,
          status: stripeSubscription.status,
        },
        token,
      };
    } catch (error) {
      if (!committed)
        await this.rollbackSafely(txn, 'createTenantWithOnboarding');

      if (stripeSubscriptionIdToCompensate) {
        try {
          await this.stripe.subscriptions.cancel(
            stripeSubscriptionIdToCompensate,
          );
        } catch (compensationError) {
          console.error(
            '[TenantService.createTenantWithOnboarding] Stripe compensation failed:',
            compensationError,
          );
        }
      }

      throw error;
    }
  }

  async updateTenant(tenantId: string, tenantData: UpdateTenantDto) {
    const { ...updates } = tenantData;

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

    paramsArray.push(tenantId);

    const setString = setClause.join(', ');

    const queryString = `
      UPDATE general_schema.tenant
      SET ${setString}
      WHERE tenant_id = $${index}
      RETURNING *
    `;

    const up = await this.db.query(queryString, paramsArray);

    return { message: 'Tenant updated successfully', tenant: up.rows[0] };
  }

  async deleteTenant(tenantId: string) {
    const exist = await this.getTenantById(tenantId);
    if (!exist) {
      throw new Error('Tenant not found');
    }

    const deletedTenant = await this.db.query(tenant.delete, [tenantId]);
    return {
      message: 'Tenant deleted successfully',
      tenant: deletedTenant.rows[0],
    };
  }
}
