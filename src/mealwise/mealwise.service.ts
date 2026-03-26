import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PlannerService } from '../planner/planner.service';
import { GroceryService } from '../grocery/grocery.service';
import { GroceryPricingService } from '../grocery/pricing/grocery-pricing.service';
import { WeeklyAnalyticsEngine } from '../intelligence/weekly-analytics.engine';
import { GroceryItemInputDto } from '../grocery/dtos/grocery-price.dto';
import { DailyNutritionEngine } from '../intelligence/daily-nutrition.engine';
import { MEAL_TEMPLATES } from '../meal-suggestions/meal-templates.table';
import { decideStrategy } from '../intelligence/decision/decision.engine';
import { computeMetrics, Diet } from '../intelligence/metrics/metrics.engine';
import { OnboardingService } from '../onboarding/onboarding.service';
import { buildReasoning } from '../intelligence/decision/decision.engine';
import { MealwiseResults } from '../intelligence/results/results.contract';
import { ProfileService } from '../profile/profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AiClient } from '../ai/ai.client';
import { buildAIStrategyAdvisor } from '../intelligence/advisor/ai-strategy-advisor';
import { GroceryFromMealsEngine } from '../grocery/grocery-from-meals.engine';
import { ExplanationBuilder } from '../explanation/explanation.builder';


import {
  buildWeeklyReasoning,
} from '../intelligence/reasoning/weekly-reasoning.builder';



// =====================================
// DB-SAFE SANITIZATION HELPERS
// =====================================

function sanitizeJsonForPrisma<T>(input: T): T {
  if (input === null) return input;

  const t = typeof input;

  if (t === 'number') {
    const n = input as unknown as number;
    return Number.isFinite(n) ? input : (0 as unknown as T);
  }

  if (t === 'string' || t === 'boolean') return input;

  if (Array.isArray(input)) {
    return input.map(v => sanitizeJsonForPrisma(v)) as unknown as T;
  }

  if (input instanceof Date) {
    return input.toISOString() as unknown as T;
  }

  if (t === 'object') {
    const obj = input as unknown as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      out[key] = sanitizeJsonForPrisma(value);
    }

    return out as unknown as T;
  }

  return null as unknown as T;
}

