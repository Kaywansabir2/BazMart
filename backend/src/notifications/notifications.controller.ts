import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { verifySessionToken } from '../auth/jwt.util';

@Controller('api/v1')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  async getNotifications(
    @Query('phone') phone?: string,
    @Query('type') type?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    let customerId: string | undefined;
    let customerPhone = phone;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const payload = verifySessionToken(token);
      if (payload) {
        customerId = payload.sub;
        if (!customerPhone && payload.phone) {
          customerPhone = payload.phone;
        }
      }
    }

    return this.notificationsService.getNotifications({
      phone: customerPhone,
      customerId,
      type,
    });
  }

  @Patch('notifications/:id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('notifications/read-all')
  async markAllRead(
    @Body('phone') phone?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    let customerId: string | undefined;
    let customerPhone = phone;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const payload = verifySessionToken(token);
      if (payload) {
        customerId = payload.sub;
        if (!customerPhone && payload.phone) {
          customerPhone = payload.phone;
        }
      }
    }

    return this.notificationsService.markAllAsRead(customerPhone, customerId);
  }

  @Post('admin/notifications/broadcast')
  async broadcast(@Body() body: {
    titleEn: string;
    titleCkb?: string;
    titleAr?: string;
    bodyEn: string;
    bodyCkb?: string;
    bodyAr?: string;
    type?: string;
  }) {
    return this.notificationsService.broadcastNotification(body);
  }
}
