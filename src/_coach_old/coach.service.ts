import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CoachService {
  constructor(private prisma: PrismaService) {}

  async getMessages(userId: string) {
    return this.prisma.coachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveMessage(
    userId: string,
    message: string,
    question?: string
  ) {
    return this.prisma.coachMessage.create({
      data: {
        userId,
        message,
        question,
      },
    });
  }
}
