import { IsString, IsOptional, IsNumber, IsArray, IsObject } from 'class-validator';

export class CreateOptimizationDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  totalCost: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsObject()
  items: any;
}
