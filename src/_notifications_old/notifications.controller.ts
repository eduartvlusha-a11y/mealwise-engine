import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /notifications/:userId
  @Get(':userId')
  async getNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  // POST /notifications/:userId
  @Post(':userId')
  async createNotification(
    @Param('userId') userId: string,
    @Body() body: { title: string; message: string },
  ) {
    return this.notificationsService.createNotification(
      userId,
      body.title,
      body.message,
    );
  }
}
