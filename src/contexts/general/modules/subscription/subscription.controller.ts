import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { NewSubscriptionDto } from './dto/newSubscription.dto';
import { Response } from 'express';
import {
  createSubscriptionDoc,
  handleWebhookDoc,
} from '@/docs/contexts/general/subscription';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOperation(createSubscriptionDoc.operation)
  @ApiResponse(createSubscriptionDoc.responses[201])
  @ApiResponse(createSubscriptionDoc.responses[400])
  @ApiResponse(createSubscriptionDoc.responses[401])
  @Post('create')
  async createSubscription(@Body() req: NewSubscriptionDto) {
    return this.subscriptionService.createSubscription(req);
  }

  @ApiOperation(handleWebhookDoc.operation)
  @ApiResponse(handleWebhookDoc.responses[200])
  @ApiResponse(handleWebhookDoc.responses[400])
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<any>,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      if (!req.body) {
        console.log('No raw body found in the request', req.body);
        return res.status(400).send();
      }
      await this.subscriptionService.handleSubscriptionWebhook(
        req.body,
        signature,
      );
      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(400).send(`Webhook Error: ${error}`);
    }
  }
}
