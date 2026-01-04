import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendEmail(to: string, subject: string, body: string) {
    // TODO: Implementar envío de email
    return { sent: false };
  }
}
