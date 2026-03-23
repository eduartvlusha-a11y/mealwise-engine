import { Controller, Get, Req } from '@nestjs/common';
import { GroceryAnalyticsService } from './grocery-analytics.service';

@Controller('grocery-analytics')
export class GroceryAnalyticsController {
  constructor(private readonly analyticsService: GroceryAnalyticsService) {}

  @Get('weekly')
  async getWeeklySummary(@Req() req: any) {
  return this.analyticsService.getWeeklySummary(req.user.id);
}

}
