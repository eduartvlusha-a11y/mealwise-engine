import { Controller, Get } from '@nestjs/common';
import { MealwiseService } from './mealwise/mealwise.service'; // adjust path if needed

@Controller()
export class AppController {
  constructor(private readonly mealwiseService: MealwiseService) {}

  @Get()
  async run() {
    return this.mealwiseService.buildFullWeekSummary({
      userId: "demo-user-id", // ⚠️ IMPORTANT
      currency: "USD",
      pricingMode: "auto",
      countryCode: "US"
    });
  }
}