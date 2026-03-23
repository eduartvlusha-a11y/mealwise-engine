import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MealwiseService } from './mealwise.service';
import { MealwiseOrchestratorResponse } from './mealwise.service';
import { MealwiseSummaryResponseDto } from './dtos/mealwise-summary.dto';
import { MealwiseSummaryExample } from './dtos/mealwise-summary.examples';


@ApiBearerAuth('access-token')   // 🔒 Require JWT in Swagger
@ApiTags('MealWise')
@Controller('mealwise')
export class MealwiseController {
  constructor(private readonly mealwiseService: MealwiseService) {}

  @Get('weekly-summary')
 
  @ApiQuery({ name: 'weekStart', required: false })
  @ApiQuery({
    name: 'currency',
    required: false,
    enum: ['USD', 'EUR', 'NONE'],
    default: 'USD',
  })
  @ApiQuery({
    name: 'mode',
    required: false,
    enum: ['none', 'auto'],
    default: 'auto',
  })
  @ApiOkResponse({
    description: 'Full MealWise weekly summary.',
    type: MealwiseSummaryResponseDto,
    schema: {
      example: MealwiseSummaryExample,
    },
  })
  @UseGuards(JwtAuthGuard)
async getWeeklySummary(
  @Req() req: any,
  @Query('weekStart') weekStart?: string,
  @Query('currency') currency: 'USD' | 'EUR' | 'NONE' = 'USD',
  @Query('mode') mode: 'none' | 'auto' = 'auto',
): Promise<MealwiseOrchestratorResponse> {

    const userId = req.user.userId;


return this.mealwiseService.buildFullWeekSummary({
  userId,
  weekStart,
  currency,
  pricingMode: mode,
});

  }

@Get('results')
@UseGuards(JwtAuthGuard)
async getResults(@Req() req: any) {
  const userId = req.user.userId;


  const summary = await this.mealwiseService.buildFullWeekSummary({
    userId,
  });

  // ✅ This is the ORIGINAL WORKING contract Flutter expects
  return summary.results;
}

@Get('premium-home')
@UseGuards(JwtAuthGuard)
async getPremiumHome(@Req() req: any) {
  console.log('🔥 JWT USER OBJECT:', req.user);

  const userId = req.user.userId;


  console.log('🔥 RESOLVED USER ID:', userId);

  return this.mealwiseService.buildPremiumHome(userId);
}

@Get('weekly-grocery')
@UseGuards(JwtAuthGuard)
async getWeeklyGrocery(@Req() req: any) {
  const userId = req.user.userId;

  return this.mealwiseService.getWeeklyGrocery(userId);
}



@Post('start')
@UseGuards(JwtAuthGuard)
async startPlan(@Req() req: any) {
  const userId = req.user.userId;

  return this.mealwiseService.startPlan(userId);
}

@Post('regenerate-week')
@UseGuards(JwtAuthGuard)
async regenerateWeek(@Req() req: any) {
  const userId = req.user.userId;

  // Reuse deterministic regeneration (your startPlan already closes ACTIVE and creates a new one)
  return this.mealwiseService.startPlan(userId);
}


@Get('food-log/today')
@UseGuards(JwtAuthGuard)
async getTodayFoodLog(@Req() req: any) {
  const userId = req.user.userId;

  return this.mealwiseService.getTodayFoodLogs(userId);
}


}
