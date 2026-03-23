import {
  IngredientDisplayPreferences,
  IngredientDisplayResult,
  IngredientDisplayPrimary,
  IngredientDisplayAlt,
  PackSuggestion,
  PortionSuggestion,
  InternalIngredientQuantity,
  IngredientType,
  MeasurementSystem,
} from '../units/ingredient-display.types';

import { Injectable } from '@nestjs/common';

@Injectable()
export class IngredientDisplayService {

  // ======================================================
  // BASIC CONVERSIONS (old engine – still active)
  // ======================================================

  gramsToOunces(g: number): number {
    return g / 28.3495;
  }

  ouncesToPounds(oz: number): number {
    return oz / 16;
  }

  gramsToKilograms(g: number): number {
    return g / 1000;
  }

  mlToCups(ml: number): number {
    return ml / 240;
  }

  mlToTbsp(ml: number): number {
    return ml / 15;
  }

  mlToTsp(ml: number): number {
    return ml / 5;
  }

  mlToLiters(ml: number): number {
    return ml / 1000;
  }

  // ======================================================
  // PRODUCE COUNT ESTIMATION (old helper)
  // ======================================================

  estimateCount(grams: number, avgWeight: number): number {
    if (!avgWeight || avgWeight <= 0) return 0;
    return Math.round(grams / avgWeight);
  }

  // ======================================================
  // OLD ENGINE (still active until C2 is fully built)
  // ======================================================

  applySmartDisplay(ingredient: any, userSystem: 'metric' | 'imperial') {
    const type = ingredient.ingredientType;
    const g = ingredient.internal.grams;
    const ml = ingredient.internal.milliliters;

    // PRODUCE
    if (type === 'produce') {
      const avg = ingredient.avgWeightPerUnit ?? 120; 
      const count = this.estimateCount(g, avg);

      if (userSystem === 'metric') {
        return {
          value: count,
          unit: 'pcs',
          alt: `${(g >= 1000 ? (g/1000).toFixed(2)+' kg' : g + ' g')}`
        };
      } else {
        const oz = this.gramsToOunces(g);
        return {
          value: count,
          unit: 'pcs',
          alt: `${oz >= 16 ? (this.ouncesToPounds(oz).toFixed(2)+' lb') : oz.toFixed(2)+' oz'}`
        };
      }
    }

    // LIQUIDS
    if (type === 'liquid') {
      if (userSystem === 'metric') {
        if (ml >= 1000) return { value: Number(this.mlToLiters(ml).toFixed(2)), unit: 'l' };
        return { value: ml, unit: 'ml' };
      } else {
        if (ml >= 240) return { value: Number(this.mlToCups(ml).toFixed(2)), unit: 'cups' };
        if (ml >= 15) return { value: Math.round(this.mlToTbsp(ml)), unit: 'tbsp' };
        if (ml >= 5) return { value: Math.round(this.mlToTsp(ml)), unit: 'tsp' };
        return { value: 1, unit: 'tsp' }; 
      }
    }

    // MEAT / SOLIDS
    if (userSystem === 'metric') {
      if (g >= 1000) return { value: Number(this.gramsToKilograms(g).toFixed(2)), unit: 'kg' };
      return { value: g, unit: 'g' };
    } else {
      const oz = this.gramsToOunces(g);
      if (oz >= 16) return { value: Number(this.ouncesToPounds(oz).toFixed(2)), unit: 'lb' };
      return { value: Number(oz.toFixed(2)), unit: 'oz' };
    }
  }

 
  /**
 * NEW MealWise C2 display wrapper
 * This is now the ONLY display engine used by the app.
 */
toDisplay(ingredient: any): any {
  ingredient = JSON.parse(JSON.stringify(ingredient));
  const prefs: IngredientDisplayPreferences = {
    system: 'metric',       // will connect to onboarding later
    showAltUnits: true,     // Intelligent Mode always ON
  };

  return this.newToDisplay(
    ingredient.name,
    ingredient.ingredientType,
    ingredient.internal,
    prefs,
  );
}


  // ======================================================
  // C2 ENGINE SCAFFOLDING (NEW ARCHITECTURE)
  // ======================================================

  /**
   * New C2 entry point (does nothing yet)
   */
  newToDisplay(
  name: string,
  type: IngredientType,
  internal: InternalIngredientQuantity,
  prefs: IngredientDisplayPreferences,
): IngredientDisplayResult {

  const system = prefs.system || 'metric';

  switch (type) {
    case 'liquid':
      return this.displayLiquid(name, type, internal, prefs, system);

    case 'meat':
      return this.displayMeat(name, type, internal, prefs, system);

    case 'produce':
      return this.displayProduce(name, type, internal, prefs, system);

    case 'spice':
      return this.displaySpice(name, type, internal, prefs, system);

    case 'solid':
    default:
      return this.displaySolid(name, type, internal, prefs, system);
  }
}

