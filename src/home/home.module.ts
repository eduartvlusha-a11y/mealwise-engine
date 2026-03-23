import { Module, forwardRef } from '@nestjs/common';
import { HomeController } from './home.controller';

import { AuthModule } from '../auth/auth.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { MealSuggestionsModule } from '../meal-suggestions/meal-suggestions.module';
import { MealwiseModule } from '../mealwise/mealwise.module';

@Module({
  imports: [
    AuthModule,
    OnboardingModule,
    MealSuggestionsModule,
    forwardRef(() => MealwiseModule),  // gives access to MealwiseService
  ],
  controllers: [HomeController],
  providers: [],  // ❌ REMOVE HomeService — we no longer use it
})
export class HomeModule {}
