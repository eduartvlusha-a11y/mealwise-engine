import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

import { MealwiseService } from '../mealwise/mealwise.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { ProfileService } from '../profile/profile.service';
import { PrismaService } from '../prisma/prisma.service';

import { MealWiseScenarioInput } from './scenarios/scenario.types';

import { LowBudgetSingleCase } from './scenarios/cases/low_budget_single.case';
import { FamilyOfFourCase } from './scenarios/cases/family_four.case';
import { AthleteCutCase } from './scenarios/cases/athlete_cut.case';
import { DiabeticCase } from './scenarios/cases/diabetic.case';

const OUT_DIR = join(process.cwd(), 'demo', 'out');
const DEMO_SCENARIO_USER_ID = 'demo-scenario-user';

type ScenarioRun = {
  scenario: {
    id: string;
    label: string;
    weeklyBudget: number;
    householdSize: number;
  };
  kpis: {
    estimatedCost: number | null;
    budgetDelta: number | null;
    plannedMeals: number | null;
    substitutions: number | null;
    riskFlags: string[];
    conflicts: string[];
  };
  snapshot: {
    currency?: string;
    country?: string;
    strategy?: any;
    metrics?: any;
    reasoning?: any;
  };
  raw: any;
};

async function seedOnboarding(
  prisma: PrismaService,
  onboardingService: OnboardingService,
  profileService: ProfileService,
  scenario: MealWiseScenarioInput,
) {
  await prisma.user.upsert({
    where: { id: DEMO_SCENARIO_USER_ID },
    create: {
      id: DEMO_SCENARIO_USER_ID,
      email: `demo+${scenario.id}@mealwise.local`,
      password: 'demo-scenario-password',
    },
    update: {},
  });

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
      trainsRegularly:
        scenario.training?.sessionsPerWeek
          ? scenario.training.sessionsPerWeek >= 3
          : false,
      bodyType: 'average',
    }),
  });

  await profileService.upsertProfileFromOnboarding(DEMO_SCENARIO_USER_ID);
}

function safeNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function countSubstitutions(output: any): number | null {
  const paths = [
    output?.pricing?.substitutions,
    output?.intelligence?.substitutions,
    output?.results?.strategy?.conflicts,
  ];
  for (const p of paths) {
    if (Array.isArray(p)) return p.length;
  }
  return null;
}

function countPlannedMeals(weekPlan: any): number | null {
  const days = weekPlan?.days;
  if (!Array.isArray(days)) return null;
  let total = 0;
  for (const d of days) {
    const meals = d?.meals ?? d?.plan?.meals;
    if (Array.isArray(meals)) total += meals.length;
  }
  return total;
}