function toDateOrThrow(value: string | Date, fieldName: string): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid Date for ${fieldName}: ${String(value)}`);
  }

  return date;
}



export interface MealwiseOrchestratorRequest {
  userId: string;
  weekStart?: string;
  currency?: 'USD' | 'EUR' | 'GBP' | 'ALL' | 'NONE';
  pricingMode?: 'none' | 'auto' | 'manual';
  countryCode?: string;
}

export interface MealwiseOrchestratorResponse {
  weekPlan: any;
  grocery: any;
  pricing: any;
  intelligence: any;
  results: MealwiseResults;
  planIsValid?: boolean;
  decisionScore: {
    score: number;
    breakdown: {
      protein: number;
      calories: number;
      consistency: number;
      budget: number;
    };
  };
    // ----------------------------------------------------
  // 🔒 CORE METRICS — EXPOSED FOR UI EXPLAINABILITY
  // ----------------------------------------------------
  metrics: {
    maintenanceCalories: number;      // TDEE
    dailyCaloriesTarget: number;
    dailyProteinTarget: number;
    weeklyCaloriesTarget: number;
    weeklyBudget: number;
  };
    // ----------------------------------------------------
  //  Budget status (deterministic)
  // ----------------------------------------------------
  budgetStatus?: {
    weeklyTotal: number | null;
    weeklyBudget: number | null;
    overBudget: boolean;
    overAmount: number;
    remainingBudget: number;
  };

    // ----------------------------------------------------
  // PHASE 8.7.4 — Substitution suggestions (read-only)
  // ----------------------------------------------------
  substitutionSuggestions?: {
    item: string;
    alternatives: {
      name: string;
      estimatedSavings: number;
    }[];
  }[];



  protein: {
    today: number;
    target: number;
      // 🔎 Weekly quality signals (observability only)
  fallbackSignals?: {
    date: string;
    category: string;
    reason: string;
  }[];

  };
}


function computeCaloriesFromMacros(
  protein = 0,
  carbs = 0,
  fats = 0,
): number {
  return protein * 4 + carbs * 4 + fats * 9;
}
// =======================================
// 🔥 WHY THIS MEAL? (PURE EXPLANATION)
// =======================================
function explainMeal(input: {
  mealCategory?: string;
  calorieClass?: string;
  proteinClass?: string;
  costEfficiency?: string;
  diet?: string;
  goal?: 'lose' | 'maintain' | 'gain' | string;
  budgetPressure?: 'low' | 'medium' | 'high' | string;
}): string {

  const reasons: string[] = [];

  // --- Calorie logic (REAL SELECTION SIGNAL, goal-aware)
if (input.calorieClass && input.goal) {
  if (input.goal === 'lose') {
    reasons.push(`keeps calories ${input.calorieClass} to support weight loss`);
  } else if (input.goal === 'gain') {
    reasons.push(`uses a ${input.calorieClass} calorie level to support weight gain`);
  } else {
    reasons.push(`maintains calories in the ${input.calorieClass} range`);
  }
} else if (input.calorieClass) {
  reasons.push(`falls into the ${input.calorieClass} calorie range`);
}


  // --- Protein strategy (REAL SELECTION SIGNAL)
  if (input.proteinClass) {
    reasons.push(`uses a ${input.proteinClass} protein profile`);
  }

  // --- Budget logic (REAL SELECTION SIGNAL, pressure-aware)
if (input.costEfficiency && input.budgetPressure) {
  if (input.budgetPressure === 'high') {
    reasons.push(`chosen for high cost efficiency under a tight budget`);
  } else {
    reasons.push(`rated ${input.costEfficiency} for cost efficiency`);
  }
} else if (input.costEfficiency) {
  reasons.push(`rated ${input.costEfficiency} for cost efficiency`);
}


  // --- Diet compatibility (REAL SELECTION SIGNAL)
  if (input.diet) {
    reasons.push(`compatible with your ${input.diet} diet`);
  }

  // --- Safety: must always explain at least 2 real reasons
  const picked = reasons.slice(0, 3);

  if (picked.length < 2) {
    return 'Explanation not available yet.';
  }

  const prefix =
    input.mealCategory === 'breakfast'
      ? 'Breakfast chosen because it'
      : input.mealCategory === 'lunch'
      ? 'Lunch chosen because it'
      : input.mealCategory === 'dinner'
      ? 'Dinner chosen because it'
      : 'Snack chosen because it';

  return `${prefix} ${picked.join(', ')}.`;
}


// =======================================
// 🔥 DAILY DECISION SCORE (PURE FUNCTION)
// =======================================
function calculateDailyDecisionScore(input: {
  caloriesToday: number;
  calorieTarget: number;
  proteinToday: number;
  proteinTarget: number;
  mealsCount: number;
  budgetSpentToday?: number;
}): {
  score: number;
  breakdown: {
    protein: number;
    calories: number;
    consistency: number;
    budget: number;
  };
} {
  // --- Protein discipline (40%)
  const proteinRatio =
    input.proteinTarget > 0
      ? input.proteinToday / input.proteinTarget
      : 0;

  const proteinScore = Math.min(100, Math.round(proteinRatio * 100));

  // --- Calorie discipline (30%)
  const calorieDiff =
    input.calorieTarget > 0
      ? Math.abs(input.caloriesToday - input.calorieTarget) /
        input.calorieTarget
      : 1;

  const calorieScore = Math.max(
    0,
    Math.round(100 - calorieDiff * 100),
  );

  // --- Consistency (20%)
  const consistencyScore =
    input.mealsCount >= 3 ? 100 : input.mealsCount * 33;

  // --- Budget awareness (10%) — neutral for now
  const budgetScore = 80;

  // --- Weighted total
  const score = Math.round(
    proteinScore * 0.4 +
      calorieScore * 0.3 +
      consistencyScore * 0.2 +
      budgetScore * 0.1,
  );

  return {
    score,
    breakdown: {
      protein: proteinScore,
      calories: calorieScore,
      consistency: consistencyScore,
      budget: budgetScore,
    },
  };
}


@Injectable()
export class MealwiseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plannerService: PlannerService,
    private readonly groceryService: GroceryService,
    private readonly pricingService: GroceryPricingService,
    private readonly weeklyAnalyticsEngine: WeeklyAnalyticsEngine,
    private readonly dailyNutritionEngine: DailyNutritionEngine,
    @Inject(forwardRef(() => OnboardingService))
private readonly onboardingService: OnboardingService,

    private readonly profileService: ProfileService,
    private readonly groceryFromMealsEngine: GroceryFromMealsEngine,
    private readonly groceryPricingService: GroceryPricingService,


  ) {}

  /**
   * MAIN REAL MEALWISE ORCHESTRATOR
   */
  
  async buildFullWeekSummary(
    
  params: MealwiseOrchestratorRequest,
): Promise<
  MealwiseOrchestratorResponse & {
    fallbackSignals?: {
      date: string;
      category: string;
      reason: string;
    }[];
    reasoning?: {
      weekly: {
        summary: string;
        details: string[];
      };
    };
  }
> {
console.log('🔥 HIT: buildFullWeekSummary');


    const {
      userId,
      weekStart,
      currency = 'USD',
      pricingMode = 'auto',
      countryCode = 'US',
    } = params;
    const ai = new AiClient();
   


    const profile = await this.profileService.getProfile(userId);


    if (!profile) {
      throw new Error(
        'User profile is missing. Onboarding must be completed before generating a plan.',
      );
    }

    // 1️⃣ REAL weekly plan
    



    
// 🔥 PROTEIN TARGET (TEMP — NO DB YET)



// 🔥 NORMALIZED METRICS PROFILE (ADAPTER)


const metricsProfile = {
  heightCm: Number(profile.height),
  weightKg: Number(profile.weight),
  age: Number(profile.age),

  gender: (profile.gender === 'female' ? 'female' : 'male') as 'male' | 'female',


  activityLevel: profile.activityLevel as
    | 'sedentary'
    | 'light'
    | 'moderate'
    | 'active'
    | 'very_active',

  goal: profile.goal as 'lose' | 'maintain' | 'gain',


  diet: (profile.diet as Diet) ?? 'none',



  allergies: profile.allergies ?? [],

  weeklyBudget: Number(profile.weeklyBudget ?? 0),


  currency: currency === 'ALL' || currency === 'NONE' ? 'USD' : currency,

  // 👇 ULTRA FIELDS (FROM preferences JSON)
  trainsRegularly: profile.trainsRegularly ?? false,
bodyType: (profile.bodyType as 'slim' | 'average' | 'athletic' | 'heavy') ?? 'average',


};

// 🔥 METRICS ENGINE (TRUTH)
console.log('🔥 METRICS PROFILE INPUT', {
  heightCm: metricsProfile.heightCm,
  weightKg: metricsProfile.weightKg,
  age: metricsProfile.age,
  gender: metricsProfile.gender,
  activityLevel: metricsProfile.activityLevel,
  goal: metricsProfile.goal,
  weeklyBudget: metricsProfile.weeklyBudget,
  trainsRegularly: metricsProfile.trainsRegularly,
  bodyType: metricsProfile.bodyType,
});

console.log('🔥 METRICS FINAL INPUT', {
  weight: metricsProfile.weightKg,
  height: metricsProfile.heightCm,
  age: metricsProfile.age,
  goal: metricsProfile.goal,
  activity: metricsProfile.activityLevel,
});

const metrics = computeMetrics(metricsProfile);
console.log('🔥 METRICS PROOF', {
  userId,
  weight: profile.weight,
  goal: profile.goal,
  calories: metrics.dailyCaloriesTarget,
});

const aiStrategyInput = {
  userId,

  targets: {
    dailyCalories: metrics.dailyCaloriesTarget,
    dailyProtein: metrics.dailyProteinTarget,
    weeklyCalories: metrics.weeklyCaloriesTarget,
  },

  structure: {
    mealsPerDay: metrics.mealCountHint,
  },

  constraints: {
    weeklyBudget: metrics.weeklyBudget,
  },

  context: {
    country: countryCode,
    currency,
    pricingMode,
  },
};
const aiStrategyAdvisor = {
  title: 'Strategy Advisor (Pre-Plan)',

  summary: `Plan structured to meet ${metrics.dailyCaloriesTarget} kcal/day and ${metrics.dailyProteinTarget} g protein with ${metrics.mealCountHint} meals per day.`,

  bullets: [
    `Calories target enforced via deterministic engine.`,
    `Protein target enforced to support goal.`,
    `Meal structure fixed before grocery derivation.`,
    `Groceries derived strictly from planned meals.`,
    `Budget checked last: ${metrics.weeklyBudget} ${currency}/week.`,
  ],
};


const strategy = decideStrategy(metricsProfile, metrics);
// 3️⃣ Generate weekly plan from DETERMINISTIC targets + strategy (ULTRA)
const activePlan = await this.prisma.userPlan.findFirst({
  where: { userId, status: 'ACTIVE' },
  orderBy: { createdAt: 'desc' },
});

if (!activePlan) {
  throw new Error('No ACTIVE plan found. Generate a plan first.');
}

const weekPlan = activePlan.planJson as any;


const planIsValid = weekPlan?.isValid ?? false;


const reasoning = buildReasoning({
  metrics: {
    goal: metricsProfile.goal,
    bodyType: metricsProfile.bodyType,
    trainsRegularly: metricsProfile.trainsRegularly,
    weeklyBudget: metricsProfile.weeklyBudget,
    riskFlags: metrics.riskFlags,
  },
  strategy: {
    mealStructure: `${strategy.mealStructure} meals`,
    macroFocus: strategy.macroFocus,
    foodStrategy: strategy.foodStrategy,
  },
});

const results: MealwiseResults = {
  metrics: {
    bmr: metrics.bmr,
    tdee: metrics.tdee,
    dailyCaloriesTarget: metrics.dailyCaloriesTarget,
    dailyProteinTarget: metrics.dailyProteinTarget,
    weeklyCaloriesTarget: metrics.weeklyCaloriesTarget,
    weeklyBudget: metrics.weeklyBudget,
    mealCountHint: metrics.mealCountHint,
    riskFlags: metrics.riskFlags,
  },

  strategy: {
    mealStructure: strategy.mealStructure,       // ✅ number 3|4|5
    macroEmphasis: strategy.macroEmphasis,       // ✅ protein|volume|balanced
    macroFocus: strategy.macroFocus,             // ✅ string
    foodStrategy: strategy.foodStrategy,         // ✅ budget_simple|balanced_variety|performance
    conflicts: strategy.conflicts,               // ✅ string[]
  },

  reasoning,
  aiStrategyAdvisor, // ✅ buildReasoning output
};



// 🔥 STRATEGY DECISION (RULE-BASED, SAFE)




// 🔥 REAL TARGETS
const calorieTarget = metrics.dailyCaloriesTarget;
const proteinTarget = metrics.dailyProteinTarget;


// 🔥 ATTACH MACROS + CALORIES FROM MEAL TEMPLATES
for (const day of weekPlan?.days || []) {
  const safeDay = day as any;

  for (const meal of (safeDay.meals ?? safeDay.plan?.meals ?? [])) {


    const template = MEAL_TEMPLATES.find(
      (t) => t.id === meal.templateId,
    );

    if (!template) continue;

    meal.protein = template.protein ?? 0;
meal.carbs = template.carbs ?? 0;
meal.fats = template.fats ?? 0;

meal.calories =
  (template.protein ?? 0) * 4 +
  (template.carbs ?? 0) * 4 +
  (template.fats ?? 0) * 9;

  (meal as any).explanation = explainMeal({
  mealCategory: meal.category,
  calorieClass: template.calorieClass,
  proteinClass: template.proteinClass,
  costEfficiency: template.costEfficiency,
  diet: template.diet,
  goal: metricsProfile.goal, // 👈 ONLY NEW LINE
});



  }
}


const todayISO = new Date().toISOString().split('T')[0];

const todayDay = (weekPlan?.days || []).find(
  (d: any) => d.date === todayISO,
);

const safeTodayDay = todayDay as any;

const todayMeals =
  safeTodayDay?.meals ??
  safeTodayDay?.plan?.meals ??
  [];
console.log(
  '🧪 HOME MEALS EXPLANATION CHECK =>',
  todayMeals.map((m: any) => ({
    id: m.templateId ?? m.id,
    explanation: m.explanation,
  })),
);



const caloriesToday = todayMeals.reduce(
  (sum: number, meal: any) => sum + (meal.calories ?? 0),
  0,
);

const proteinToday = todayMeals.reduce(
  (sum: number, meal: any) => sum + (meal.protein ?? 0),
  0,
);

const decisionScore = calculateDailyDecisionScore({
  caloriesToday,
  calorieTarget,
  proteinToday,
  proteinTarget,
  mealsCount: todayMeals.length,
});



   // 2️⃣ Real grocery list (canonical, frozen)
const grocery = await this.groceryService.getWeekly(userId);




    // 3️⃣ Build pricing items
    const itemsForPricing: GroceryItemInputDto[] = (grocery.items || []).map(
      (item: any) => ({
        name: item.name,
        grams:
      Number(item.grams) ||
      Number(item.internal?.grams) ||
      Number(item.display?.value) ||
      0,
        unit: item.unit ?? item.display?.unit ?? 'g',
      }),
    );

    // 4️⃣ Real pricing
    const pricing = await this.pricingService.calculatePrices(
      itemsForPricing,
      userId,
      countryCode,
      currency,
      currency,
      'mealwise-orchestrator',
      pricingMode,
    );

    // ----------------------------------------------------
// PHASE 8.1 — Attach pricing to grocery (read-only)
// ----------------------------------------------------
const merged = this.mergePricingIntoGrocery(grocery, pricing);
const pricedGrocery = merged.grocery;


    // 5️⃣ Real intelligence
    const intelligence = await this.weeklyAnalyticsEngine.analyzeWeek(userId);
    // 🔎 WEEKLY REASONING — EXPLAIN ONLY (NO AI, NO BEHAVIOR)
const weeklyReasoning = buildWeeklyReasoning({
  weekStart: weekPlan?.weekStart,
  weekEnd: weekPlan?.weekEnd,
  fallbackSignals: weekPlan?.fallbackFlags ?? [],
  metrics: {
    weeklyCaloriesTarget: metrics.weeklyCaloriesTarget,
    dailyCaloriesTarget: metrics.dailyCaloriesTarget,
    weeklyBudget: metrics.weeklyBudget,
  },
});

// ----------------------------------------------------
// PHASE 8.7.1 — Budget comparison (deterministic)
// ----------------------------------------------------
const weeklyTotal = pricing?.totalCost ?? null;
const weeklyBudget = metrics?.weeklyBudget ?? null;

const explanation = ExplanationBuilder.build({
  metrics: {
    maintenanceCalories: metrics.tdee,
    dailyCaloriesTarget: metrics.dailyCaloriesTarget,
    dailyProteinTarget: metrics.dailyProteinTarget,
    weeklyCaloriesTarget: metrics.weeklyCaloriesTarget,
    weeklyBudget: metrics.weeklyBudget,
  },

  meals: (weekPlan?.days ?? []).flatMap((day: any) => {
    const meals = day.meals ?? day.plan?.meals ?? [];

    return meals.map((meal: any) => ({
      ingredients: Array.isArray(meal.ingredients)
        ? meal.ingredients.map((i: any) => ({
            name: String(i.name),
          }))
        : [],
    }));
  }),

  groceryPricing: {
  plannedCost: Number(pricing?.totalCost ?? 0),
  estimatedWaste: Math.max(
    0,
    Number(pricing?.totalCost ?? 0) - Number(metrics.weeklyBudget),
  ),
},


  userWeightKg: Number(profile.weight),
});


const overBudget =
  weeklyTotal != null &&
  weeklyBudget != null &&
  weeklyTotal > weeklyBudget;

const overAmount =
  overBudget && weeklyTotal != null && weeklyBudget != null
    ? weeklyTotal - weeklyBudget
    : 0;

const remainingBudget =
  !overBudget && weeklyTotal != null && weeklyBudget != null
    ? weeklyBudget - weeklyTotal
    : 0;

    // ----------------------------------------------------
// PHASE 8.7.4 — Substitution suggestions (read-only)
// ----------------------------------------------------
const substitutionSuggestions =
  overBudget && pricing?.items
    ? this.groceryPricingService.computeSubstitutionSuggestions(


        pricing.items.map((i) => ({
          name: i.name,
          estimatedCost: i.estimatedCost,
        })),
        profile?.country ?? 'US',
      )
    : [];

console.log(
  '🧠 EXPLANATION EXPOSED =>',
  Object.keys(explanation),
);

 return {
  weekPlan: {
  ...weekPlan,
  explanation,
},

  planIsValid,
  grocery: pricedGrocery,
  pricing,
  budgetStatus: {
    weeklyTotal,
    weeklyBudget,
    overBudget,
    overAmount,
    remainingBudget,
    
  },
  substitutionSuggestions,

  intelligence,
  results,
  decisionScore,

    // ----------------------------------------------------
  // 🔒 CORE METRICS — EXPOSED FOR UI EXPLAINABILITY
  // ----------------------------------------------------
  metrics: {
  maintenanceCalories: metrics.tdee, 
  dailyCaloriesTarget: metrics.dailyCaloriesTarget,
  dailyProteinTarget: metrics.dailyProteinTarget,
  weeklyCaloriesTarget: metrics.weeklyCaloriesTarget,
  weeklyBudget: metrics.weeklyBudget,
},


  // Keep protein block for backward compatibility
  protein: {
    today: proteinToday,
    target: proteinTarget,
  },
};



  }

  private normalizeMetricsForUI(raw: any) {
  if (!raw) return null;

  // Already normalized → return as-is
  if (raw.maintenanceCalories != null) return raw;

  return {
    maintenanceCalories: raw.tdee ?? 0,
    dailyCaloriesTarget: raw.dailyCaloriesTarget ?? 0,
    dailyProteinTarget: raw.dailyProteinTarget ?? 0,
    weeklyCaloriesTarget: raw.weeklyCaloriesTarget ?? 0,
    weeklyBudget: raw.weeklyBudget ?? 0,
  };
}


 async getWeeklyGrocery(userId: string) {
  // 1️⃣ HARD GATE — PROFILE
  const profile = await this.profileService.getProfile(userId);
  if (!profile) {
    return {
      needsOnboarding: true,
      hasProfile: false,
      hasPlan: false,
      grocery: null,
    };
  }

  // 2️⃣ HARD GATE — ACTIVE PLAN
  const activePlan = await this.prisma.userPlan.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  if (!activePlan) {
    return {
      needsOnboarding: false,
      hasProfile: true,
      hasPlan: false,
      grocery: null,
    };
  }

  // 3️⃣ ONLY NOW derive grocery
  const grocery = await this.groceryService.getWeekly(userId);

  return {
    needsOnboarding: false,
    hasProfile: true,
    hasPlan: true,
    grocery,
  };
}

/**
   * AUTOMATIC INITIALIZATION AFTER ONBOARDING (Option C)
   */
 async initializeUserAfterOnboarding(userId: string) {
  // 1️⃣ Ensure profile exists
  await this.profileService.upsertProfileFromOnboarding(userId);

  // 2️⃣ Create FIRST canonical ACTIVE plan (metrics + meals)
  await this.startPlan(userId);
}


  /**
 * PREMIUM HOME — READ ACTIVE PLAN ONLY
 */
async buildPremiumHome(userId: string) {
  console.log('🔥 HIT: buildPremiumHome');

  console.log('🟡 BEFORE findFirst ACTIVE plan');

  const activePlan = await this.prisma.userPlan.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  const profile = await this.profileService.getProfile(userId);


 console.log('🟢 AFTER findFirst ACTIVE plan');


 if (!profile) {
  return { needsOnboarding: true, hasProfile: false, hasPlan: false };
}

if (!activePlan) {
  return {
  needsOnboarding: false,
  hasProfile: true,
  hasPlan: false,
  weekPlan: null,
  metrics: null,
  strategy: null,
  eatenKeys: [],
  todayPlan: null,
};

}



  // ✅ Local cast (Prisma JSON typing fix)
  const planJson = activePlan.planJson as any;

  // --------------------------------------------------
// 🔒 HARD GATE — INVALIDATED PLAN (PROFILE CHANGED)
// If plan exists but is no longer valid, Home must
// behave as "no active plan"
// --------------------------------------------------
if (planJson?.isValid === false) {
  return {
    needsOnboarding: false,
    hasProfile: true,
    hasPlan: false,
  };
}

  // ----------------------------------
// PLAN EXPIRATION CHECK (READ-ONLY)
// ----------------------------------
const today = new Date();
today.setHours(0, 0, 0, 0);

const planEnd = planJson?.weekEnd
  ? new Date(planJson.weekEnd)
  : null;

const planIsExpired =
  planEnd != null && today > planEnd;

  // =======================================
// 🔒 FIX #1 — NORMALIZE PLAN DAYS (CRITICAL)
// Supports BOTH shapes:
// - days[].meals
// - days[].plan.meals
// =======================================

const rawDays = Array.isArray(planJson?.days) ? planJson.days : [];

const normalizedDays = rawDays.map((day: any) => {
  const meals =
    Array.isArray(day?.meals)
      ? day.meals
      : Array.isArray(day?.plan?.meals)
      ? day.plan.meals
      : [];

  return {
    ...day,
    meals,            // 👈 canonical
    plan: { meals },  // 👈 backward compatibility
  };
});

// 🔒 overwrite ONLY days
planJson.days = normalizedDays;

  const metrics = this.normalizeMetricsForUI(activePlan.metricsJson);

  const explanation = ExplanationBuilder.build({
  metrics: {
  maintenanceCalories: metrics.maintenanceCalories,
  dailyCaloriesTarget: metrics.dailyCaloriesTarget,
  dailyProteinTarget: metrics.dailyProteinTarget,
  weeklyCaloriesTarget: metrics.weeklyCaloriesTarget,
  weeklyBudget: metrics.weeklyBudget,
},


  meals: (planJson?.days ?? []).flatMap((day: any) =>
    (day.meals ?? []).map((meal: any) => ({
      ingredients: Array.isArray(meal.ingredients)
        ? meal.ingredients.map((i: any) => ({
            name: String(i.name),
          }))
        : [],
    })),
  ),

  groceryPricing: {
    plannedCost: 0,
    estimatedWaste: 0,
  },

  userWeightKg: Number(planJson?.profile?.weight ?? 0),
});

    // ✅ STEP 2.3 — resolve "today" as a PLAN DAY (not calendar reality)
  const todayISO = new Date().toISOString().split('T')[0];

  const planDays = planJson?.days || [];
  const todayDay =
    planDays.find((d: any) => String(d.date).startsWith(todayISO)) ??
    planDays[0]; // fallback: first day of active plan

  const dayDate = todayDay?.date ? new Date(todayDay.date) : new Date();

  const eatenLogs: any[] = [];


  const eatenKeys = eatenLogs.map(
    (l: any) => String(l.templateId ?? l.name),
  );

  console.log(
  '🧪 PLAN JSON STORED =>',
  JSON.stringify(planJson, null, 2),
);




  // 🔒 Canonical TODAY PLAN (HOME CONTRACT)
const todayMeals =
  todayDay?.meals ??
  todayDay?.plan?.meals ??
  [];

if (todayMeals.length === 0) {
  // Graceful fallback: use first day with meals
  const fallbackDay = planDays.find(
    (d: any) => Array.isArray(d.meals) && d.meals.length > 0,
  );

  if (!fallbackDay) {
    return {
  needsOnboarding: false,
  hasProfile: true,
  hasPlan: false,
  weekPlan: null,
  metrics: this.normalizeMetricsForUI(activePlan.metricsJson),
  strategy: activePlan.strategyJson ?? null,
  eatenKeys,
  todayPlan: null,
};

  }

  const fallbackMeals = fallbackDay.meals;

  const totalCaloriesPlanned = fallbackMeals.reduce(
    (sum: number, meal: any) => sum + (meal.calories ?? 0),
    0,
  );

  const macrosPlanned = {
    protein: fallbackMeals.reduce(
      (sum: number, meal: any) => sum + (meal.protein ?? 0),
      0,
    ),
    carbs: fallbackMeals.reduce(
      (sum: number, meal: any) => sum + (meal.carbs ?? 0),
      0,
    ),
    fats: fallbackMeals.reduce(
      (sum: number, meal: any) => sum + (meal.fats ?? 0),
      0,
    ),
  };

  return {
  hasPlan: true,
  weekPlan: {
    ...planJson,
    explanation: planJson.explanation ?? null,
  },
  metrics: this.normalizeMetricsForUI(activePlan.metricsJson),
  strategy: activePlan.strategyJson,
  eatenKeys,
  todayPlan: {
    meals: fallbackMeals,
    totalCaloriesPlanned,
    macrosPlanned,
  },
};

}


const totalCaloriesPlanned = todayMeals.reduce(
  (sum: number, meal: any) => sum + (meal.calories ?? 0),
  0,
);

const macrosPlanned = {
  protein: todayMeals.reduce(
    (sum: number, meal: any) => sum + (meal.protein ?? 0),
    0,
  ),
  carbs: todayMeals.reduce(
    (sum: number, meal: any) => sum + (meal.carbs ?? 0),
    0,
  ),
  fats: todayMeals.reduce(
    (sum: number, meal: any) => sum + (meal.fats ?? 0),
    0,
  ),
};

const todayPlan = {
  meals: todayMeals,
  totalCaloriesPlanned,
  macrosPlanned,
};


return {
  hasPlan: true,
  weekPlan: {
    ...planJson,
    explanation,
  },
  metrics: this.normalizeMetricsForUI(activePlan.metricsJson),
  strategy: activePlan.strategyJson,
  eatenKeys,

  todayPlan,
};
}

/**
 * START PLAN — CREATE ACTIVE USER PLAN
 */
async startPlan(userId: string) {

  // 🔒 SAFETY LOCK — ENSURE ONLY ONE ACTIVE PLAN
  await this.prisma.userPlan.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    data: {
      status: 'COMPLETED',
    },
  });

  const activePlan = await this.prisma.userPlan.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  // 🔒 USER STATE — PROFILE IS SINGLE SOURCE OF TRUTH
  const profile = await this.profileService.getProfile(userId);
  console.log('🧪 START PLAN — PROFILE USED =>', profile);

  if (!profile) {
    throw new Error(
      'User profile is missing. Profile must exist before generating a plan.'
    );
  }

// ----------------------------------------------------
// 🔒 PHASE 6 — WHY DID THIS PLAN CHANGE?
// ----------------------------------------------------
const previousInputs = activePlan?.inputsSnapshot as
  | {
      weight?: number;
      goal?: string;
      activityLevel?: string;
    }
  | null;

const changeReasons = {
  weightChanged:
    previousInputs?.weight != null &&
    previousInputs.weight !== profile.weight,

  goalChanged:
    previousInputs?.goal != null &&
    previousInputs.goal !== profile.goal,

  activityChanged:
    previousInputs?.activityLevel != null &&
    previousInputs.activityLevel !== profile.activityLevel,
};

  
  // ✅ Scope restore: startPlan needs these later for snapshot checks + invalidation
  const onboarding = profile as any;

  

  const previousRotationIndex =
  (activePlan?.inputsSnapshot as any)?.rotationIndex ?? 0;


// 🔥 FORCE REGENERATION RULE
// Any startPlan call invalidates previous ACTIVE plan
if (activePlan) {
  await this.prisma.userPlan.update({
    where: { id: activePlan.id },
    data: { status: 'COMPLETED' },
  });
}


  // 1️⃣ Ensure onboarding exists
  



  


 // ----------------------------------------------------
// 🔥 METRICS INPUT — STRICT, DOMAIN-SAFE
// ----------------------------------------------------
const metrics = computeMetrics({
  heightCm: Number(profile.height),
  weightKg: Number(profile.weight),
  age: Number(profile.age),

  gender: profile.gender === 'female' ? 'female' : 'male',

  activityLevel: (
    ['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(
      profile.activityLevel,
    )
      ? profile.activityLevel
      : 'moderate'
  ) as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',

  goal: (
    ['lose', 'maintain', 'gain'].includes(profile.goal)
      ? profile.goal
      : 'maintain'
  ) as 'lose' | 'maintain' | 'gain',

  diet: (
    profile.diet ?? 'none'

  ) as any, // 🔥 canonicalized upstream

  allergies: Array.isArray(profile.allergies)
    ? profile.allergies
    : [],

  currency: 'USD',

  weeklyBudget: Number(profile.weeklyBudget ?? 0),

  trainsRegularly: false,
  bodyType: 'average',
});


// 4️⃣ Generate weekly plan from deterministic metrics
const weekPlan = await this.plannerService.getWeeklyPlanFromTargets({
  userId,

  caloriesTarget: metrics.dailyCaloriesTarget,

  macrosTarget: {
    protein: metrics.dailyProteinTarget,
    carbs: Math.round((metrics.dailyCaloriesTarget * 0.4) / 4),
    fats: Math.round((metrics.dailyCaloriesTarget * 0.3) / 9),
  },

  preferences: profile.diet ?? null,

  constraints: {
    diet: profile.diet ?? 'none',
    allergies: profile.allergies ?? [],
    weeklyBudget: metrics.weeklyBudget,
  },
});


// 🔒 Normalize planner output (engine may nest days)
const planAny = weekPlan as any;

const rawDays = Array.isArray(planAny?.days)
  ? planAny.days
  : Array.isArray(planAny?.days?.days)
  ? planAny.days.days
  : null;

  console.log(
  '🧪 RAW DAY SAMPLE =>',
  JSON.stringify(rawDays?.[0], null, 2),
);
console.log(
  '🚨 PLANNER MEAL TEMPLATE IDS =>',
  rawDays?.flatMap((d: any) =>
    (d.plan?.meals ?? d.meals ?? []).map((m: any) => m.templateId)
  )
);


// 🔒 ENRICH MEALS WITH EXPLANATION BEFORE SAVING PLAN
// 🔒 ENRICH MEALS WITH EXPLANATION BEFORE SAVING PLAN
const enrichedDays = (rawDays ?? []).map((day: any) => ({
  ...day,
  meals: (day.plan?.meals ?? day.meals ?? []).map((meal: any) => {
    const template = MEAL_TEMPLATES.find((t) => t.id === meal.templateId);
    if (!template) return meal;

    return {
      ...meal,
      explanation: explainMeal({
        mealCategory: meal.category,
        calorieClass: template.calorieClass,
        proteinClass: template.proteinClass,
        costEfficiency: template.costEfficiency,
        diet: template.diet,
        goal: profile.goal,
      }),
    };
  }),
}));



  // 5️⃣ Save ACTIVE plan
 // 🔒 Derive canonical week range (Monday → Sunday)
const now = new Date();
const day = now.getDay(); // 0 = Sunday
const diffToMonday = day === 0 ? -6 : 1 - day;

const safeWeekStart = new Date(now);
safeWeekStart.setDate(now.getDate() + diffToMonday);
safeWeekStart.setHours(0, 0, 0, 0);

const safeWeekEnd = new Date(safeWeekStart);
safeWeekEnd.setDate(safeWeekStart.getDate() + 6);
safeWeekEnd.setHours(23, 59, 59, 999);

// 🔒 Stamp calendar dates onto each plan day (Home depends on this)
const datedDays = enrichedDays.map((day: any, index: number) => {

  const date = new Date(safeWeekStart);
  date.setDate(safeWeekStart.getDate() + index);

  return {
    date: date.toLocaleDateString('en-CA'),
    meals: (rawDays[index]?.meals ?? rawDays[index]?.plan?.meals ?? []).map((meal: any) => {
      const template = MEAL_TEMPLATES.find(
        (t) => t.id === meal.templateId,
      );

      if (!template) return meal;

      return {
        ...meal,
        explanation: explainMeal({
          mealCategory: meal.category,
          calorieClass: template.calorieClass,
          proteinClass: template.proteinClass,
          costEfficiency: template.costEfficiency,
          diet: template.diet,
          goal: profile.goal,

        }),
      };
    }),
  };
});

const finalizedWeekPlan = {
  ...weekPlan,
  days: datedDays,
};

// 🔥 ADD INGREDIENTS TO MEALS (REQUIRED FOR GROCERY)
for (const day of finalizedWeekPlan.days || []) {
  for (const meal of day.meals || []) {
    const template = MEAL_TEMPLATES.find(
      (t) => t.id === meal.templateId,
    );

    if (!template || !template.ingredients) continue;

    meal.ingredients = template.ingredients.map((i: any) => ({
      name: i.name,
      grams: Math.round(
        ((i.grams ?? 0) * (meal.grams ?? template.defaultGrams)) /
          template.defaultGrams,
      ),
      unit: i.unit ?? 'g',
    }));
  }
}

// 🔒 FINAL GUARANTEE: inject explanation into the EXACT plan being saved
for (const day of finalizedWeekPlan.days || []) {
  for (const meal of day.meals || []) {
    const template = MEAL_TEMPLATES.find(
      (t) => t.id === meal.templateId,
    );

    if (!template) continue;

    meal.explanation = explainMeal({
      mealCategory: meal.category,
      calorieClass: template.calorieClass,
      proteinClass: template.proteinClass,
      costEfficiency: template.costEfficiency,
      diet: template.diet,
      goal: profile.goal,
    });
  }
}

const safePlanJson =
  finalizedWeekPlan as any;


const safeMetricsJson =
  sanitizeJsonForPrisma(metrics) as any;
  const metricsObj = safeMetricsJson as any;


if (activePlan?.inputsSnapshot) {
  const currentInputs = {
    budget: onboarding.budget,
    goal: onboarding.goal,
    dietaryPreferences: onboarding.dietaryPreferences,
    allergies: onboarding.allergies,
    activityLevel: onboarding.activityLevel,
    country: onboarding.country,
    caloriesTarget: metricsObj.dailyCalorieTarget,
    proteinTarget: metricsObj.proteinTarget,
  };

  const isValid = this.isPlanStillValid(
    activePlan.inputsSnapshot,
    currentInputs,
  );

  if (!isValid) {
    await this.prisma.userPlan.update({
      where: { id: activePlan.id },
      data: { status: 'INVALID' as any },
    });
  }
}

await this.prisma.userPlan.updateMany({
  where: { userId, status: 'ACTIVE' },
  data: { status: 'COMPLETED' as any },
});



const inputsSnapshot = {
  budget: onboarding.budget,
  goal: onboarding.goal,
  dietaryPreferences: onboarding.dietaryPreferences,
  allergies: onboarding.allergies,
  activityLevel: onboarding.activityLevel,
  country: onboarding.country,

  caloriesTarget: metricsObj.dailyCalorieTarget,
proteinTarget: metricsObj.proteinTarget,
 rotationIndex:
  Math.round(metrics.dailyCaloriesTarget) * 1000 +
  Math.round(metrics.dailyProteinTarget),




};


  await this.prisma.userPlan.create({
  data: {
    status: 'ACTIVE',
    weekStart: safeWeekStart,
    weekEnd: safeWeekEnd,
    planJson: safePlanJson,
    metricsJson: safeMetricsJson,
    strategyJson: {},
    inputsSnapshot,
    changeReasons,
    user: {
      connect: { id: userId },
    },
  },
});
// 🔒 FINAL STEP — persist weekly grocery from finalized plan
await this.groceryService.getWeekly(userId);



  return { success: true };
}

async logFood(input: {
  userId: string;
  name: string;
  meal?: string;
  templateId?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams?: number;
  date?: string;
}) {
  const {
    userId,
    name,
    meal,
    templateId,
    calories,
    protein,
    carbs,
    fat,
    grams,
    date,
  } = input;

  // 🔒 Normalize date to start of day (00:00)
  const logDate = date
    ? new Date(new Date(date).setHours(0, 0, 0, 0))
    : new Date(new Date().setHours(0, 0, 0, 0));

  return this.prisma.foodLog.create({
    data: {
      userId,
      date: logDate,
      meal,
      source: 'plan',
      templateId,
      name,
      grams: grams ?? 0,
      calories,
      protein,
      carbs,
      fat,
    },
  });
}
async getFoodLogsForDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return this.prisma.foodLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      name: true,
      templateId: true,
      createdAt: true,
    },
  });
}

async getTodayFoodLogs(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  return this.prisma.foodLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: today,
        lte: end,
      },
    },
    select: {
      name: true,
      templateId: true,
      meal: true,
      createdAt: true,
    },
  });
}
// ------------------------------------------------------------
// 🔒 INVALIDATION — deterministic input comparison
// ------------------------------------------------------------
private isPlanStillValid(
  stored: any,
  current: any,
): boolean {
  if (!stored) return false;

  return (
    stored.budget === current.budget &&
    stored.goal === current.goal &&
    JSON.stringify(stored.dietaryPreferences) ===
      JSON.stringify(current.dietaryPreferences) &&
    JSON.stringify(stored.allergies) ===
      JSON.stringify(current.allergies) &&
    stored.activityLevel === current.activityLevel &&
    stored.country === current.country &&
    stored.caloriesTarget === current.caloriesTarget &&
    stored.proteinTarget === current.proteinTarget
  );
}
// ----------------------------------------------------
// PHASE 8.1 — Merge pricing into grocery (read-only)
// Supports BOTH shapes:
// 1) grocery.categories[].items[]
// 2) grocery.items[] (flat)
// ----------------------------------------------------
private mergePricingIntoGrocery(grocery: any, pricing: any) {
  if (!grocery || !Array.isArray(pricing?.items)) {
    return { grocery, weeklyTotal: 0 };
  }

  // Index prices by item name (lowercased)
  const priceIndex: Record<string, any> = {};
  for (const p of pricing.items) {
    if (p?.name) priceIndex[p.name.toLowerCase()] = p;
  }

  // ✅ CASE A: Flat list: grocery.items[]
  if (Array.isArray(grocery.items)) {
    let weeklyTotal = 0;

    const items = grocery.items.map((item: any) => {
      const priced = priceIndex[(item?.name ?? '').toLowerCase()];
      const pricePerUnit = priced?.pricePerUnit ?? null;
      const estimatedCost = priced?.estimatedCost ?? 0;

      weeklyTotal += estimatedCost;

      return {
        ...item,
        pricePerUnit,
        estimatedCost,
      };
    });

    return {
      grocery: {
        ...grocery,
        items,
        totalCost: Math.round(weeklyTotal * 100) / 100,
        currency: pricing.currency,
        currencySymbol: pricing.currencySymbol,
      },
      weeklyTotal: Math.round(weeklyTotal * 100) / 100,
    };
  }

  // ✅ CASE B: Structured: grocery.categories[].items[]
  if (Array.isArray(grocery.categories)) {
    let weeklyTotal = 0;

    const categories = grocery.categories.map((cat: any) => {
      let categorySubtotal = 0;

      const items = (cat.items ?? []).map((item: any) => {
        const priced = priceIndex[(item?.name ?? '').toLowerCase()];
        const pricePerUnit = priced?.pricePerUnit ?? null;
        const estimatedCost = priced?.estimatedCost ?? 0;

        categorySubtotal += estimatedCost;
        weeklyTotal += estimatedCost;

        return {
          ...item,
          pricePerUnit,
          estimatedCost,
        };
      });

      return {
        ...cat,
        subtotal: Math.round(categorySubtotal * 100) / 100,
        items,
      };
    });

    return {
      grocery: {
        ...grocery,
        categories,
        totalCost: Math.round(weeklyTotal * 100) / 100,
        currency: pricing.currency,
        currencySymbol: pricing.currencySymbol,
      },
      weeklyTotal: Math.round(weeklyTotal * 100) / 100,
    };
  }

  // Unknown shape → return as-is
  return { grocery, weeklyTotal: 0 };
}



}
