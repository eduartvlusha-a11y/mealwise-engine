import { UnitPreference, MeasurementSystem } from '../services/unit-conversion.service';
import { Onboarding } from '@prisma/client';

export function mapOnboardingToUnitPreference(onb: Onboarding): UnitPreference {
  const system = (onb.preferredSystem as MeasurementSystem) || 'metric';

  return {
    system,
    weightUnit:
      (onb.preferredWeightUnit as any) ||
      (system === 'metric' ? 'g' : 'oz'),

    volumeUnit:
      (onb.preferredVolumeUnit as any) ||
      (system === 'metric' ? 'ml' : 'fl_oz'),
  };
}
