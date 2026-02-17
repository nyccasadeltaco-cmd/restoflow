import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderNotification } from './entities/order-notification.entity';

@Injectable()
export class OrderNotificationsService {
  constructor(
    @InjectRepository(OrderNotification)
    private readonly repo: Repository<OrderNotification>,
  ) {}

  async logOutboundSms(input: {
    orderId?: string | null;
    toPhone?: string | null;
    template?: string | null;
    providerStatus?: string | null;
    providerMessageSid?: string | null;
    errorMessage?: string | null;
    payload?: Record<string, any> | null;
  }) {
    const row = this.repo.create({
      orderId: input.orderId ?? null,
      channel: 'SMS',
      provider: 'TWILIO',
      toPhone: input.toPhone ?? null,
      template: input.template ?? null,
      providerStatus: input.providerStatus ?? null,
      providerMessageSid: input.providerMessageSid ?? null,
      errorMessage: input.errorMessage ?? null,
      payload: input.payload ?? null,
    });
    return this.repo.save(row);
  }

  async applyTwilioStatusCallback(payload: Record<string, any>) {
    const sid = String(payload?.MessageSid ?? '').trim();
    const status = String(payload?.MessageStatus ?? '').trim() || null;
    const to = String(payload?.To ?? '').trim() || null;
    const errCode = String(payload?.ErrorCode ?? '').trim();
    const errMsg = String(payload?.ErrorMessage ?? '').trim();
    const composedError =
      errCode || errMsg ? `${errCode}${errCode && errMsg ? ': ' : ''}${errMsg}` : null;

    if (sid) {
      const existing = await this.repo.findOne({
        where: { provider: 'TWILIO', providerMessageSid: sid },
        order: { createdAt: 'DESC' },
      });

      if (existing) {
        existing.providerStatus = status;
        existing.toPhone = to ?? existing.toPhone;
        existing.errorMessage = composedError ?? existing.errorMessage;
        existing.payload = payload;
        return this.repo.save(existing);
      }
    }

    const row = this.repo.create({
      channel: 'SMS',
      provider: 'TWILIO',
      toPhone: to,
      providerStatus: status,
      providerMessageSid: sid || null,
      errorMessage: composedError,
      payload,
    });
    return this.repo.save(row);
  }
}

