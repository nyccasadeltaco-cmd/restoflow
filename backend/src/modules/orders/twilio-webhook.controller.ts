import { Body, Controller, Post } from '@nestjs/common';
import { OrderNotificationsService } from './order-notifications.service';

@Controller('public/twilio')
export class TwilioWebhookController {
  constructor(
    private readonly orderNotificationsService: OrderNotificationsService,
  ) {}

  @Post('status')
  async statusCallback(@Body() body: Record<string, any>) {
    await this.orderNotificationsService.applyTwilioStatusCallback(body ?? {});
    return { ok: true };
  }
}

