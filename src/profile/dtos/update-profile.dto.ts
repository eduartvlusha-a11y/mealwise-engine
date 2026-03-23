import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class UpdateProfileDto {
  // BODY
  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  // GOAL & ACTIVITY
  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  activityLevel?: string;

  // CONSTRAINTS
  @IsOptional()
  @IsString()
  diet?: string;

  @IsOptional()
  @IsArray()
  allergies?: string[];

  // MONEY & CONTEXT
  @IsOptional()
  @IsNumber()
  weeklyBudget?: number;

  @IsOptional()
  @IsString()
  country?: string;
}
