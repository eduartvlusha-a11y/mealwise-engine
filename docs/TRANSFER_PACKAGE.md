# MealWise — Transfer Package

This document defines exactly what is delivered when MealWise is transferred
to a new owner.

MealWise is an engine-first food decision system designed for embedding,
licensing, or white-label use.

---

## What is included

### 1. Core Engine
- Deterministic Core Metrics Engine
- Weekly Planner
- Grocery Aggregation Engine
- Budget Pressure Engine
- Rule-Based Substitution Engine
- Outcome Engine (WeeklyOutcomeSummary)

All engines are deterministic, explainable, and independent.

---

### 2. Contracts
- Decision-time contract:
  - `MealwiseResults`
- Outcome-time contract:
  - `WeeklyOutcomeSummary`

Contracts are stable and versionable.

---

### 3. Demo Assets
- `docs/DEMO_WEEK.json`
  - Complete example of input → plan → groceries → substitutions → outcome

- `src/demo/weekly-system.demo.ts`
  - Executable snapshot of the full system loop

---

### 4. Documentation
- `docs/SYSTEM_OVERVIEW.md`
- `docs/ARCHITECTURE.md`
- `docs/EXTENSION_GUIDE.md`

These documents define:
- system philosophy
- module responsibilities
- extension points
- regeneration rules

---

## What is NOT included
- UI / mobile app
- live pricing feeds
- store APIs
- scanner integrations
- user acquisition

These are intentionally excluded to keep the system transferable and modular.

---

## Handover guarantees
- System runs without the original founder
- Logic is deterministic and testable
- All extension points are documented
- No hidden dependencies on AI behavior

---

## Intended buyers
- Food-tech platforms
- Grocery / retail tech vendors
- Health & wellness platforms
- Corporate wellness providers
- Research / institutional projects
