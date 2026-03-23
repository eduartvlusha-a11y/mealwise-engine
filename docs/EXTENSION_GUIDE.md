# MealWise — Extension & Integration Guide

This document explains how MealWise can be extended safely without
breaking its deterministic core.

The system is designed as an engine-first product.

---

## 1. Pricing & Market Data Integration

### Where to plug pricing
- Grocery Aggregation Engine:
  - add estimated cost per ingredient
  - support historical or live prices

- Budget Pressure Engine:
  - consumes estimated weekly cost
  - does not decide substitutions

### Rules
- Pricing data must NEVER modify core metrics
- Pricing data may influence substitution decisions only via rules

---

## 2. Store Comparison

### Recommended placement
- After grocery aggregation
- Before substitution engine

### Purpose
- Compare total basket cost across stores
- Select cheapest viable basket
- Pass selected prices downstream

### Why here
- Keeps planner logic untouched
- Keeps substitution logic deterministic

---

## 3. Scanner / Barcode / OCR

### Integration point
- Grocery item identification
- Category detection

### Rules
- Scanner feeds data into grocery aggregation
- Scanner must not trigger regeneration of weekly plan

---

## 4. AI Extensions

### Allowed uses
- Suggest alternative substitutions
- Improve food variety suggestions
- Assist price estimation when data is missing

### Forbidden uses
- Changing BMR, TDEE, calorie targets
- Overriding constraints silently
- Modifying budget targets

AI must always be explainable and optional.

---

## 5. UI / Mobile / Web Clients

### Consumption model
- UI consumes:
  - Weekly plan
  - Grocery list
  - WeeklyOutcomeSummary

### Rules
- UI never recalculates logic
- UI never invents decisions
- UI only displays system truth

---

## 6. Regeneration Contract (Hard Rule)

If ANY of the following changes:
- budget
- diet
- allergies
- goals
- activity level

Then:
- canonical weekly plan is invalid
- full pipeline regenerates
- downstream outputs are replaced

Partial regeneration is forbidden.
