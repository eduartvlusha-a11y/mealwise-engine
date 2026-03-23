export class GeneratePlanDto {
  days?: number; // default 7

  // Optional overrides (normally we read these from onboarding)
  dietaryPreferences?: string[];
  allergies?: string[];
  budget?: number;
  country?: string;
}
