import { Module, forwardRef } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MealwiseModule } from '../mealwise/mealwise.module';
import { ProfileModule } from '../profile/profile.module';


@Module({
  imports: [
  forwardRef(() => MealwiseModule),
  ProfileModule,
],

  controllers: [OnboardingController],
  providers: [OnboardingService, PrismaService],
  exports: [OnboardingService], // other modules (Home, Planner, etc.) still can use it
})
export class OnboardingModule {}
