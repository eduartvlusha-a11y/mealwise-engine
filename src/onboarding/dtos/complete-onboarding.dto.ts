import { IsNumber, IsString, Min, Max } from 'class-validator';

export class CompleteOnboardingDto {
  @IsNumber()
  @Min(1000)
  @Max(5000)
  dailyCalories: number;

  @IsNumber()
  @Min(10)
  budgetPerDay: number;

  @IsString()
  goal: string;
}
