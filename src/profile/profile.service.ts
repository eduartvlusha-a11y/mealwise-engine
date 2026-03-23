import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

    // ------------------------------------------------------------
  // 🔒 Deterministic Core Metrics (SINGLE SOURCE OF TRUTH)
  // ------------------------------------------------------------
  private activityMultiplier(level?: string): number {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return multipliers[level ?? 'moderate'] ?? 1.55;
  }

  private computeCoreMetrics(profile: {
    age?: number | null;
    height?: number | null;
    weight?: number | null;
    gender?: string | null;
    activityLevel?: string | null;
    goal?: string | null;
    weeklyBudget?: number | null;
    stepsPerDay?: number | null;
gymDaysPerWeek?: number | null;
trainingIntensity?: string | null;

  }) {
    const { age, height, weight } = profile;
    if (!age || !height || !weight) return null;

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if ((profile.gender ?? '').toLowerCase() === 'male') bmr += 5;
    else bmr -= 161;

    const tdee = Math.round(
      bmr * this.activityMultiplier(profile.activityLevel ?? undefined),
    );

    // 🔒 Goal-based calorie target (with sanity guards)
let dailyCaloriesTarget = tdee;

// ----------------------------------------------------
// 🔒 PHASE 7 — SOFT ACTIVITY MODIFIERS (CAPPED)
// ----------------------------------------------------
let activityModifier = 0;

// Steps-based modifier
if (profile.stepsPerDay != null) {
  if (profile.stepsPerDay >= 12000) activityModifier += 150;
  else if (profile.stepsPerDay >= 8000) activityModifier += 100;
  else if (profile.stepsPerDay >= 5000) activityModifier += 50;
}

// Gym-based modifier
if (profile.gymDaysPerWeek != null) {
  if (profile.gymDaysPerWeek >= 5) activityModifier += 150;
  else if (profile.gymDaysPerWeek >= 3) activityModifier += 100;
  else if (profile.gymDaysPerWeek >= 1) activityModifier += 50;
}

// Intensity modifier
if (profile.trainingIntensity === 'high') activityModifier += 100;
if (profile.trainingIntensity === 'moderate') activityModifier += 50;

// Absolute safety cap
activityModifier = Math.min(activityModifier, 300);


if (profile.goal === 'weight_loss' || profile.goal === 'lose') {
  dailyCaloriesTarget = Math.min(tdee - 300, tdee - 1);
}

if (profile.goal === 'weight_gain' || profile.goal === 'gain') {
  dailyCaloriesTarget = Math.max(tdee + 300, tdee + 1);
}
dailyCaloriesTarget += activityModifier;


// Safety bounds (absolute)
dailyCaloriesTarget = Math.max(1200, dailyCaloriesTarget);
dailyCaloriesTarget = Math.min(dailyCaloriesTarget, 4500);


    const dailyProteinTarget = Math.round((dailyCaloriesTarget * 0.3) / 4);

    return {
      bmr: Math.round(bmr),
      tdee,
      dailyCaloriesTarget,
      dailyProteinTarget,
      weeklyBudget: profile.weeklyBudget ?? null,
    };
  }


  async getProfile(userId: string) {
    return this.prisma.profile.findUnique({
  where: { userId },
});

  }

  async getProfileWithMetrics(userId: string) {
  const profile = await this.getProfile(userId);
  if (!profile) return null;

  const metrics = this.computeCoreMetrics(profile as any);
  return { profile, metrics };
}


  async updateProfile(
  userId: string,
  data: {
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
    goal?: string;
    activityLevel?: string;
    dietaryPreferences?: string[];
    allergies?: string[];
    budget?: number;
    country?: string;
        stepsPerDay?: number;
    gymDaysPerWeek?: number;
    trainingIntensity?: string;

    preferredSystem?: string;
    preferredWeightUnit?: string;
    preferredVolumeUnit?: string;
  },
) {
  // 1️⃣ Update onboarding/profile (same logic as before)
  const profile = await this.prisma.profile.upsert({
  where: { userId },
  create: {
  userId,
  age: data.age,
  height: data.height,
  weight: data.weight,
  gender: data.gender,
  goal: data.goal,
  activityLevel: data.activityLevel,
  diet: data.dietaryPreferences?.[0],
  weeklyBudget: data.budget,
  country: data.country,
  stepsPerDay: data.stepsPerDay,
gymDaysPerWeek: data.gymDaysPerWeek,
trainingIntensity: data.trainingIntensity,
  allergies: data.allergies ?? [],
},
update: {
  age: data.age,
  height: data.height,
  weight: data.weight,
  gender: data.gender,
  goal: data.goal,
  activityLevel: data.activityLevel,
  diet: data.dietaryPreferences?.[0],
  weeklyBudget: data.budget,
  country: data.country,
  stepsPerDay: data.stepsPerDay,
gymDaysPerWeek: data.gymDaysPerWeek,
trainingIntensity: data.trainingIntensity,
  allergies: data.allergies ?? [],
},

});

  // 🔒 Recompute deterministic metrics when profile changes
  const computedMetrics = this.computeCoreMetrics(profile);

  if (computedMetrics) {
    await this.prisma.userPlan.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: {
        metricsJson: computedMetrics as any,
      },
    });
  }



  // 2️⃣ Invalidate existing weekly plans (no delete, no regen)
  await this.prisma.mealPlan.updateMany({
    where: {
      userId,
      isValid: true,
    },
    data: {
      isValid: false,
    },
  });

  

  // 3️⃣ Return profile as before
  return profile;
}



    // 🔒 Create or update Profile from Onboarding (REQUIRED for MealWise)
  async upsertProfileFromOnboarding(userId: string) {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new Error('Onboarding data not found for user');
    }

    return this.prisma.profile.upsert({
      where: { userId },
      create: {
  userId,
  age: onboarding.age ?? undefined,
  height: onboarding.height ?? undefined,
  weight: onboarding.weight ?? undefined,
  gender: onboarding.gender ?? undefined,
  goal: onboarding.goal ?? undefined,
  activityLevel: onboarding.activityLevel ?? undefined,
  diet: onboarding.dietaryPreferences?.[0] ?? undefined,
  weeklyBudget: onboarding.budget ?? undefined,
  country: onboarding.country ?? undefined,
  allergies: onboarding.allergies ?? [],
},
update: {
  age: onboarding.age ?? undefined,
  height: onboarding.height ?? undefined,
  weight: onboarding.weight ?? undefined,
  gender: onboarding.gender ?? undefined,
  goal: onboarding.goal ?? undefined,
  activityLevel: onboarding.activityLevel ?? undefined,
  weeklyBudget: onboarding.budget ?? undefined,
  country: onboarding.country ?? undefined,
  allergies: onboarding.allergies ?? [],
},

    });
  }

}
