import { Injectable } from '@nestjs/common';

export type MeasurementSystem = 'metric' | 'imperial';

export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb';
export type VolumeUnit = 'ml' | 'l' | 'fl_oz' | 'cup';
export type CountUnit = 'pcs';

export type IngredientType =
  | 'solid'
  | 'liquid'
  | 'meat'
  | 'produce'
  | 'spice'
  | 'count';


export interface UnitPreference {
  system: MeasurementSystem;
  weightUnit?: WeightUnit;
  volumeUnit?: VolumeUnit;
}

export interface NormalizedQuantity {
  grams?: number;
  milliliters?: number;
  count?: number;
}

export interface DisplayQuantity {
  value: number;
  unit: string;
}

@Injectable()
export class UnitConversionService {
  private readonly GRAM_PER_KG = 1000;
  private readonly GRAM_PER_OZ = 28.349523125;
  private readonly GRAM_PER_LB = 453.59237;

  private readonly ML_PER_L = 1000;
  private readonly ML_PER_FL_OZ = 29.5735;
  private readonly ML_PER_CUP = 240;

  gramsToKg(grams: number): number {
    return grams / this.GRAM_PER_KG;
  }
  kgToGrams(kg: number): number {
    return kg * this.GRAM_PER_KG;
  }

  gramsToOz(grams: number): number {
    return grams / this.GRAM_PER_OZ;
  }
  ozToGrams(oz: number): number {
    return oz * this.GRAM_PER_OZ;
  }

  gramsToLb(grams: number): number {
    return grams / this.GRAM_PER_LB;
  }
  lbToGrams(lb: number): number {
    return lb * this.GRAM_PER_LB;
  }

  mlToL(ml: number): number {
    return ml / this.ML_PER_L;
  }
  lToMl(liters: number): number {
    return liters * this.ML_PER_L;
  }

  mlToFlOz(ml: number): number {
    return ml / this.ML_PER_FL_OZ;
  }
  flOzToMl(flOz: number): number {
    return flOz * this.ML_PER_FL_OZ;
  }

  mlToCup(ml: number): number {
    return ml / this.ML_PER_CUP;
  }
  cupToMl(cup: number): number {
    return cup * this.ML_PER_CUP;
  }

  normalizeQuantity(
    rawValue: number,
    rawUnit: string,
    ingredientType: IngredientType,
  ): NormalizedQuantity {
    const unit = rawUnit.toLowerCase();

    if (unit === 'pcs' || unit === 'piece' || unit === 'pieces') {
      return { count: rawValue };
    }

    if (ingredientType === 'liquid') {
      if (unit === 'ml') return { milliliters: rawValue };
      if (unit === 'l') return { milliliters: this.lToMl(rawValue) };
      if (unit === 'fl_oz') return { milliliters: this.flOzToMl(rawValue) };
      if (unit === 'cup' || unit === 'cups') return { milliliters: this.cupToMl(rawValue) };
      return { milliliters: rawValue };
    }

    if (unit === 'g') return { grams: rawValue };
    if (unit === 'kg') return { grams: this.kgToGrams(rawValue) };
    if (unit === 'oz') return { grams: this.ozToGrams(rawValue) };
    if (unit === 'lb') return { grams: this.lbToGrams(rawValue) };

    return { grams: rawValue };
  }

  toDisplayWeight(grams: number, pref: UnitPreference): DisplayQuantity {
    const system = pref.system || 'metric';

    if (system === 'metric') {
      const unit = pref.weightUnit || 'g';
      if (unit === 'kg') return { value: this.round(this.gramsToKg(grams)), unit: 'kg' };
      return { value: this.round(grams), unit: 'g' };
    }

    const unit = pref.weightUnit || 'oz';
    if (unit === 'lb') return { value: this.round(this.gramsToLb(grams)), unit: 'lb' };
    return { value: this.round(this.gramsToOz(grams)), unit: 'oz' };
  }

  toDisplayVolume(ml: number, pref: UnitPreference): DisplayQuantity {
    const system = pref.system || 'metric';

    if (system === 'metric') {
      const unit = pref.volumeUnit || 'ml';
      if (unit === 'l') return { value: this.round(this.mlToL(ml)), unit: 'l' };
      return { value: this.round(ml), unit: 'ml' };
    }

    const unit = pref.volumeUnit || 'fl_oz';
    if (unit === 'cup') return { value: this.round(this.mlToCup(ml)), unit: 'cup' };
    return { value: this.round(this.mlToFlOz(ml)), unit: 'fl_oz' };
  }

  toDisplayQuantity(
    normalized: NormalizedQuantity,
    ingredientType: IngredientType,
    pref: UnitPreference,
  ): DisplayQuantity {
    if (normalized.count !== undefined) {
      return { value: this.round(normalized.count), unit: 'pcs' };
    }

    if (ingredientType === 'liquid') {
      if (normalized.milliliters === undefined)
        throw new Error('Liquid missing ml for display');
      return this.toDisplayVolume(normalized.milliliters, pref);
    }

    if (normalized.grams === undefined)
      throw new Error('Solid missing grams for display');
    return this.toDisplayWeight(normalized.grams, pref);
  }

  private round(value: number, decimals = 1): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
