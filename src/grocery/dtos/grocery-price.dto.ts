import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GroceryItemInputDto {
  @IsString()
  name: string;

  @IsNumber()
  grams: number;

  @IsString()
  unit: string;

  // ✅ ADDED FIELD (this is the ONLY change)
  @IsOptional()
  pricingUnit?: {
    type: 'pcs' | 'kg' | 'unit';
    quantity: number;
  };
}

export class GroceryPriceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroceryItemInputDto)
  items: GroceryItemInputDto[];

  // Example: "AL", "DE", "US"
  @IsString()
  countryCode: string;

  // Example: "EUR", "USD"
  @IsOptional()
  @IsString()
  currency?: string;

  // Optional: later we can use this for different stores / sources
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  userCurrency?: string;

  @IsOptional()
  @IsString()
  conversionMode?: string; // "auto" | "manual" | "none"
}
