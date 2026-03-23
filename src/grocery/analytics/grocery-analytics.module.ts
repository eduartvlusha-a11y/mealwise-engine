import { Module } from '@nestjs/common';
import { GroceryAnalyticsController } from './grocery-analytics.controller';
import { GroceryAnalyticsService } from './grocery-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

import { AiModule } from '../../ai/ai.module';
import { IntelligenceModule } from '../../intelligence/intelligence.module';
import { WeeklyAnalyticsService } from './weekly-analytics.service';



@Module({
  imports: [AiModule, IntelligenceModule],
  controllers: [GroceryAnalyticsController],
  providers: [GroceryAnalyticsService, PrismaService, WeeklyAnalyticsService],
  exports: [GroceryAnalyticsService],
})
export class GroceryAnalyticsModule {}
