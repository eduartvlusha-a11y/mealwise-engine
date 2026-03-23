# MealWise — System Overview (Canonical)

## What MealWise is
MealWise is a weekly food decision system for real people with real constraints:
- money
- health goals
- time
- availability
- habits
- markets/prices
- substitutions

MealWise outputs ONE canonical weekly plan and derives everything from it.

## What MealWise is not
- not a daily random meal generator
- not a motivational coach
- not AI-authoritative
- not a “feature app”

## Non-negotiable philosophy
Truth first, AI second.
Deterministic metrics are the source of truth:
- BMR, TDEE
- daily calorie/protein targets
- weekly calories
- weekly budget
- constraints (diet, allergies, training)

AI may assist decisions but must never invent numbers or override constraints silently.

## Canonical pipeline (single truth)
Input (profile + constraints + budget)
→ Deterministic Core Metrics Engine
→ Weekly Planner (canonical week plan)
→ Grocery Aggregation (derived only from the canonical plan)
→ Budget Pressure (WITHIN/OVER)
→ Substitution Engine (rule-based, deterministic, explainable)
→ Weekly Outcome Summary (verdict + explanation)

## Contracts
Decision contract (planning-time):
- MealwiseResults (metrics, strategy, reasoning)

Outcome contract (post-execution):
- WeeklyOutcomeSummary (budget status, substitutions, verdict, explanation)

## Regeneration rule
If any input changes (budget/diet/allergies/goals/activity):
- the old weekly plan is invalid
- the system regenerates the canonical weekly plan
- groceries/prices/substitutions/outcome are regenerated from the new plan
