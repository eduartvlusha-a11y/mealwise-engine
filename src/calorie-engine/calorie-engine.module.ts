import { Module } from '@nestjs/common';
import { CalorieEngineController } from './calorie-engine.controller';
import { CalorieEngineService } from './calorie-engine.service';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [OnboardingModule],
  controllers: [CalorieEngineController],
  providers: [CalorieEngineService],
})
export class CalorieEngineModule {}
