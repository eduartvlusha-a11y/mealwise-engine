import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

import { MealwiseService } from '../mealwise/mealwise.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { ProfileService } from '../profile/profile.service';

import { LowBudgetSingleCase } from './scenarios/cases/low_budget_single.case';
import { MealWiseScenarioInput } from './scenarios/scenario.types';
import { FamilyOfFourCase } from './scenarios/cases/family_four.case';
import { AthleteCutCase } from './scenarios/cases/athlete_cut.case';
import { DiabeticCase } from './scenarios/cases/diabetic.case';




/**
 * SCENARIO → REAL ORCHESTRATOR WRAPPER
 * - No engine logic here
 * - No shortcuts
 * - This simulates a real human with constraints
 */

const DEMO_SCENARIO_USER_ID = 'demo-scenario-user';

async function seedOnboardingFromScenario(
  onboardingService: OnboardingService,
  profileService: ProfileService,
  scenario: MealWiseScenarioInput,
) {
    // 1️⃣ Save onboarding using REAL backend API (single upsert)
  await onboardingService.saveOnboarding(DEMO_SCENARIO_USER_ID, {
    height: 175,
    weight: 75,
    age: 30,
    gender: 'male',

    goal:
      scenario.health.goal === 'lose_weight'
        ? 'lose'
        : scenario.health.goal === 'gain_weight'
        ? 'gain'
        : 'maintain',

    activityLevel: 'moderate',

    dietaryPreferences: scenario.diet.type,
    allergies: scenario.diet.allergies ?? [],

    budget: scenario.budget.weeklyAmount,

    country: scenario.market.country,

    preferences: JSON.stringify({
      trainsRegularly: scenario.training?.sessionsPerWeek
        ? scenario.training.sessionsPerWeek >= 3
        : false,
      bodyType: 'average',
    }),
  });

  // 2️⃣ Ensure profile exists (real flow)
  await profileService.upsertProfileFromOnboarding(DEMO_SCENARIO_USER_ID);

}

async function runScenario(scenario: MealWiseScenarioInput) {
  const app = await NestFactory.createApplicationContext(
    AppModule,
    { logger: false },
  );

  const mealwiseService = app.get(MealwiseService);
  const onboardingService = app.get(OnboardingService);
  const profileService = app.get(ProfileService);

  console.log('\n====================================');
  console.log(`SCENARIO: ${scenario.label}`);
  console.log('====================================\n');

  // 1️⃣ Seed scenario as real onboarding
  await seedOnboardingFromScenario(
    onboardingService,
    profileService,
    scenario,
  );

  // 2️⃣ Run REAL orchestrator (unchanged)
  const result = await mealwiseService.buildFullWeekSummary({
    userId: DEMO_SCENARIO_USER_ID,
    currency: scenario.market.currency as any,
    countryCode: scenario.market.country,
    pricingMode: 'auto',
  });

  // 3️⃣ Print result (raw, buyer-readable)
  console.log(
    JSON.stringify(
      {
        scenario: {
          id: scenario.id,
          label: scenario.label,
          budget: scenario.budget,
          household: scenario.household,
        },
        output: result,
      },
      null,
      2,
    ),
  );

  await app.close();
}

// 🔥 RUN FIRST STRESS SCENARIO
async function runAll() {
  await runScenario(LowBudgetSingleCase);
  await runScenario(FamilyOfFourCase);
  await runScenario(AthleteCutCase);
  await runScenario(DiabeticCase);
}

runAll()
  .then(() => {
    console.log('\n✅ All scenarios completed successfully\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Scenario run failed\n', err);
    process.exit(1);
  });

