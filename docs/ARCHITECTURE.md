# MealWise — Architecture & Module Responsibilities

## High-level structure
MealWise is built as a modular food-decision engine with strict separation
between truth, decisions, execution, and outcomes.

The system is designed so each module can be replaced or extended
without breaking core logic.

---

## Core Modules

### 1. Deterministic Core Metrics Engine
**Responsibility**
- Calculate BMR, TDEE
- Set daily calorie & protein targets
- Derive weekly calories & weekly budget
- Enforce constraints (diet, allergies, training)

**Rules**
- Deterministic
- No AI
- Single source of truth

---

### 2. Weekly Planner
**Responsibility**
- Generate ONE canonical weekly meal plan
- Respect constraints & strategy
- Avoid silent regeneration

**Inputs**
- Core metrics
- Strategy selection

**Outputs**
- Canonical weekly plan

---

### 3. Grocery Aggregation Engine
**Responsibility**
- Derive grocery list ONLY from canonical weekly plan
- Merge quantities across days
- Produce internal units

**Rules**
- No AI
- No regeneration
- No pricing decisions

---

### 4. Budget Pressure Engine
**Responsibility**
- Compare estimated grocery cost vs weekly budget
- Output WITHIN / OVER status

**Rules**
- Deterministic
- Stateless
- No substitutions here

---

### 5. Substitution Engine (Rule-Based)
**Responsibility**
- Decide if substitutions are needed
- Apply deterministic category-based fallbacks
- Respect diet & allergy constraints
- Produce explainable reasons

**Rules**
- Deterministic
- Explainable
- Extendable with pricing intelligence later

---

### 6. Outcome Engine
**Responsibility**
- Assemble execution facts into a weekly verdict
- Produce WeeklyOutcomeSummary
- Explain system decisions in plain language

---

## Contracts

### Decision-Time Contract
- `MealwiseResults`
- Metrics, strategy, reasoning

### Outcome-Time Contract
- `WeeklyOutcomeSummary`
- Budget status, substitutions, verdict, explanation

---

## Extension Points (IMPORTANT FOR BUYERS)

### Pricing Intelligence
Can be plugged into:
- Grocery Aggregation (estimated costs)
- Substitution Engine (cheapest alternative)

### Store Comparison
Can be added as:
- Pre-substitution optimization layer
- Post-grocery analysis layer

### Scanner / Barcode / OCR
Can feed into:
- Grocery item identification
- Category detection

### UI / Mobile / Web
Consumes:
- Weekly plan
- Grocery list
- WeeklyOutcomeSummary

No UI logic exists in the core system.

---

## Regeneration Rule (Hard)
If ANY input changes:
- budget
- goals
- diet
- allergies
- activity

The canonical weekly plan is invalidated and regenerated.
All downstream outputs are derived again from the new plan.
