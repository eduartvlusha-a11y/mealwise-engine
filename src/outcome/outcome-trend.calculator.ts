import {
  WeeklyOutcomeHistoryEntry,
  WeeklyOutcomeTrend,
} from './outcome-history.contract';

export function calculateWeeklyOutcomeTrend(
  history: WeeklyOutcomeHistoryEntry[],
): WeeklyOutcomeTrend {
  if (!history.length) {
    return {
      weeksTracked: 0,
      averageNetSavings: 0,
      bestWeekSavings: 0,
      worstWeekSavings: 0,
      explanation: 'No weekly outcomes available to calculate trends.',
    };
  }

  const savings = history.map(
    (h) => h.economic.netSavings ?? 0,
  );

  const weeksTracked = savings.length;

  const total = savings.reduce((sum, v) => sum + v, 0);
  const averageNetSavings =
    Math.round((total / weeksTracked) * 100) / 100;

  const bestWeekSavings = Math.round(Math.max(...savings) * 100) / 100;
  const worstWeekSavings = Math.round(Math.min(...savings) * 100) / 100;

  const explanation =
    weeksTracked === 1
      ? 'Only one week tracked; trend analysis is limited.'
      : `Across ${weeksTracked} weeks, average weekly savings were €${averageNetSavings}. Best week saved €${bestWeekSavings}, worst week saved €${worstWeekSavings}.`;

  return {
    weeksTracked,
    averageNetSavings,
    bestWeekSavings,
    worstWeekSavings,
    explanation,
  };
}
