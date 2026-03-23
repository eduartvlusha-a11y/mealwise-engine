export class GenerateGroceryDto {
  // override number of days (optional)
  days?: number;

  // override budget (optional)
  budget?: number;

  // override dietary preferences (optional)
  dietaryPreferences?: string[];

  // override allergies (optional)
  allergies?: string[];
}
