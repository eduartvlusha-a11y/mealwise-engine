import { Controller, Get, Query, Req } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';

@Controller('intelligence')
export class IntelligenceController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
  ) {}

  /**
   * DAILY INTELLIGENCE
   * - Full nutrition block for a single day
   * - Future: daily grocery + pricing when engine is wired
   *
   * GET /intelligence/daily?date=YYYY-MM-DD (optional)
   */
  @Get('daily')
  async getDailyIntelligence(
    @Req() req: any,
    @Query('date') date?: string,
  ) {
    const userId = req.user.userId;
    return this.intelligenceService.getDailyIntelligence(userId, date);
  }

  /**
   * WEEKLY INTELLIGENCE
   * - Uses WeeklyAnalyticsEngine
   * - Nutrition + spending trends + projections
   *
   * GET /intelligence/weekly
   * Optional: weekStart, weekEnd (YYYY-MM-DD)
   */
  @Get('weekly')
  async getWeeklyIntelligence(
    @Req() req: any,
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    const userId = req.user.userId;
    return this.intelligenceService.getWeeklyIntelligence(
      userId,
      weekStart,
      weekEnd,
    );
  }

  /**
   * COMBINED INTELLIGENCE
   * - Today + current week, one shot
   *
   * GET /intelligence/combined
   */
  @Get('combined')
  async getCombinedIntelligence(@Req() req: any) {
    const userId = req.user.userId;
    return this.intelligenceService.getCombinedIntelligence(userId);
  }

  /**
   * LEGACY ROUTE: /intelligence/grocery
   * Kept for backward compatibility.
   * Now it simply returns the same as /intelligence/combined.
   */
  @Get('grocery')
  async getGroceryIntelligence(@Req() req: any) {
    const userId = req.user.userId;
    return this.intelligenceService.getCombinedIntelligence(userId);
  }
}
