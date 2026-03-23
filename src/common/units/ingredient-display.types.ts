export type MeasurementSystem = 'metric' | 'imperial';

export interface IngredientDisplayPreferences {
  system: MeasurementSystem;   
  preferredWeightUnit?: 'g' | 'kg' | 'oz' | 'lb';
  preferredVolumeUnit?: 'ml' | 'l' | 'fl oz' | 'cup';
  showAltUnits?: boolean;
  locale?: string;
}

export interface InternalIngredientQuantity {
  grams: number;
  milliliters: number;
  count: number;
}

export type IngredientType =
  | 'solid'
  | 'liquid'
  | 'meat'
  | 'produce'
  | 'spice';

export interface IngredientDisplayPrimary {
  value: number;
  unit: string;
  text: string;
}

export interface IngredientDisplayAlt {
  value: number;
  unit: string;
  text: string;
}

export interface PackSuggestion {
  packSize: number;
  packUnit: string;
  packCount: number;
  estimatedWaste: number;
}

export interface PortionSuggestion {
  portionCount: number;
  portionSize: number;
  portionUnit: string;
}

export interface IngredientDisplayResult {
  name: string;
  type: IngredientType;
  internal: InternalIngredientQuantity;

  primary: IngredientDisplayPrimary;

  /**
   * Machine-readable unit for pricing & cost calculation
   * (independent from display text)
   */
  pricingUnit?: {
    type: 'kg' | 'pcs' | 'unit';
    quantity: number;
  };

  alt?: IngredientDisplayAlt[];
  packs?: PackSuggestion;
  portions?: PortionSuggestion;
}

