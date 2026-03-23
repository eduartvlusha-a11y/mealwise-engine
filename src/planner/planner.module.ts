import { Module, forwardRef } from '@nestjs/common';
import { PlannerController } from './planner.controller';
import { PlannerService } from './planner.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WeeklyPlanEngine } from '../meal-suggestions/weekly-plan.engine';
import { MealSuggestionsModule } from '../meal-suggestions/meal-suggestions.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';




@Module({
  imports: [
    PrismaModule, IntelligenceModule,
    forwardRef(() => MealSuggestionsModule),
  ],
  controllers: [PlannerController],
  providers: [
    PlannerService,
    WeeklyPlanEngine,
  ],
  exports: [PlannerService],
})
export class PlannerModule {}
