import { Module, forwardRef } from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { GroceryController } from './grocery.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PlannerModule } from '../planner/planner.module';
import { GroceryOptimizationModule } from '../grocery-optimization/grocery-optimization.module';
import { AiModule } from '../ai/ai.module';
import { GroceryPricingService } from './pricing/grocery-pricing.service';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { GroceryFromMealsEngine } from './grocery-from-meals.engine';
import { CommonModule } from '../common/common.module';
import { IngredientDisplayService } from '../common/services/ingredient-display.service';
import { ProfileModule } from '../profile/profile.module';


@Module({
  imports: [
    PrismaModule,
    forwardRef(() => PlannerModule),
    GroceryOptimizationModule,
    AiModule,
    CommonModule,
    forwardRef(() => IntelligenceModule),
    ProfileModule,
  ],
  controllers: [GroceryController],
  providers: [
    GroceryService,
    GroceryPricingService,
    GroceryFromMealsEngine,
    IngredientDisplayService,
  ],
  exports: [
    GroceryService,
    GroceryPricingService,
    GroceryFromMealsEngine,
  ],
})
export class GroceryModule {}
