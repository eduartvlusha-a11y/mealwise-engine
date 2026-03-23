import { IsString } from 'class-validator';

export class AnalyzePhotoDto {
  @IsString()
  base64Image: string;
}
