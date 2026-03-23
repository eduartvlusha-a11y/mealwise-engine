import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { GroceryOptimizationService } from './grocery-optimization.service';
import { CreateOptimizationDto } from './dto/create-optimization.dto';

@Controller('grocery-optimization')
export class GroceryOptimizationController {
  constructor(private service: GroceryOptimizationService) {}

  @Post()
  async saveOptimization(@Body() dto: CreateOptimizationDto) {
    const result = await this.service.create(dto);

    return {
      success: true,
      data: result,
    };
  }

  @Get(':userId')
  async getHistory(@Param('userId') userId: string) {
    const history = await this.service.getUserHistory(userId);

    return {
      success: true,
      items: history,
    };
  }
}
