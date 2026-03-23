import { Injectable } from '@nestjs/common';
import { GroceryItemInputDto } from '../dtos/grocery-price.dto';
import { AiClient } from '../../ai/ai.client';
import { COUNTRY_PRICING_TABLE, CountryPricingProfile } from '../config/country-pricing.config';
import { PrismaService } from '../../prisma/prisma.service';



export interface PricedItem {
  name: string;
  grams: number;
  unit: string;
  pricePerUnit: number;
  estimatedCost: number;
}

export interface GroceryPriceResult {
  items: PricedItem[];
  totalCost: number;
  currency: string;
  targetCurrency?: string;
  mode?: string;
  shouldConvert?: boolean;
  activateConversion?: boolean;
  currencySymbol?: string;
  converted?: boolean;
 
}
// ----------------------------------------------------
//  Deterministic substitution rules
// ----------------------------------------------------
const SUBSTITUTION_RULES: Record<string, string[]> = {
  'salmon': ['white fish', 'frozen salmon'],
  'beef': ['chicken breast', 'turkey'],
  'chicken breast': ['whole chicken'],
  'berries': ['bananas', 'apples'],
  'olive oil': ['sunflower oil'],
};

// ----------------------------------------------------
//  Country pack standards (deterministic)
// ----------------------------------------------------
type PackUnit = 'kg' | 'l' | 'pcs';

const COUNTRY_PACK_STANDARDS: Record<
  string,
  {
    // per normalized unit
    defaults: Partial<Record<PackUnit, number>>;
    // item-specific overrides (simple contains match)
    items: Record<string, Partial<Record<PackUnit, number>>>;
  }
> = {
  // Albania (example packs)
  AL: {
    defaults: { kg: 0.5, l: 1.0, pcs: 1 },
    items: {
      eggs: { pcs: 10 },          // common: 10-pack eggs
      milk: { l: 1.0 },
      yogurt: { kg: 0.5 },
      chicken: { kg: 0.5 },
      beef: { kg: 0.5 },
      rice: { kg: 1.0 },
      oats: { kg: 0.5 },
      olive: { l: 1.0 },
      oil: { l: 1.0 },
    },
  },

  // Germany (example packs)
  DE: {
    defaults: { kg: 0.4, l: 1.0, pcs: 1 },
    items: {
      eggs: { pcs: 10 },
      milk: { l: 1.0 },
      chicken: { kg: 0.4 },
      beef: { kg: 0.4 },
      rice: { kg: 1.0 },
      oats: { kg: 0.5 },
      olive: { l: 0.75 },         // 750ml common
      oil: { l: 0.75 },
    },
  },

  // United States (example packs)
  US: {
    defaults: { kg: 0.454, l: 1.0, pcs: 1 }, // ~1 lb as default meat pack
    items: {
      eggs: { pcs: 12 },          // 12-pack common
      milk: { l: 1.89 },          // ~half-gallon
      chicken: { kg: 0.454 },
      beef: { kg: 0.454 },
      rice: { kg: 0.907 },        // ~2 lb
      oats: { kg: 0.907 },        // ~2 lb
      olive: { l: 0.946 },         // ~32oz
      oil: { l: 0.946 },
    },
  },
};


@Injectable()
export class GroceryPricingService {
  constructor(
  private readonly aiClient: AiClient,
  private readonly prisma: PrismaService,
) {}


private priceCache: Record<string, number> = {};

// ----------------------------------------------------
// PHASE 9.1 — Weekly price snapshot (stability lock)
// ----------------------------------------------------
private weeklyPriceSnapshots: Record<string, GroceryPriceResult> = {};


  /**
   * Normalize units so pricing is consistent.
   * We convert:
   * - grams → kilograms
   * - milliliters → liters
   */
  private normalizeUnit(
    grams: number,
    unit: string,
  ): { quantity: number; normalizedUnit: string } {
    const u = unit.toLowerCase();

    // grams → kg
    if (u === 'g' || u === 'gram' || u === 'grams') {
      return {
        quantity: grams / 1000,
        normalizedUnit: 'kg',
      };
    }

    // milliliters → liters
    if (u === 'ml' || u === 'milliliter' || u === 'milliliters') {
      return {
        quantity: grams / 1000,
        normalizedUnit: 'l',
      };
    }

    // already normalized (kg, l, pcs, etc.)
    return {
      quantity: grams,
      normalizedUnit: unit,
    };
  }

