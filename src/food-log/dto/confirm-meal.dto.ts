import { IsString, IsNumber, IsOptional } from 'class-validator';

export class ConfirmMealDto {
  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  meal: string; // breakfast | lunch | dinner | snack

  @IsString()
  templateId: string;

  @IsNumber()
  grams: number;

  @IsOptional()
  @IsString()
  source?: string; // default: plan
}
