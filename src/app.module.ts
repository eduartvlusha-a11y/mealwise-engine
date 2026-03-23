import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

// Modules
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { CalorieEngineModule } from './calorie-engine/calorie-engine.module';
import { PlannerModule } from './planner/planner.module';
import { GroceryModule } from './grocery/grocery.module';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { GroceryOptimizationModule } from './grocery-optimization/grocery-optimization.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { MealSuggestionsModule } from './meal-suggestions/meal-suggestions.module';
import { MealwiseModule } from './mealwise/mealwise.module';
import { HomeModule } from './home/home.module';
import { FoodLogModule } from './food-log/food-log.module';
import { PaymentModule } from './payments/payment.module';



// Guards
import { JwtAuthGuard } from './auth/guards/jwt.guard';

@Module({
  imports: [
    ProfileModule,
    AuthModule,
    OnboardingModule,
    CalorieEngineModule,
    PlannerModule,
    GroceryModule,
    AnalyzerModule,
    GroceryOptimizationModule,
    IntelligenceModule,
    MealSuggestionsModule,
    MealwiseModule,
    HomeModule,
    FoodLogModule,
    PaymentModule,


  ],
  providers: [
    {
      provide: APP_GUARD, 
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
