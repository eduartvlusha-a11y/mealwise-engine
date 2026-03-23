import { Controller, Get, Req } from '@nestjs/common';
import { CalorieEngineService } from './calorie-engine.service';

@Controller('calories')
export class CalorieEngineController {
  constructor(private readonly calorieEngineService: CalorieEngineService) {}

  // GET /calories → daily calories for logged-in user
  @Get()
  async getMyCalories(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.calorieEngineService.calculateDailyCalories(userId);
  }
}