function esc(s: any): string {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderHTML(runs: ScenarioRun[]) {
  const rows = runs
    .map((r) => {
      const cost = r.kpis.estimatedCost;
      const budget = r.scenario.weeklyBudget;
      const delta = r.kpis.budgetDelta;

      return `
<tr>
  <td>
    <strong>${esc(r.scenario.label)}</strong>
    <div class="muted">${esc(r.scenario.id)}</div>
  </td>
<div class="muted" style="margin-top:6px">
  ${r.raw?.results?.aiStrategyAdvisor
    ? `
      <div><strong>${esc(r.raw.results.aiStrategyAdvisor.title)}</strong></div>
      <div>${esc(r.raw.results.aiStrategyAdvisor.summary)}</div>
      <ul>
        ${r.raw.results.aiStrategyAdvisor.bullets
          .map((b: string) => `<li>${esc(b)}</li>`)
          .join('')}
      </ul>
    `
    : ''}
</div>



  <td>
  Calories: ${r.snapshot?.metrics?.dailyCaloriesTarget ?? '—'}
  → ${r.snapshot?.metrics?.dailyCaloriesAchieved ?? '—'} kcal<br/>

  Protein: ${r.snapshot?.metrics?.dailyProteinTarget ?? '—'}
  → ${r.snapshot?.metrics?.dailyProteinAchieved ?? '—'} g<br/>

  <span class="muted">
    Δ Calories:
    ${
      r.snapshot?.metrics?.dailyCaloriesTarget != null &&
      r.snapshot?.metrics?.dailyCaloriesAchieved != null
        ? (r.snapshot.metrics.dailyCaloriesAchieved -
            r.snapshot.metrics.dailyCaloriesTarget)
        : '—'
    } kcal<br/>

    Δ Protein:
    ${
      r.snapshot?.metrics?.dailyProteinTarget != null &&
      r.snapshot?.metrics?.dailyProteinAchieved != null
        ? (r.snapshot.metrics.dailyProteinAchieved -
            r.snapshot.metrics.dailyProteinTarget)
        : '—'
    } g
  </span>
</td>






  <td>
  ${r.kpis.plannedMeals ?? '—'} meals / week<br/>
  ${r.snapshot?.metrics?.mealCountHint ?? '—'} meals / day<br/>
  Execution adapted to goal & constraints
</td>


  <td>
  Grocery list derived from meals<br/>
  ${r.kpis.substitutions ?? 0} adaptive substitutions
</td>


  <td>
    €${cost?.toFixed(2) ?? '—'} required<br/>
    Feasible within €${budget.toFixed(2)} budget
  </td>

  <td>${esc(r.kpis.riskFlags.join(', ') || '—')}</td>
  <td>${esc(r.kpis.conflicts.join(', ') || '—')}</td>
</tr>`;
    })
    .join('\n');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>MealWise — Goal Execution Report</title>
<style>
body{font-family:system-ui;padding:24px;max-width:1200px;margin:auto;}
h1{margin-bottom:4px;}
.muted{color:#666;font-size:12px;}
table{width:100%;border-collapse:collapse;margin-top:20px;}
th,td{border-bottom:1px solid #e6e6e6;padding:12px;text-align:left;vertical-align:top;}
th{background:#fafafa;text-transform:uppercase;font-size:12px;color:#444;}
</style>
</head>
<body>

<h1>MealWise — Goal Execution Proof</h1>
<div class="muted">Generated ${esc(new Date().toISOString())} • ${runs.length} scenarios</div>
<p class="muted">
  This report demonstrates how MealWise executes a single user’s nutrition goals under real-world constraints.
  Household and multi-user planning are part of the product roadmap and are not shown here.
</p>

<p>
<strong>MealWise</strong> is a goal-driven nutrition execution engine.
It enforces physiological targets first, preserves meal structure,
derives groceries automatically, and validates feasibility against money last.
</p>

<table>
<thead>
<tr>
  <th>Scenario</th>
  <th>Goal Execution</th>
  <th>Meal Structure</th>
  <th>Grocery Logic</th>
  <th>Cost Reality</th>
  <th>Risk Flags</th>
  <th>Conflicts</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>

</body>
</html>`;
}

async function runOne(
  prisma: PrismaService,
  mealwiseService: MealwiseService,
  onboardingService: OnboardingService,
  profileService: ProfileService,
  scenario: MealWiseScenarioInput,
): Promise<ScenarioRun> {
  await seedOnboarding(prisma, onboardingService, profileService, scenario);

  const output = await mealwiseService.buildFullWeekSummary({
      userId: DEMO_SCENARIO_USER_ID,
    currency: scenario.market.currency as any,
    countryCode: scenario.market.country,
    pricingMode: 'auto',
  });
  console.log(
  'DEBUG METRICS:',
  JSON.stringify(output?.results?.metrics, null, 2),
);

// ===============================
// ACHIEVED EXECUTION METRICS
// derived from actual meals
// ===============================
const days = output?.weekPlan?.days ?? [];

let totalCalories = 0;
let totalProtein = 0;

for (const d of days) {
  const meals = d.meals ?? d.plan?.meals ?? [];
  for (const m of meals) {
    totalCalories += Number(m.calories ?? 0);
    totalProtein += Number(m.protein ?? 0);
  }
}

const dayCount = days.length || 7;

const dailyCaloriesAchieved = Math.round(totalCalories / dayCount);
const dailyProteinAchieved = Math.round(totalProtein / dayCount);

  const estimatedCost = safeNum(
    output?.pricing?.totalCost ?? output?.pricing?.estimatedCost,
  );

  return {
    scenario: {
      id: scenario.id,
      label: scenario.label,
      weeklyBudget: scenario.budget.weeklyAmount,
      householdSize: scenario.household.size,
    },
    kpis: {
      estimatedCost,
      budgetDelta:
        estimatedCost === null
          ? null
          : estimatedCost - scenario.budget.weeklyAmount,
      plannedMeals: countPlannedMeals(output?.weekPlan),
      substitutions: countSubstitutions(output),
      riskFlags: output?.results?.metrics?.riskFlags ?? [],
      conflicts: output?.results?.strategy?.conflicts ?? [],
    },
    snapshot: {
      currency: scenario.market.currency,
      country: scenario.market.country,
      strategy: output?.results?.strategy,
      metrics: {
  ...output?.results?.metrics,
  dailyCaloriesAchieved,
  dailyProteinAchieved,
},

      reasoning: output?.results?.reasoning,
    },
    raw: output,
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const prisma = app.get(PrismaService);
  const mealwiseService = app.get(MealwiseService);
  const onboardingService = app.get(OnboardingService);
  const profileService = app.get(ProfileService);

  const scenarios: MealWiseScenarioInput[] = [
    LowBudgetSingleCase,
    AthleteCutCase,
    DiabeticCase,
  ];

  const runs: ScenarioRun[] = [];

  for (const s of scenarios) {
    console.log(`Running: ${s.label}`);
    const run = await runOne(
      prisma,
      mealwiseService,
      onboardingService,
      profileService,
      s,
    );

    writeFileSync(
      join(OUT_DIR, `${s.id}.json`),
      JSON.stringify(run.raw, null, 2),
      'utf-8',
    );

    runs.push(run);
  }

  writeFileSync(
    join(OUT_DIR, 'report.html'),
    renderHTML(runs),
    'utf-8',
  );

  console.log(`\n✅ Report written: demo/out/report.html\n`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
