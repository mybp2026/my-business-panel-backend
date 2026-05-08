import { Controller, Inject } from '@nestjs/common';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  constructor(@Inject('STRIPE') private readonly stripe: Stripe) {}

  // ? Configure the subscription payments logic here
}
