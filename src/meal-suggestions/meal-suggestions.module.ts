import { Module } from '@nestjs/common';
import { MealSuggestionsService } from './meal-suggestions.service';
import { MealRulesEngine } from './meal-rules.engine';
import { MealAiEngine } from './meal-ai.engine';
import { WeeklyPlanEngine } from './weekly-plan.engine';
import { MealSuggestionsController } from './meal-suggestions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';


@Module({
  imports: [
    PrismaModule, IntelligenceModule,
    CommonModule,   // for any shared helpers/services, safe to keep
  ],
  controllers: [MealSuggestionsController],
  providers: [
    MealSuggestionsService,
    MealRulesEngine,
    MealAiEngine,
    WeeklyPlanEngine,
    // ❌ GroceryFromMealsEngine REMOVED – it belongs to GroceryModule only
  ],
  exports: [
    MealSuggestionsService,
    MealRulesEngine,   // <-- add this
    MealAiEngine,
    WeeklyPlanEngine,
  ],
})
export class MealSuggestionsModule {}