  /**
   * Basic price lookup table per country.
   */
  private getBasePrice(name: string, countryCode: string): number | null {
    const key = name.toLowerCase();

    const basePrices: Record<string, Record<string, number>> = {
      AL: {
  // 🥩 MEAT & FISH (€/kg)
  'chicken breast': 8.5,
  'chicken': 7.8,
  'beef': 12.0,
  'lean beef': 13.5,
  'salmon': 14.5,
  'white fish': 9.5,
  'turkey breast': 8.9,

  // 🥛 DAIRY & EGGS
  'eggs': 0.30,            // €/piece (handled via count)
  'milk': 1.3,             // €/L
  'plant milk': 2.2,       // €/L
  'yogurt': 2.1,           // €/kg
  'greek yogurt': 3.4,     // €/kg
  'cottage cheese': 4.2,   // €/kg
  'feta cheese': 7.5,      // €/kg
  'cream cheese': 6.8,     // €/kg
  'cheese': 6.5,           // €/kg

  // 🥬 PRODUCE
  'apple': 1.6,            // €/kg
  'banana': 1.4,           // €/kg
  'potato': 0.9,           // €/kg
  'sweet potato': 1.2,     // €/kg
  'tomato': 1.5,           // €/kg
  'onion': 0.8,            // €/kg
  'spinach': 2.0,          // €/kg
  'mushrooms': 2.8,        // €/kg
  'mixed vegetables': 1.4, // €/kg
  'vegetables': 1.2,       // €/kg

  // 🧺 PANTRY
  'rice': 1.8,             // €/kg
  'oats': 1.7,             // €/kg
  'granola': 3.5,          // €/kg
  'chickpeas': 1.9,        // €/kg
  'peanut butter': 4.5,    // €/kg
  'honey': 6.0,            // €/kg
  'cinnamon': 18.0,        // €/kg

  // 🫒 OILS
  'olive oil': 8.0,        // €/L
},

      DE: {
        'chicken breast': 7.5,
        'rice': 1.4,
        'olive oil': 6.5,
      },
    };

    const countryPrices = basePrices[countryCode];
    if (!countryPrices) return null;

    return countryPrices[key] ?? null;
  }

/**
 * Maps currency codes to symbols.
 * Later we will extend this for full conversion.
 */
private getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    ALL: 'L',
  };

  return map[currency] ?? currency;
}

private getCountryPricingProfile(countryCode?: string): CountryPricingProfile | undefined {
  if (!countryCode) return undefined;

  const code = countryCode.toUpperCase().trim();

  if (COUNTRY_PRICING_TABLE[code]) {
    return COUNTRY_PRICING_TABLE[code];
  }

  return undefined;
}

private applyCountryPriceIndex(
  basePricePerUnit: number,
  countryCode?: string,
): number {
  const profile = this.getCountryPricingProfile(countryCode);

  // If we don't know the country, do NOT modify the price.
  if (!profile) return basePricePerUnit;

  return basePricePerUnit * profile.priceIndex;
}


/**
 * Placeholder exchange rate table.
 * Later we can replace with live API or database.
 */
private exchangeRates: Record<string, Record<string, number>> = {
  USD: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.78,
    ALL: 94.0,
  },
  EUR: {
    EUR: 1,
    USD: 1.09,
    GBP: 0.85,
    ALL: 102.0,
  },
  GBP: {
    GBP: 1,
    USD: 1.28,
    EUR: 1.17,
    ALL: 120.0,
  },
  ALL: {
    ALL: 1,
    USD: 0.0105,
    EUR: 0.0098,
    GBP: 0.0083,
  },
};


/**
 * Placeholder for future currency conversion.
 * Currently returns the same price.
 * Later we will apply exchange rates here.
 */
/**
 * Converts between currencies using the placeholder exchange rate table.
 * If conversion is not available, returns the original price.
 */
