import { Controller, Post, Body, Req } from '@nestjs/common';
import { FoodLogService } from './food-log.service';
import { ConfirmMealDto } from './dto/confirm-meal.dto';

@Controller('food-log')
export class FoodLogController {

  constructor(private readonly foodLogService: FoodLogService) {}

  @Post('confirm')
  async confirmMeal(
    @Req() req: any,
    @Body() dto: ConfirmMealDto,
  ) {
    return this.foodLogService.confirmMeal(req.user.id, dto);
  }
}
