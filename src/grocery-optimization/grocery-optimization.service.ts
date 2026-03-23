import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOptimizationDto } from './dto/create-optimization.dto';

@Injectable()
export class GroceryOptimizationService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOptimizationDto) {
    return this.prisma.groceryOptimization.create({
      data,
    });
  }

  async getUserHistory(userId: string) {
    return this.prisma.groceryOptimization.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