private convertCurrency(price: number, fromCurrency: string, toCurrency: string): number {
  // No conversion needed
  if (typeof price !== 'number' || isNaN(price)) return 0;
  if (fromCurrency === toCurrency) return price;

  // Check if exchange rates exist
  const fromTable = this.exchangeRates[fromCurrency];
  if (!fromTable) return price;

  const rate = fromTable[toCurrency];
  if (!rate) return price;

  // Apply conversion
  return price * rate;
}
// ----------------------------------------------------
// PHASE 8.6.1 — Pack rounding (deterministic)
// ----------------------------------------------------
private applyPackRounding(
  requiredQuantity: number,
  packSize: number,
) {
  const packCount = Math.ceil(requiredQuantity / packSize);
  const purchasedQuantity = packCount * packSize;
  const waste = purchasedQuantity - requiredQuantity;

  return {
    packSize,
    packCount,
    purchasedQuantity,
    waste,
  };
}

// ----------------------------------------------------
// PHASE 8.8.1 — Resolve pack size by country + item
// ----------------------------------------------------
private resolvePackSize(
  itemName: string,
  normalizedUnit: string,
  countryCode?: string,
): number | null {
  const unit = (normalizedUnit || '').toLowerCase().trim() as PackUnit;
  if (unit !== 'kg' && unit !== 'l' && unit !== 'pcs') return null;

  const cc = (countryCode || 'US').toUpperCase().trim();
  const profile = COUNTRY_PACK_STANDARDS[cc] ?? COUNTRY_PACK_STANDARDS['US'];

  const name = (itemName || '').toLowerCase();

  // 1) item-specific overrides (contains match)
  for (const key of Object.keys(profile.items)) {
    if (name.includes(key)) {
      const override = profile.items[key]?.[unit];
      if (typeof override === 'number' && override > 0) return override;
    }
  }

  // 2) country defaults per unit
  const def = profile.defaults?.[unit];
  if (typeof def === 'number' && def > 0) return def;

  return null;
}


  /**
   * Estimate item price using base price or fallback
   */
  private async estimatePrice(
  name: string,
  quantity: number,
  unit: string,
  countryCode: string,
  currency: string,
): Promise<{ pricePerUnit: number; estimatedCost: number; priceSource: string }> {


  // 0️⃣ CACHE KEY
  const cacheKey = `${countryCode}:${name.toLowerCase()}:${unit}`;

  // 1️⃣ If in cache → return instantly
  if (this.priceCache[cacheKey] !== undefined) {
    const price = this.priceCache[cacheKey];
    return {
  pricePerUnit: this.applyCountryPriceIndex(price, countryCode),
  estimatedCost: price * quantity,
  priceSource: 'cache',
};

  }

  // 2️⃣ Try base price lookup (deterministic)
  const basePrice = this.getBasePrice(name, countryCode);

  if (basePrice !== null) {
    // store in cache
    this.priceCache[cacheKey] = basePrice;

   const indexed = this.applyCountryPriceIndex(basePrice, countryCode);

return {
  pricePerUnit: indexed,
  estimatedCost: indexed * quantity,
  priceSource: 'base',
};


  }

  // 3️⃣ AI fallback
  const prompt = `
Estimate the average ${currency} price per ${unit}
for item "${name}" in ${countryCode}.
Return ONLY a number.
`;

  try {
    const aiResponse = await this.aiClient.chat(prompt);
    const pricePerUnit = parseFloat(aiResponse);

    // Validate
    const safePrice = isNaN(pricePerUnit) ? 0 : pricePerUnit;

    // cache it
    this.priceCache[cacheKey] = safePrice;

    const indexed = this.applyCountryPriceIndex(safePrice, countryCode);

return {
  pricePerUnit: indexed,
  estimatedCost: indexed * quantity,
  priceSource: 'ai',
};


  } catch {
    // 4️⃣ AI error fallback
    this.priceCache[cacheKey] = 0;

    return {
  pricePerUnit: this.applyCountryPriceIndex(0, countryCode),
  estimatedCost: 0,
  priceSource: 'ai-error',
};

  }
}

  /**
   * Main function:
   * Takes consolidated grocery items
   * Returns full pricing result
   */
  async calculatePrices(
  items: GroceryItemInputDto[],
  userId: string,
  countryCode: string,
  currency: string,
  userCurrency?: string,
  source?: string,
  conversionMode?: string,
): Promise<GroceryPriceResult> {

  console.log('PRICING INPUT FIRST ITEM =>', items[0]);

  // ----------------------------------------------------
// PHASE 9.1 — Stability lock: reuse frozen weekly snapshot
// ----------------------------------------------------
// We lock by the current ACTIVE plan identity.
// // Snapshot identity = userId + weekStartKey (passed via `source`)
// One active weekly plan → one frozen price reality

const snapshotKey = `${userId}:${source || 'default'}`;

const existing = this.weeklyPriceSnapshots[snapshotKey];
if (existing) {
  return existing;
}

// ----------------------------------------------------
// PHASE 9.3 — Cold start: resurrect weekly snapshot from DB
// ----------------------------------------------------
const dbSnapshot = await this.prisma.weeklyPriceSnapshot.findFirst({
  where: {
    userId: userId,
    weekKey: source ?? 'unknown',
  },
  orderBy: {
    createdAt: 'desc',
  },
});

if (dbSnapshot) {
  const resurrected = dbSnapshot.snapshot as unknown as GroceryPriceResult;


  // Re-hydrate in-memory cache for fast reuse
  this.weeklyPriceSnapshots[snapshotKey] = resurrected;

  return resurrected;
}



  currency = currency || 'USD';


  // Prepare user-preferred currency
  const targetCurrency = userCurrency || currency;

  // Prepare conversion mode for future behaviour
  const mode = conversionMode || 'none';

  // Determine whether conversion will happen (logic later)
  const shouldConvert =
    targetCurrency !== currency && mode !== 'none';
   const activateConversion = 
     shouldConvert && (mode === 'manual' || mode === 'auto');



  // STEP A — Normalize all items before pricing
  const normalizedItems = items.map((item) => {
  // 🔴 USE pricingUnit — NOT grams
  const pricingUnit = item.pricingUnit;

  if (!pricingUnit) {
 // 🧮 COUNT-BASED FALLBACK (eggs, bottles, packs)
// Runtime payload contains internal.count, DTO does not → safe cast
const internal = (item as any).internal;

if (
  internal &&
  typeof internal.count === 'number' &&
  internal.count > 0
) {
  return {
    name: item.name,
    quantity: internal.count, // pcs
    normalizedUnit: 'pcs',
    originalGrams: item.grams,
    originalUnit: 'count',
  };
}



  // 🔒 Deterministic fallback:
  // If we have grams, assume kg-based pricing
  if (typeof item.grams === 'number' && item.grams > 0) {
    return {
      name: item.name,
      quantity: item.grams / 1000, // grams → kg
      normalizedUnit: 'kg',
      originalGrams: item.grams,
      originalUnit: item.unit,
    };
  }

  // Absolute fallback — still safe
  return {
    name: item.name,
    quantity: 0,
    normalizedUnit: item.unit,
    originalGrams: item.grams,
    originalUnit: item.unit,
  };
}


  return {
    name: item.name,
    quantity: pricingUnit.quantity,
    normalizedUnit: pricingUnit.type, // pcs | kg | unit
    originalGrams: item.grams,
    originalUnit: item.unit,
  };
});


  // STEP B — Apply pricing to each item
  const pricedItems = await Promise.all(
  normalizedItems.map(async (item) => {
    const { pricePerUnit, estimatedCost, priceSource } =
      await this.estimatePrice(
        item.name,
        item.quantity,
        item.normalizedUnit,
        countryCode,
        currency,
      );

      // ----------------------------------------------------
// PHASE 8.8.1 — Apply country pack rounding (deterministic)
// ----------------------------------------------------
const packSize = this.resolvePackSize(
  item.name,
  item.normalizedUnit,
  countryCode,
);

let packInfo: {
  packSize: number;
  packCount: number;
  purchasedQuantity: number;
  waste: number;
} | null = null;

if (packSize && packSize > 0) {
  packInfo = this.applyPackRounding(item.quantity, packSize);
}


    // ⭐ SAVE PRICE HISTORY ENTRY ⭐
   await this.prisma.priceHistory.create({
  data: {
    itemName: item.name,

    pricePerUnit: Number(pricePerUnit) || 0,
    quantity: Number(item.quantity ?? item.originalGrams ?? 0) || 0,
    estimatedCost:
      (Number(pricePerUnit) || 0) *
      (Number(item.quantity ?? item.originalGrams ?? 0) || 0),

    countryCode,
    currency,

    // RELATION — this automatically sets userId correctly
    user: {
      connect: { id: userId }
    }
  }
});


return {
  name: item.name,
  grams: item.originalGrams,
  unit: item.originalUnit,

  pricePerUnit: activateConversion
    ? this.convertCurrency(pricePerUnit, currency, targetCurrency)
    : pricePerUnit,

  estimatedCost: activateConversion
    ? this.convertCurrency(pricePerUnit, currency, targetCurrency) * item.quantity
    : pricePerUnit * item.quantity,

       
  priceSource,
  pack: packInfo,
};

  }),
);


  // STEP C — Calculate total cost
  const totalCost = pricedItems.reduce(
    (sum, item) => sum + item.estimatedCost,
    0,
  );

  const finalTotalCost = activateConversion
  ? this.convertCurrency(totalCost, currency, targetCurrency)
  : totalCost;


  // FINAL OUTPUT
  const result: GroceryPriceResult = {
  currency,                          // base currency
  targetCurrency,                    // user currency (USD, EUR, etc.)
  mode,                              // conversion mode ("none", "auto", "manual")
  shouldConvert,
  activateConversion,

  currencySymbol: this.getCurrencySymbol(currency),
  converted: activateConversion,
  items: pricedItems,
  totalCost: finalTotalCost,
};

// Save frozen snapshot for stability (Phase 9.1)
this.weeklyPriceSnapshots[snapshotKey] = result;
// ----------------------------------------------------
// PHASE 9.2 — Persist weekly price snapshot (DB write)
// ----------------------------------------------------
await this.prisma.weeklyPriceSnapshot.create({
  data: {
    userId: userId,
    weekKey: source ?? 'unknown',
    currency: currency,
    totalCost: finalTotalCost,
    snapshot: result as any,
  },
});


// ----------------------------------------------------
// PHASE 9.2 — Persist weekly price snapshot (DB write)
// ----------------------------------------------------
await this.prisma.weeklyPriceSnapshot.create({
  data: {
    userId: userId,
    weekKey: source ?? 'unknown',
    currency: currency,
    totalCost: finalTotalCost,
    snapshot: result as any, // stored as JSON
  },
});


return result;

}

