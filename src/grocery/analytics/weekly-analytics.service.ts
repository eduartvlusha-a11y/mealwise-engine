import { Injectable } from '@nestjs/common';
import { WeeklyAnalyticsEngine } from '../../intelligence/weekly-analytics.engine';

@Injectable()
export class WeeklyAnalyticsService {
  constructor(
    private readonly weeklyEngine: WeeklyAnalyticsEngine,
  ) {}

  async getIntelligenceWeek(userId: string) {
    return this.weeklyEngine.analyzeWeek(userId);
  }
}
