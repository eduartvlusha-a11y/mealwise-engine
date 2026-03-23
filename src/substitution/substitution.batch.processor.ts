import { decideSubstitution } from './substitution.engine';
import { adaptSubstitutionDecision } from './substitution.adapter';
import { SubstitutionReason } from '../outcome/substitution-reason.collector';

type GroceryItem = {
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'other';
};

type BatchContext = {
  budgetStatus: 'WITHIN' | 'OVER';
  diet?: string;
  allergies?: string[];
};

export function processSubstitutions(params: {
  items: GroceryItem[];
  context: BatchContext;
}): SubstitutionReason[] {
  const { items, context } = params;

  const reasons: SubstitutionReason[] = [];

  for (const item of items) {
    const decision = decideSubstitution({
      itemName: item.name,
      category: item.category,
      context,
    });

    const adapted = adaptSubstitutionDecision(decision);
    reasons.push(...adapted);
  }

  return reasons;
}