// ----------------------------------------------------
// PHASE 9.1 — Explicit weekly price invalidation
// ----------------------------------------------------
public invalidateWeeklyPriceSnapshot(
  userId: string,
  source?: string,
) {
  const snapshotKey = `${userId}:${source || 'default'}`;

  if (this.weeklyPriceSnapshots[snapshotKey]) {
    delete this.weeklyPriceSnapshots[snapshotKey];
  }
}

// ----------------------------------------------------
// Compute substitution savings (deterministic)
// ----------------------------------------------------
public computeSubstitutionSuggestions(
  items: {
    name: string;
    estimatedCost: number;
  }[],
  countryCode: string,
): {
  item: string;
  alternatives: {
    name: string;
    estimatedSavings: number;
  }[];
}[] {
  const suggestions: {
    item: string;
    alternatives: {
      name: string;
      estimatedSavings: number;
    }[];
  }[] = [];

  for (const item of items) {
    const key = item.name.toLowerCase();
    const alternatives = SUBSTITUTION_RULES[key];

    if (!alternatives || item.estimatedCost <= 0) continue;

    const altSuggestions = alternatives.map((alt) => {
      // VERY conservative assumption: 20% cheaper
      const estimatedSavings = item.estimatedCost * 0.2;

      return {
        name: alt,
        estimatedSavings,
      };
    });

    if (altSuggestions.length > 0) {
      suggestions.push({
        item: item.name,
        alternatives: altSuggestions,
      });
    }
  }

  return suggestions;
}

}
