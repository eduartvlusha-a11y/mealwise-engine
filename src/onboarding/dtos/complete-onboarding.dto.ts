import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';

export class OnboardingDto {
  @IsNumber()
  age: number;

  @IsString()
  gender: string;

  @IsString()
  activityLevel: string;

  @IsString()
  goal: string;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsArray()
  @IsOptional()
  dietaryPreferences: string[];

  @IsArray()
  @IsOptional()
  allergies: string[];

  @IsNumber()
  budget: number;

  @IsString()
  country: string;
}