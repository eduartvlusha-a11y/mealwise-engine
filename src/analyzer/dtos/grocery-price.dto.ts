import { IsArray, IsNumber, IsString } from 'class-validator';

export class GroceryPriceDto {
  @IsArray()
  items: string[];

  @IsNumber()
  days: number;

  @IsString()
  dietPreference: string;

  @IsString()
  country: string;

}
