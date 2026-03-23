import { SubstitutionDecision } from './substitution.engine';
import { SubstitutionReason } from '../outcome/substitution-reason.collector';

export function adaptSubstitutionDecision(
  decision: SubstitutionDecision,
): SubstitutionReason[] {
  if (!decision.shouldSubstitute) return [];

  if (
    !decision.substitutedItem ||
    !decision.reason ||
    !decision.explanation
  ) {
    return [];
  }

  return [
    {
      originalItem: decision.originalItem,
      substitutedItem: decision.substitutedItem,
      reason: decision.reason,
      explanation: decision.explanation,
    },
  ];
}
