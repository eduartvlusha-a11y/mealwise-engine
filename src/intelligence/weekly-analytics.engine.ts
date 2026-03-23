import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DailyNutritionEngine } from './daily-nutrition.engine';

@Injectable()
export class WeeklyAnalyticsEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyEngine: DailyNutritionEngine,
  ) {}

  /**
   * Full Weekly Intelligence Engine v1
   *
   * - 7-day window (today + previous 6 days)
   * - Per-day nutrition (DailyNutritionEngine)
   * - Per-day spending
   * - Weekly totals and trends
   * - Top ingredients by cost
   * - Basic spending trend vs last week
   *
   * Advanced C-level features (pattern detection, deeper scores)
   * will be added on top of this foundation.
   */
  async analyzeWeek(userId: string) {
    // -----------------------------
    // 1) Define week range (last 7 days)
    // -----------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6); // 7 days window

    // End of day for weekEnd
    const weekEndEndOfDay = new Date(weekEnd);
    weekEndEndOfDay.setHours(23, 59, 59, 999);

    // -----------------------------
    // 2) Load all PriceHistory entries for this user and week
    // -----------------------------
    const entries = await this.prisma.priceHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: weekStart,
          lte: weekEndEndOfDay,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const totalSpent = entries.reduce(
      (sum, entry) => sum + entry.estimatedCost,
      0,
    );

    const currency = entries[0]?.currency || 'EUR';
    const entriesCount = entries.length;

    // -----------------------------
    // 3) Build per-day spending map
    // -----------------------------
    const dailySpentMap: Record<string, number> = {};

    for (const entry of entries) {
      const dayStr = entry.createdAt.toISOString().slice(0, 10);
      dailySpentMap[dayStr] = (dailySpentMap[dayStr] || 0) + entry.estimatedCost;
    }

    // -----------------------------
    // 4) Top ingredients by cost
    // -----------------------------
    const costMap: Record<string, number> = {};

    for (const entry of entries) {
      const name = entry.itemName.toLowerCase();
      costMap[name] = (costMap[name] || 0) + entry.estimatedCost;
    }

    const topIngredients = Object.entries(costMap)
      .map(([name, totalCost]) => ({ name, totalCost }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);

    // -----------------------------
    // 5) Build list of last 7 dates (strings)
    // -----------------------------
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dayStr = d.toISOString().slice(0, 10);
      days.push(dayStr);
    }

    // -----------------------------
    // 6) For each day → call DailyNutritionEngine + attach spending
    // -----------------------------
    const daily: any[] = [];
    let weeklyCalories = 0;
    let weeklyCalorieTarget = 0;

    for (const dayStr of days) {
      const nutrition = await this.dailyEngine.calculate(userId, dayStr);

      weeklyCalories += nutrition.calories;
      weeklyCalorieTarget += nutrition.dailyCalorieTarget;

      const spent = dailySpentMap[dayStr] || 0;

      daily.push({
        ...nutrition,
        spent,
      });
    }

    // -----------------------------
    // 7) Weekly calorie balance
    // -----------------------------
    const weeklyDifference = Math.round(weeklyCalories - weeklyCalorieTarget);

    const weeklyDirection =
      weeklyDifference < 0
        ? 'deficit'
        : weeklyDifference > 0
        ? 'surplus'
        : 'neutral';

    // -----------------------------
    // 8) Spending trend vs last week (same user)
    // -----------------------------
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setHours(23, 59, 59, 999);

    const lastWeekEntries = await this.prisma.priceHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });

    const lastWeekTotal = lastWeekEntries.reduce(
      (sum, entry) => sum + entry.estimatedCost,
      0,
    );

    let trendDirection: 'up' | 'down' | 'same' = 'same';
    let trendPercentage = 0;
    let costDifference = 0;
    let differenceDirection: 'saved' | 'overspent' | 'same' = 'same';

    if (lastWeekTotal > 0) {
      const rawDiff = totalSpent - lastWeekTotal;
      const rawPct = (rawDiff / lastWeekTotal) * 100;

      if (rawDiff > 0) {
        trendDirection = 'up';
        differenceDirection = 'overspent';
        costDifference = rawDiff;
        trendPercentage = rawPct;
      } else if (rawDiff < 0) {
        trendDirection = 'down';
        differenceDirection = 'saved';
        costDifference = Math.abs(rawDiff);
        trendPercentage = Math.abs(rawPct);
      }
    }

    // -----------------------------
    // 9) Monthly projection (based on spending)
    // -----------------------------
    // Take last up-to-3 days with spending, most recent first
    const recentDaily = [...daily]
      .filter((d) => d.spent > 0)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 3);

    let projectedMonthly = 0;

    if (recentDaily.length >= 3) {
      const weighted =
        recentDaily[0].spent * 0.5 +
        recentDaily[1].spent * 0.3 +
        recentDaily[2].spent * 0.2;

      projectedMonthly = weighted * 30;
    } else {
      const weeklyAvg = totalSpent / 7;
      projectedMonthly = weeklyAvg * 30;
    }

    const projectedMonthlyRounded = Math.round(projectedMonthly);

    // -----------------------------
    // 10) Future hooks (C-level intelligence)
    // -----------------------------
    // For now, savingsTip is handled by a higher layer or remains null.
    const savingsTip = null;

    // -----------------------------
    // 11) Final Weekly Intelligence Payload
    // -----------------------------
    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),

      currency,
      entriesCount,
      totalSpent,
      projectedMonthly,
      projectedMonthlyRounded,

      weeklyCalories: Math.round(weeklyCalories),
      weeklyCalorieTarget: Math.round(weeklyCalorieTarget),
      weeklyDifference,
      weeklyDirection,

      daily,
      topIngredients,

      spendingTrend: {
        direction: trendDirection,
        percentage: trendPercentage,
        costDifference,
        differenceDirection,
        lastWeekTotal,
      },

      savingsTip,
    };
  }
}
