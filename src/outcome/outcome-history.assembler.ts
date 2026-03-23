import {
  WeeklyOutcomeHistoryEntry,
  WeeklyOutcomeTrend,
} from './outcome-history.contract';
import { calculateWeeklyOutcomeTrend } from './outcome-trend.calculator';

export interface OutcomeHistoryResult {
  history: WeeklyOutcomeHistoryEntry[];
  trend: WeeklyOutcomeTrend;
}

export function appendWeeklyOutcome(
  history: WeeklyOutcomeHistoryEntry[],
  newEntry: WeeklyOutcomeHistoryEntry,
): OutcomeHistoryResult {
  const updatedHistory = [...history, newEntry];

  const trend = calculateWeeklyOutcomeTrend(updatedHistory);

  return {
    history: updatedHistory,
    trend,
  };
}