  private displayLiquid(
    name: string,
    type: IngredientType,
    internal: InternalIngredientQuantity,
    prefs: IngredientDisplayPreferences,
    system: MeasurementSystem,
  ): IngredientDisplayResult {
    return this.placeholder(name, type, internal);
  }

  private displaySolid(
  name: string,
  type: IngredientType,
  internal: InternalIngredientQuantity,
  prefs: IngredientDisplayPreferences,
  system: MeasurementSystem,
): IngredientDisplayResult {

  const grams = internal.grams;
  const alt: IngredientDisplayAlt[] = [];

  let value: number;
  let unit: string;
  let text: string;

  // -------------------------------------
  // PRIMARY UNIT (METRIC OR IMPERIAL)
  // -------------------------------------
  if (system === 'metric') {
    if (grams >= 1000) {
      value = Number((grams / 1000).toFixed(2));
      unit = 'kg';
    } else {
      value = grams;
      unit = 'g';
    }
  } else {
    // imperial primary
    const oz = grams / 28.3495;
    if (oz >= 16) {
      value = Number((oz / 16).toFixed(2));
      unit = 'lb';
    } else {
      value = Number(oz.toFixed(2));
      unit = 'oz';
    }
  }

  text = `${value} ${unit}`;

  // -------------------------------------
  // ALT UNITS (ALWAYS SHOWN IN B MODE)
  // -------------------------------------

  // 1) grams / kg alt
  alt.push({
    value: grams,
    unit: 'g',
    text: `≈ ${grams} g`,
  });

  // 2) oz alt
  const ozAlt = grams / 28.3495;
  alt.push({
    value: Number(ozAlt.toFixed(2)),
    unit: 'oz',
    text: `≈ ${Number(ozAlt.toFixed(2))} oz`,
  });

  // 3) lb alt
  if (ozAlt >= 16) {
    const lb = ozAlt / 16;
    alt.push({
      value: Number(lb.toFixed(2)),
      unit: 'lb',
      text: `≈ ${Number(lb.toFixed(2))} lb`,
    });
  }

  // 4) cups alt (simple approximate density)
  const approxMl = grams; // 1g ≈ 1ml fallback
  const cups = approxMl / 240;
  alt.push({
    value: Number(cups.toFixed(cups < 1 ? 2 : 1)),
    unit: 'cup',
    text: `≈ ${Number(cups.toFixed(cups < 1 ? 2 : 1))} cups`,
  });

  // -------------------------------------
  // PORTION ESTIMATION
  // -------------------------------------
  const portionSize = 150; 
  const portionCount = Math.max(1, Math.round(grams / portionSize));

  const portions: PortionSuggestion = {
    portionCount,
    portionSize,
    portionUnit: 'g',
  };

  // -------------------------------------
  // PACK SUGGESTION (250g, 500g, 1kg)
  // -------------------------------------
  const packSizes = [250, 500, 1000];
  let bestPack = null;

  for (const size of packSizes) {
    const count = Math.ceil(grams / size);
    const waste = count * size - grams;

    if (!bestPack || waste < bestPack.waste) {
      bestPack = { size, count, waste };
    }
  }

  const packs: PackSuggestion = {
    packSize: bestPack.size,
    packUnit: 'g',
    packCount: bestPack.count,
    estimatedWaste: bestPack.waste,
  };

  return {
    name,
    type,
    internal,
    primary: { value, unit, text },
    alt,
    packs,
    portions,
  };
}


