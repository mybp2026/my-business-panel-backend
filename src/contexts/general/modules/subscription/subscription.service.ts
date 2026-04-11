import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import Stripe from 'stripe';
import { NewSubscriptionDto } from './dto/newSubscription.dto';
import { generalQueries } from '@general/general.queries';
import { SignatureVerificationError } from '@/common/errors/signature_verification.error';
import { VerifyPaymentException } from '@/common/errors/verify_payment.dto';

const { subscriptions, tenant, tenantPayment } = generalQueries;

@Injectable()
export class SubscriptionService {
  private readonly webhookSecret: string;
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject('STRIPE') private readonly stripe: Stripe,
  ) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    this.webhookSecret = secret;
  }

  private readonly tiers = {
    standard: process.env.STANDARD,
    test: process.env.TEST,
    premium: process.env.PREMIUM,
  } as const;

  async createSubscription(data: NewSubscriptionDto) {
    const {
      tenant_id,
      payment_method_id,
      payment_amount,
      details,
      plan,
      start_date,
      end_date,
      subscription_type_id,
    } = data;

    const priceId =
      this.tiers[`${plan.toLowerCase()}` as keyof typeof this.tiers];

    let tenantStripeId: string;

    // Verificacion de que el tenant exista y ya sea un customer en Stripe
    const tenantResult = await this.db.query(tenant.byId, [tenant_id]);

    if (tenantResult.rows.length === 0) {
      throw new NotFoundException('Tenant not found');
    }

    const tenantInfo = tenantResult.rows[0];

    if (tenantInfo.stripe_id && tenantInfo.stripe_id !== null) {
      tenantStripeId = tenantInfo.stripe_id;
    } else {
      const newCustomer = await this.stripe.customers.create({
        email: tenantInfo.contact_email,
        name: tenantInfo.tenant_name,
        metadata: { tenant_id },
      });

      tenantStripeId = newCustomer.id;

      await this.db.query(tenant.updateStripeId, [tenantStripeId, tenant_id]);
    }

    // Creacion del tenant_payment en bd
    const paymentResult = await this.db.query(tenantPayment.create, [
      tenant_id,
      payment_method_id,
      payment_amount,
      details,
    ]);

    const tenantPaymentId = paymentResult.rows[0].tenant_payment_id;

    // Crear la subscripcion en Stripe
    const subscription = await this.stripe.subscriptions.create({
      customer: tenantStripeId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      metadata: { tenantPaymentId: tenantPaymentId, tenantId: tenant_id },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice & {
      payment_intent?: Stripe.PaymentIntent | string | null;
    };
    // const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    const newSub = await this.db.query(subscriptions.createSubscription, [
      tenant_id,
      subscription_type_id,
      tenantPaymentId,
      start_date,
      end_date,
    ]);
    return {
      idOnDb: newSub.rows[0].subscription_id,
      subscriptionId: subscription.id,
      invoice: invoice.id,
      status: subscription.status,
    };
  }

  async handleSubscriptionWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      throw new SignatureVerificationError('Invalid signature');
    }

    if (event.type === 'invoice.payment_succeeded') {
      console.log('Invoice payment succeeded webhook received');
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string;
      };

      const subscription = await this.stripe.subscriptions.retrieve(
        invoice.subscription as string,
      );

      const tenantPaymentId = subscription.metadata.tenantPaymentId;

      console.log('Payment: ', tenantPaymentId);
      try {
        await this.db.query('CALL verify_tenant_payment($1)', [
          tenantPaymentId,
        ]);
        console.log(`Tenant payment ${tenantPaymentId} verified successfully.`);
      } catch (error) {
        throw new VerifyPaymentException(tenantPaymentId);
      }
    }

    if (event.type === 'customer.subscription.created') {
      console.log('Subscription created webhook received');
      const subscription = event.data.object as Stripe.Subscription;
      const tenantId = subscription.metadata.tenantId;

      if (!tenantId) {
        throw new NotFoundException(
          'Tenant ID not found in subscription metadata',
        );
      }

      console.log(`New subscription created for tenant ID: ${tenantId}`);
    }

    if (event.type === 'customer.subscription.updated') {
      console.log('Subscription updated webhook received');
      const subscription = event.data.object as Stripe.Subscription;
      const tenantId = subscription.metadata.tenantId;

      if (!tenantId) {
        throw new NotFoundException(
          'Tenant ID not found in subscription metadata',
        );
      }

      if (
        subscription.cancel_at_period_end === true &&
        subscription.status === 'active'
      ) {
        console.log(
          `Subscription set to cancel at period end for tenant ID: ${tenantId}`,
        );
        await this.db.query(subscriptions.cancelSubscription, [tenantId]);
        return { received: true };
      }

      if (subscription.items.data.length > 0) {
        const priceId = subscription.items.data[0].price.id;
        console.log(
          `Subscription price updated for tenant ID: ${tenantId} to price ID: ${priceId}`,
        );
        // await this.db.query(subscription.updateSubscriptionPlan, [priceId, tenantId])
      }

      console.log(
        `Subscirption with minor updates for tenant ID: ${tenantId}. Status: ${subscription.status}`,
      );
    }

    if (event.type === 'customer.subscription.deleted') {
      console.log('Subscription canceled webhook received');
      const subscription = event.data.object as Stripe.Subscription;
      const tenantId = subscription.metadata.tenantId;

      if (!tenantId) {
        throw new NotFoundException(
          'Tenant ID not found in subscription metadata',
        );
      }

      await this.db.query(subscriptions.cancelSubscription, [tenantId]);
    }

    return { received: true };
  }
}
