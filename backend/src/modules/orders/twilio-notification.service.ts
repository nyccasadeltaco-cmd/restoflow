import { Injectable, Logger } from '@nestjs/common';
import { Order, OrderStatus } from './entities/order.entity';
// Use CommonJS require to avoid default-import interop issues in Nest build/runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require('twilio');

@Injectable()
export class TwilioNotificationService {
  private readonly logger = new Logger(TwilioNotificationService.name);
  private client: ReturnType<typeof twilio> | null = null;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (sid && token) {
      this.client = twilio(sid, token);
    }
  }

  async sendOrderStatusSms(order: Order): Promise<void> {
    if (!this.client) return;
    const from = process.env.TWILIO_FROM_NUMBER?.trim();
    const to = this.normalizePhone(order.customerPhone);

    if (!from || !to) return;

    const body = this.buildStatusMessage(order);
    if (!body) return;

    try {
      const statusCallback = process.env.TWILIO_STATUS_CALLBACK_URL?.trim();
      const payload = { from, to, body } as any;
      if (statusCallback) {
        payload.statusCallback = statusCallback;
      }

      const message = await this.client.messages.create(payload);
      this.logger.log(
        `SMS sent for order ${order.id}: sid=${message.sid}, status=${message.status}`,
      );
    } catch (error: any) {
      this.logger.warn(
        `SMS send failed for order ${order.id}: ${error?.message ?? error}`,
      );
    }
  }

  private buildStatusMessage(order: Order): string | null {
    const shortId = order.id.slice(0, 8).toUpperCase();
    switch (order.status) {
      case OrderStatus.CONFIRMED:
        return `Casa del Taco NYC: Recibimos tu orden #${shortId}. Te avisamos cuando este en preparacion.`;
      case OrderStatus.PREPARING:
        return `Casa del Taco NYC: Tu orden #${shortId} esta en preparacion.`;
      case OrderStatus.READY:
        return `Casa del Taco NYC: Tu orden #${shortId} esta lista para recoger.`;
      case OrderStatus.DELIVERED:
        return `Casa del Taco NYC: Tu orden #${shortId} fue entregada. Gracias.`;
      case OrderStatus.CANCELED:
        return `Casa del Taco NYC: Tu orden #${shortId} fue cancelada.`;
      default:
        return null;
    }
  }

  private normalizePhone(phone?: string | null): string | null {
    if (!phone) return null;
    const trimmed = phone.trim();
    if (!trimmed) return null;
    if (/^\+\d{8,15}$/.test(trimmed)) {
      return trimmed;
    }
    return null;
  }
}
