import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('email')
  @ApiOperation({ summary: 'Enviar email' })
  sendEmail(@Body() body: any) {
    return this.notificationsService.sendEmail(body.to, body.subject, body.body);
  }
}
