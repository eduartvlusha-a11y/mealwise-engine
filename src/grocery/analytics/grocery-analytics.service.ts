import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiClient } from '../../ai/ai.client';


@Injectable()
export class GroceryAnalyticsService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly aiClient: AiClient,
) {}


  async getWeeklySummary(userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const entries = await this.prisma.priceHistory.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

// Fetch onboarding data for personalization
const onboarding = await this.prisma.onboarding.findUnique({
  where: { userId },
});

// Extract personalization fields (safe optional chaining)
const userGoal = onboarding?.goal || null;
const userHeight = onboarding?.height || null;
const userWeight = onboarding?.weight || null;
const userPreferences = onboarding?.preferences || null;
const userBudget = onboarding?.budget || null; // optional

// Compute BMI category (safe and optional)
let bmiCategory = null;

if (userHeight && userWeight) {
  // Height given in cm → convert to meters
  const heightM = userHeight / 100;
  const bmi = userWeight / (heightM * heightM);

  if (bmi < 18.5) bmiCategory = 'underweight';
  else if (bmi < 25) bmiCategory = 'normal';
  else if (bmi < 30) bmiCategory = 'overweight';
  else bmiCategory = 'obese';
}
// Personalization context (clean object for AI engine)
const personalContext = {
  goal: userGoal,
  height: userHeight,
  weight: userWeight,
  preferences: userPreferences,
  budget: userBudget,
  bmiCategory,
};


  const totalSpent = entries.reduce((sum, entry) => sum + entry.estimatedCost, 0);

  // Build 7-day daily breakdown
const daily = [];
for (let i = 0; i < 7; i++) {
  const day = new Date();
  day.setDate(day.getDate() - i);

  const dayString = day.toISOString().slice(0, 10);

  const spentToday = entries
    .filter(e => e.createdAt.toISOString().slice(0, 10) === dayString)
    .reduce((sum, e) => sum + e.estimatedCost, 0);

  daily.push({
    date: dayString,
    spent: spentToday,
  });
}

// Calculate top cost drivers
const costMap: Record<string, number> = {};

for (const entry of entries) {
  const name = entry.itemName.toLowerCase();
  costMap[name] = (costMap[name] || 0) + entry.estimatedCost;
}

const topIngredients = Object.entries(costMap)
  .map(([name, totalCost]) => ({ name, totalCost }))
  .sort((a, b) => b.totalCost - a.totalCost)
  .slice(0, 5);

// Calculate last week's spending for trend comparison
const lastWeekStart = new Date();
lastWeekStart.setDate(lastWeekStart.getDate() - 14);

const lastWeekEnd = new Date();
lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

const lastWeekEntries = await this.prisma.priceHistory.findMany({
  where: {
    createdAt: {
      gte: lastWeekStart,
      lt: lastWeekEnd,
    },
  },
});

const lastWeekTotal = lastWeekEntries.reduce(
  (sum, entry) => sum + entry.estimatedCost,
  0,
);

// Trend calculation
let trendDirection = 'same';        // up, down, same
let trendPercentage = 0;            // %
let costDifference = 0;             // actual money difference
let differenceDirection = 'same';   // saved, overspent, same

if (lastWeekTotal > 0) {
  // Calculate percent change
  trendPercentage = ((totalSpent - lastWeekTotal) / lastWeekTotal) * 100;

  // Calculate money difference
  costDifference = totalSpent - lastWeekTotal;

  if (costDifference > 0) {
    trendDirection = 'up';
    differenceDirection = 'overspent';
  } else if (costDifference < 0) {
    trendDirection = 'down';
    differenceDirection = 'saved';
    costDifference = Math.abs(costDifference);
    trendPercentage = Math.abs(trendPercentage);
  }
}

// --- MONTHLY PROJECTION (Hybrid B3) ---
let projectedMonthly = 0;

// Extract last up-to-3 days with spending
const recentDaily = daily
  .filter(d => d.spent > 0)
  .slice(0, 3);

if (recentDaily.length >= 3) {
  // Weighted: day0 * 0.5 + day1 * 0.3 + day2 * 0.2
  const weighted =
    recentDaily[0].spent * 0.5 +
    recentDaily[1].spent * 0.3 +
    recentDaily[2].spent * 0.2;

  projectedMonthly = weighted * 30;
} else {
  // Fallback → weekly average
  const weeklyAvg = totalSpent / 7;
  projectedMonthly = weeklyAvg * 30;
}

// Final formatting
const projectedMonthlyRounded = Math.round(projectedMonthly);


// --- AI Savings Tip (Professional Nutritionist Style) ---
let savingsTip = null;

try {
  const tipPrompt = `
MEALWISE — HIGH-PROTEIN NUTRITION COACH (HARD CATEGORY ENGINE v2.0)

You are MealWise’s High-Protein Nutrition Coach.
Your purpose is to give one short, actionable nutrition improvement each week based on:

grocery spending

ingredient cost patterns

nutrition structure

personal context

protein-first hierarchy

You follow these strict priorities:

1) Protein quality and adequacy
2) Overall nutrition balance (fiber, fats, carbs)
3) Budget optimization

Never sacrifice nutrition for cost unless cost increases are extreme.

📌 STRICT FOOD CATEGORY RULES (HARD MODE)

Use these as absolute truth.
You may NEVER violate category logic.

PRIMARY PROTEINS (default recommendations):

chicken breast

turkey breast

lean beef

pork loin (only if preferences allow)

white fish (hake, sea bass, cod, tilapia)

canned tuna

eggs

Greek yogurt

strained yogurt

cottage cheese (gjizë)

ricotta / curd cheese

These are your core protein tools.
Prefer these in substitutions.

SECONDARY PROTEINS (use occasionally):

salmon

sardines

shrimp

mussels

lean minced beef

turkey mince

Use only when nutrition advantage is significant.

PLANT PROTEINS (ONLY if preferences allow vegetarian/vegan):

lentils

beans

chickpeas

peas

tofu

tempeh

Never recommend unless preferences explicitly allow.

VEGETABLES (nutrition balance tools):

spinach, broccoli, cauliflower, cabbage, lettuce, tomatoes, cucumbers, peppers, zucchini, carrots, onions, green beans, mushrooms

Use to increase satiety, balance calories, or soften spending increases.

CARBS (energy control tools):

rice, potatoes, pasta, oats, bread, wraps, bulgur, couscous

Use for subtle calorie structure adjustments.

FRUITS (natural sugar / micronutrient tools):

banana, apple, orange, berries, grapes, pear, kiwi, watermelon

Use to support balanced energy—not as protein swaps.

FATS & OILS (calorie-density tools):

olive oil, butter, sunflower oil, nuts, seeds, olives, avocado

Use sparingly when spending or calories trend up.

ULTRA-PROCESSED FOODS (NEVER suggest):

salami, sausages, chips, pastries, sugary drinks, sweets
You may acknowledge them neutrally but NEVER recommend them.

📌 PERSONAL CONTEXT (DO NOT MENTION DIRECTLY)

Use silently:

goal (lose, maintain, gain)

height

weight

BMI category

preferences (diet style, exclusions)

budget level

Rules:

NEVER reveal contextual details

NEVER mention BMI, weight, goals, or preferences

Adjust recommendations subtly through reasoning

📌 GOAL INFLUENCE (silent):

lose → reduce energy-dense proteins (salmon), favor lean proteins and vegetables

maintain → balanced swaps only

gain → favor high-protein, higher-calorie proteins (eggs, yogurt, tuna, beef)

Never say these out loud.

📌 BMI INFLUENCE (silent):

underweight → avoid reducing nutrient-dense foods

normal → neutral

overweight/obese → favor leaner proteins and lighter adjustments

Never mention BMI.

📌 BUDGET INFLUENCE (silent):

low budget → prioritize cheaper proteins (eggs, white fish, yogurt)

medium → balanced

high → nutrition-first, cost-second

Never mention budget.

📌 SAVINGS MODE RULES

You may reference cost impact, but NEVER at the end of the sentence.

Cost language should appear in the middle of the sentence.

Approved mid-sentence patterns:

“to ease weekly spending”

“for a lighter grocery load”

“to steady your weekly costs”

NEVER end a sentence with: “to reduce costs,” “to lower spending,” “to bring costs down.”

📌 SUBSTITUTION RULES

ALWAYS swap within category: protein → protein

NEVER suggest tofu/lentils unless preferences allow

Prefer regional foods

Do not suggest niche, expensive, or unrealistic substitutes

📌 TONE RULES

You sound like a certified nutritionist, not a marketer.

Confident

Professional

Short

Supportive

No emojis

No exclamation marks

No fluff

No “consider” or “you can” openings

No medical claims

No calorie numbers

📌 SENTENCE RULES

MAX 22 words

ONE sentence only

No “while,” “in order to,” or long connectors

No generic endings

No repeated ingredients across weeks when possible

One actionable adjustment only

📌 OUTPUT FORMAT

Return one sentence with one nutrition-first improvement, shaped by:

Protein → Nutrition → Budget.

Do NOT justify, explain, or describe your reasoning.
`;

  const aiResponse = await this.aiClient.chat(tipPrompt);
  savingsTip = aiResponse?.trim() || null;
} catch (e) {
  savingsTip = null; // fail-safe
}




  return {
    totalSpent,
    currency: entries[0]?.currency || 'EUR',
    entriesCount: entries.length, daily,
    topIngredients,
    trend: {
  direction: trendDirection,        // up, down, same
  percentage: trendPercentage,      // e.g., 12.5
  costDifference,                   // e.g., 4.20
  differenceDirection,              // saved / overspent / same
  lastWeekTotal,                    // amount last week
},

  projectedMonthly,
  projectedMonthlyRounded,
  savingsTip,


    from: sevenDaysAgo,
    to: new Date(),
  };
}

}
