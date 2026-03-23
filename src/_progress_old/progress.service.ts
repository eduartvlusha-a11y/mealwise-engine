import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /progress/:userId
  async getUserProgress(userId: string) {
    return this.prisma.progress.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  // POST /progress/:userId
  async addWeightEntry(userId: string, weight: number) {
    return this.prisma.progress.create({
      data: {
        userId,
        weight,
      },
    });
  }
}
