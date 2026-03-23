import { IsNumber, Min, Max } from 'class-validator';

export class CalculateCaloriesDto {
  @IsNumber()
  @Min(1)
  @Max(5000)
  calories: number;

  @IsNumber()
  @Min(1)
  @Max(200)
  quantity: number;
}
