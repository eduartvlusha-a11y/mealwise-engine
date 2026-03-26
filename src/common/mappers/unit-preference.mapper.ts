import { UnitPreference, MeasurementSystem } from '../services/unit-conversion.service';


export function mapOnboardingToUnitPreference(onb: any): UnitPreference {
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
