import { IsNumber, Min, Max } from 'class-validator';

export class UpdateWeightDto {
  @IsNumber()
  @Min(20)
  @Max(300)
  weight: number;
}
