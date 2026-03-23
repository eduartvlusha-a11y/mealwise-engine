import { ApiProperty } from '@nestjs/swagger';

//
// -------------------------------
// WEEK PLAN STRUCTURE
// -------------------------------
export class MacrosDto {
  @ApiProperty() protein: number;
  @ApiProperty() carbs: number;
  @ApiProperty() fats: number;
}

export class MealDto {
  @ApiProperty() templateId: string;
  @ApiProperty() name: string;
  @ApiProperty() category: string;
  @ApiProperty() grams: number;
  @ApiProperty() calories: number;
  @ApiProperty() protein: number;
  @ApiProperty() carbs: number;
  @ApiProperty() fats: number;
}

export class DailyPlanDto {
  @ApiProperty() date: string;
  @ApiProperty() totalCaloriesTarget: number;
  @ApiProperty() totalCaloriesPlanned: number;
  @ApiProperty({ type: MacrosDto }) macrosTarget: MacrosDto;
  @ApiProperty({ type: MacrosDto }) macrosPlanned: MacrosDto;
  @ApiProperty({ type: [MealDto] }) meals: MealDto[];
}

export class WeeklyPlanDto {
  @ApiProperty() weekStart: string;
  @ApiProperty() weekEnd: string;
  @ApiProperty() totalCaloriesTarget: number;
  @ApiProperty() totalCaloriesPlanned: number;
  @ApiProperty() avgDailyCaloriesTarget: number;
  @ApiProperty() avgDailyCaloriesPlanned: number;
  @ApiProperty({ type: MacrosDto }) macrosTargetWeekly: MacrosDto;
  @ApiProperty({ type: MacrosDto }) macrosPlannedWeekly: MacrosDto;
  @ApiProperty({ type: [DailyPlanDto] }) days: DailyPlanDto[];
}

//
// -------------------------------
// GROCERY STRUCTURE
// -------------------------------
export class GroceryAltUnitDto {
  @ApiProperty() value: number;
  @ApiProperty() unit: string;
  @ApiProperty() text: string;
}

export class GroceryPrimaryDto {
  @ApiProperty() value: number;
  @ApiProperty() unit: string;
  @ApiProperty() text: string;
}

export class GroceryItemDto {
  @ApiProperty() name: string;
  @ApiProperty() type: string;
  @ApiProperty() internal: any;
  @ApiProperty({ type: GroceryPrimaryDto }) primary: GroceryPrimaryDto;
  @ApiProperty({ type: [GroceryAltUnitDto] }) alt: GroceryAltUnitDto[];
  @ApiProperty() packs?: any;
  @ApiProperty() portions?: any;
}

export class GroceryListDto {
  @ApiProperty() weekStart: string;
  @ApiProperty() weekEnd: string;
  @ApiProperty({ type: [GroceryItemDto] }) items: GroceryItemDto[];
}

//
// -------------------------------
// PRICING STRUCTURE
// -------------------------------
export class PricedItemDto {
  @ApiProperty() name: string;
  @ApiProperty() grams: number;
  @ApiProperty() unit: string;
  @ApiProperty() pricePerUnit: number;
  @ApiProperty() estimatedCost: number;
  @ApiProperty() priceSource: string;
}

export class PricingDto {
  @ApiProperty() currency: string;
  @ApiProperty() targetCurrency: string;
  @ApiProperty() mode: string;
  @ApiProperty() shouldConvert: boolean;
  @ApiProperty() activateConversion: boolean;
  @ApiProperty() currencySymbol: string;
  @ApiProperty() converted: boolean;
  @ApiProperty({ type: [PricedItemDto] }) items: PricedItemDto[];
  @ApiProperty() totalCost: number;
}

//
// -------------------------------
// ANALYTICS STRUCTURE
// -------------------------------
export class DailyAnalyticsDto {
  @ApiProperty() date: string;
  @ApiProperty() calories: number;
  @ApiProperty() protein: number;
  @ApiProperty() carbs: number;
  @ApiProperty() fat: number;
  @ApiProperty() dailyCalorieTarget: number;
  @ApiProperty() difference: number;
  @ApiProperty() direction: string;
  @ApiProperty() spent: number;
}

export class WeeklyAnalyticsDto {
  @ApiProperty() weekStart: string;
  @ApiProperty() weekEnd: string;
  @ApiProperty() currency: string;
  @ApiProperty() entriesCount: number;
  @ApiProperty() totalSpent: number;
  @ApiProperty() projectedMonthly: number;
  @ApiProperty() projectedMonthlyRounded: number;
  @ApiProperty() weeklyCalories: number;
  @ApiProperty() weeklyCalorieTarget: number;
  @ApiProperty() weeklyDifference: number;
  @ApiProperty() weeklyDirection: string;
  @ApiProperty({ type: [DailyAnalyticsDto] }) daily: DailyAnalyticsDto[];
  @ApiProperty() topIngredients: any;
  @ApiProperty() spendingTrend: any;
  @ApiProperty() savingsTip: string | null;
}

//
// -------------------------------
// FINAL RESPONSE DTO
// -------------------------------
export class MealwiseSummaryResponseDto {
  @ApiProperty({ type: WeeklyPlanDto }) weekPlan: WeeklyPlanDto;
  @ApiProperty({ type: GroceryListDto }) grocery: GroceryListDto;
  @ApiProperty({ type: PricingDto }) pricing: PricingDto;
  @ApiProperty({ type: WeeklyAnalyticsDto }) intelligence: WeeklyAnalyticsDto;
}
