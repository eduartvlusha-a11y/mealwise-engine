import { Module, forwardRef } from '@nestjs/common';
import { MealwiseController } from './mealwise.controller';
import { MealwiseService } from './mealwise.service';

// Import existing modules we orchestrate
import { PlannerModule } from '../planner/planner.module';
import { GroceryModule } from '../grocery/grocery.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { ProfileModule } from '../profile/profile.module';
import { PrismaService } from '../prisma/prisma.service';




@Module({
  imports: [
    forwardRef(() => PlannerModule),
    forwardRef(() => GroceryModule),
    forwardRef(() => IntelligenceModule),
    forwardRef(() => OnboardingModule,),
    forwardRef(() => ProfileModule,),
  ],
  controllers: [MealwiseController],
  providers: [MealwiseService, PrismaService],
  exports: [MealwiseService],   // ✅ MUST EXPORT THIS
})
export class MealwiseModule {}
