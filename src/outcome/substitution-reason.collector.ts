export type SubstitutionReason = {
  originalItem: string;
  substitutedItem: string;
  reason: 'BUDGET' | 'AVAILABILITY' | 'CONSTRAINT';
  explanation: string;
};

export function collectSubstitutionReasons(
  reasons: SubstitutionReason[] = [],
): {
  count: number;
  explanations: string[];
} {
  return {
    count: reasons.length,
    explanations: reasons.map((r) => r.explanation),
  };
}
