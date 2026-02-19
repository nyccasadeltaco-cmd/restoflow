import { Injectable, Logger } from '@nestjs/common';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderNotificationsService } from './order-notifications.service';
// Use CommonJS require to avoid default-import interop issues in Nest build/runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require('twilio');

@Injectable()
export class TwilioNotificationService {
  private readonly logger = new Logger(TwilioNotificationService.name);
  private client: ReturnType<typeof twilio> | null = null;

  constructor(
    private readonly orderNotificationsService: OrderNotificationsService,
  ) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (sid && token) {
      this.client = twilio(sid, token);
    }
  }

  async sendOrderStatusSms(order: Order): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        `SMS skipped for order ${order.id}: Twilio client not configured (missing SID/TOKEN).`,
      );
      return;
    }
    const from = process.env.TWILIO_FROM_NUMBER?.trim();
    const to = this.normalizePhone(order.customerPhone);

    if (!from) {
      this.logger.warn(
        `SMS skipped for order ${order.id}: TWILIO_FROM_NUMBER is missing.`,
      );
      return;
    }
    if (!to) {
      this.logger.warn(
        `SMS skipped for order ${order.id}: customer phone is missing/invalid (${order.customerPhone ?? 'null'}).`,
      );
      return;
    }

    const body = this.buildStatusMessage(order);
    if (!body) {
      this.logger.warn(
        `SMS skipped for order ${order.id}: no template for status ${order.status}.`,
      );
      return;
    }

    try {
      const statusCallback = process.env.TWILIO_STATUS_CALLBACK_URL?.trim();
      const payload = { from, to, body } as any;
      if (statusCallback) {
        payload.statusCallback = statusCallback;
      }

      const message = await this.client.messages.create(payload);
      await this.safeLogOutboundSms({
        orderId: order.id,
        toPhone: to,
        template: order.status,
        providerStatus: String(message.status ?? '').toUpperCase() || null,
        providerMessageSid: message.sid ?? null,
        payload: {
          to,
          from,
          body,
          statusCallback: statusCallback ?? null,
        },
      });
      this.logger.log(
        `SMS sent for order ${order.id}: sid=${message.sid}, status=${message.status}`,
      );
    } catch (error: any) {
      await this.safeLogOutboundSms({
        orderId: order.id,
        toPhone: to,
        template: order.status,
        providerStatus: 'FAILED',
        errorMessage: error?.message ?? String(error),
        payload: { to, from, body },
      });
      this.logger.warn(
        `SMS send failed for order ${order.id}: ${error?.message ?? error}`,
      );
    }
  }

  private async safeLogOutboundSms(input: {
    orderId?: string | null;
    toPhone?: string | null;
    template?: string | null;
    providerStatus?: string | null;
    providerMessageSid?: string | null;
    errorMessage?: string | null;
    payload?: Record<string, any> | null;
  }): Promise<void> {
    try {
      await this.orderNotificationsService.logOutboundSms(input);
    } catch (error) {
      this.logger.warn(
        `Failed to persist SMS notification log: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private buildStatusMessage(order: Order): string | null {
    const shortId = order.id.slice(0, 8).toUpperCase();
    switch (order.status) {
      case OrderStatus.PENDING:
        return `Casa del Taco NYC: Recibimos tu orden #${shortId}. Te avisamos cuando este en preparacion.`;
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

    // Accept common US inputs like "(646) 791-0116", "6467910116", "16467910116".
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    if (/^\+\d{8,15}$/.test(trimmed)) {
      return trimmed;
    }
    return null;
  }
}
