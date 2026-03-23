import { buildWeeklyOutcomeSummary } from './weekly-outcome.builder';
import { EconomicImpactSummary } from './economic-impact.summary';

// 🔒 Derive the outcome type directly from the real builder
export type WeeklyOutcomeSummary = ReturnType<
  typeof buildWeeklyOutcomeSummary
>;

export interface WeeklyOutcomeHistoryEntry {
  userId: string;
  weekStart: string;
  weekEnd: string;

  outcome: WeeklyOutcomeSummary;
  economic: EconomicImpactSummary;

  createdAt: string; // ISO date string
}

export interface WeeklyOutcomeTrend {
  weeksTracked: number;

  averageNetSavings: number;
  bestWeekSavings: number;
  worstWeekSavings: number;

  explanation: string;
}
