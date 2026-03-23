import { Module } from '@nestjs/common';
import { GroceryOptimizationService } from './grocery-optimization.service';
import { GroceryOptimizationController } from './grocery-optimization.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],  // nothing required here
  controllers: [GroceryOptimizationController],
  providers: [GroceryOptimizationService, PrismaService],
  exports: [GroceryOptimizationService],   // ← CRITICAL FIX
})
export class GroceryOptimizationModule {}