  private displayMeat(
  name: string,
  type: IngredientType,
  internal: InternalIngredientQuantity,
  prefs: IngredientDisplayPreferences,
  system: MeasurementSystem,
): IngredientDisplayResult {

  const grams = internal.grams;
  const alt: IngredientDisplayAlt[] = [];

  let value: number;
  let unit: string;
  let text: string;

  // -------------------------------------
  // PRIMARY UNIT (MEAT FOCUSED)
  // -------------------------------------
  if (system === 'metric') {
    if (grams >= 1000) {
      value = Number((grams / 1000).toFixed(2));
      unit = 'kg';
    } else {
      value = grams;
      unit = 'g';
    }
  } else {
    // imperial – favor lb for meat
    const oz = grams / 28.3495;
    const lb = oz / 16;

    if (lb >= 1) {
      value = Number(lb.toFixed(2));
      unit = 'lb';
    } else {
      value = Number(oz.toFixed(2));
      unit = 'oz';
    }
  }

  text = `${value} ${unit}`;

  // -------------------------------------
  // ALT UNITS (ALWAYS, INTELLIGENT MODE)
  // -------------------------------------

  // grams alt
  alt.push({
    value: grams,
    unit: 'g',
    text: `≈ ${grams} g`,
  });

  // kg alt if relevant
  if (grams >= 1000) {
    const kg = grams / 1000;
    alt.push({
      value: Number(kg.toFixed(2)),
      unit: 'kg',
      text: `≈ ${Number(kg.toFixed(2))} kg`,
    });
  }

  // oz alt
  const ozAlt = grams / 28.3495;
  alt.push({
    value: Number(ozAlt.toFixed(2)),
    unit: 'oz',
    text: `≈ ${Number(ozAlt.toFixed(2))} oz`,
  });

  // lb alt if >= 1 lb
  if (ozAlt >= 16) {
    const lbAlt = ozAlt / 16;
    alt.push({
      value: Number(lbAlt.toFixed(2)),
      unit: 'lb',
      text: `≈ ${Number(lbAlt.toFixed(2))} lb`,
    });
  }

  // -------------------------------------
  // PORTION ESTIMATION (MEAT)
  // -------------------------------------
  const portionSize = 130; // 130g per meat portion
  const portionCount = Math.max(1, Math.round(grams / portionSize));

  const portions: PortionSuggestion = {
    portionCount,
    portionSize,
    portionUnit: 'g',
  };

  // -------------------------------------
  // PACK SUGGESTION (250g, 500g, 1kg)
  // -------------------------------------
  const packSizes = [250, 500, 1000];
  let bestPack = null as null | { size: number; count: number; waste: number };

  for (const size of packSizes) {
    const count = Math.ceil(grams / size);
    const waste = count * size - grams;

    if (!bestPack || waste < bestPack.waste) {
      bestPack = { size, count, waste };
    }
  }

  const packs: PackSuggestion = {
    packSize: bestPack.size,
    packUnit: 'g',
    packCount: bestPack.count,
    estimatedWaste: bestPack.waste,
  };

  return {
    name,
    type,
    internal,
    primary: { value, unit, text },
    alt,
    packs,
    portions,
  };
}
private getAvgPieceWeight(name: string): number | null {
  const n = name.toLowerCase();

  if (n.includes('banana')) return 120;
  if (n.includes('apple')) return 150;
  if (n.includes('orange')) return 140;
  if (n.includes('tomato')) return 100;
  if (n.includes('egg')) return 60;
  if (n.includes('avocado')) return 180;
  if (n.includes('potato')) return 150;
  if (n.includes('carrot')) return 70;

  return null;
}

