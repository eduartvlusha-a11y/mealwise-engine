import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /notifications/:userId
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // POST /notifications/:userId
  async createNotification(
    userId: string,
    title: string,
    message: string,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  }
}
