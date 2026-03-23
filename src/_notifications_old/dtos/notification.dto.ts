import { IsString, IsOptional } from 'class-validator';

export class NotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