  private displayProduce(
  name: string,
  type: IngredientType,
  internal: InternalIngredientQuantity,
  prefs: IngredientDisplayPreferences,
  system: MeasurementSystem,
): IngredientDisplayResult {

  const grams = internal.grams;
  const alt: IngredientDisplayAlt[] = [];

  // -------------------------------------
  // ESTIMATE PIECES
  // -------------------------------------
  const avgPiece = this.getAvgPieceWeight(name);
  const pcs = avgPiece ? Math.max(1, Math.round(grams / avgPiece)) : null;

  let primaryValue: number;
  let primaryUnit: string;
  let primaryText: string;

  // -------------------------------------
  // PRIMARY DISPLAY (PRODUCE = PCS FIRST)
  // -------------------------------------
  if (pcs !== null) {
    primaryValue = pcs;
    primaryUnit = 'pcs';
    primaryText = `${pcs} pcs`;
  } else {
    // fallback to grams
    primaryValue = grams;
    primaryUnit = 'g';
    primaryText = `${grams} g`;
  }

  // -------------------------------------
  // ALT UNITS (INTELLIGENT MODE)
  // -------------------------------------

  // 1) grams alt
  alt.push({
    value: grams,
    unit: 'g',
    text: `≈ ${grams} g`,
  });

  // 2) kg alt
  if (grams >= 1000) {
    const kg = grams / 1000;
    alt.push({
      value: Number(kg.toFixed(2)),
      unit: 'kg',
      text: `≈ ${Number(kg.toFixed(2))} kg`,
    });
  }

  // 3) oz alt
  const oz = grams / 28.3495;
  alt.push({
    value: Number(oz.toFixed(2)),
    unit: 'oz',
    text: `≈ ${Number(oz.toFixed(2))} oz`,
  });

  // 4) cups alt (produce density approx)
  const approxMl = grams; // fallback: 1g ≈ 1ml
  const cups = approxMl / 240;

  alt.push({
    value: Number(cups.toFixed(cups < 1 ? 2 : 1)),
    unit: 'cup',
    text: `≈ ${Number(cups.toFixed(cups < 1 ? 2 : 1))} cups`,
  });

  // -------------------------------------
  // PORTION (produce default = 80g)
  // -------------------------------------
  const portionSize = 80; 
  const portionCount = Math.max(1, Math.round(grams / portionSize));

  const portions: PortionSuggestion = {
    portionCount,
    portionSize,
    portionUnit: 'g',
  };

  // -------------------------------------
  // PACK SUGGESTION (250g, 500g, 1kg)
  // -------------------------------------
  const packSizes = [250, 500, 1000];
  let bestPack = null as null | { size: number; count: number; waste: number };

  for (const size of packSizes) {
    const count = Math.ceil(grams / size);
    const waste = count * size - grams;

    if (!bestPack || waste < bestPack.waste) {
      bestPack = { size, count, waste };
    }
  }

  const packs: PackSuggestion = {
    packSize: bestPack.size,
    packUnit: 'g',
    packCount: bestPack.count,
    estimatedWaste: bestPack.waste,
  };

  // -----------------------------
// Pricing unit (machine-readable)
// -----------------------------
// -----------------------------
// Pricing unit (machine-readable)
// -----------------------------
const pricingUnit =
  internal.count > 0
    ? { type: 'pcs' as const, quantity: internal.count }
    : type === 'liquid'
      ? { type: 'unit' as const, quantity: 1 }
      : { type: 'kg' as const, quantity: (grams ?? 0) / 1000 };


  return {
  name,
  type,
  internal,
  primary: {
    value: primaryValue,
    unit: primaryUnit,
    text: primaryText,
  },
  pricingUnit,
  alt,
  packs,
  portions,
};

}


  private displaySpice(
  name: string,
  type: IngredientType,
  internal: InternalIngredientQuantity,
  prefs: IngredientDisplayPreferences,
  system: MeasurementSystem,
): IngredientDisplayResult {

  const grams = internal.grams;
  const alt: IngredientDisplayAlt[] = [];

  // --------------------------------------------------
  // FALLBACK: spices often measured by volume
  // assume average density: 1 tsp ≈ 2.5g (common for spices)
  // --------------------------------------------------
  const tspApprox = grams / 2.5;
  const tbspApprox = tspApprox / 3;

  let value: number;
  let unit: string;
  let text: string;

  // PRIMARY UNIT (MEALWISE INTELLIGENT)
  if (tspApprox < 1.5) {
    // small amounts → tsp
    value = Number(tspApprox.toFixed(1));
    unit = 'tsp';
  } else if (tspApprox < 4.5) {
    // medium → tbsp
    value = Number(tbspApprox.toFixed(1));
    unit = 'tbsp';
  } else {
    // large → grams directly
    value = grams;
    unit = 'g';
  }

  text = `${value} ${unit}`;

  // ------------------------------
  // ALT UNITS (ALWAYS IN MODE B)
  // ------------------------------

  // grams alt
  alt.push({
    value: grams,
    unit: 'g',
    text: `≈ ${grams} g`,
  });

  // tsp alt
  alt.push({
    value: Number(tspApprox.toFixed(1)),
    unit: 'tsp',
    text: `≈ ${Number(tspApprox.toFixed(1))} tsp`,
  });

  // tbsp alt
  alt.push({
    value: Number(tbspApprox.toFixed(1)),
    unit: 'tbsp',
    text: `≈ ${Number(tbspApprox.toFixed(1))} tbsp`,
  });

  // --------------------------------
  // PORTIONS (SPICES = ALWAYS 1 USE)
  // --------------------------------
  const portions: PortionSuggestion = {
    portionCount: 1,
    portionSize: value,
    portionUnit: unit,
  };

  // --------------------------------
  // PACK SIZES → NOT APPLIED TO SPICES
  // --------------------------------

  return {
    name,
    type,
    internal,
    primary: { value, unit, text },
    alt,
    portions,
  };
}


  /**
   * Placeholder while C2 logic is not implemented
   */
  private placeholder(
    name: string,
    type: IngredientType,
    internal: InternalIngredientQuantity,
  ): IngredientDisplayResult {
    return {
      name,
      type,
      internal,
      primary: {
        value: 0,
        unit: '',
        text: '',
      },
    };
  }
}
