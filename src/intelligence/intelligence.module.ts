import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { IntelligenceService } from './intelligence.service';
import { IntelligenceController } from './intelligence.controller';

import { DailyNutritionEngine } from './daily-nutrition.engine';
import { WeeklyAnalyticsEngine } from './weekly-analytics.engine';
import { GroceryModule } from '../grocery/grocery.module';
import { AiModule } from '../ai/ai.module'; // ✅ ADD

@Module({
  imports: [
    PrismaModule,
    AiModule, // ✅ ADD (NO forwardRef needed here)
    forwardRef(() => GroceryModule), // keep as-is
  ],
  controllers: [IntelligenceController],
  providers: [IntelligenceService, DailyNutritionEngine, WeeklyAnalyticsEngine],
  exports: [IntelligenceService, DailyNutritionEngine, WeeklyAnalyticsEngine],
})
export class IntelligenceModule {}
