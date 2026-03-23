import { IsString, MinLength } from 'class-validator';

export class AskCoachDto {
  @IsString()
  @MinLength(3)
  question: string;
}
