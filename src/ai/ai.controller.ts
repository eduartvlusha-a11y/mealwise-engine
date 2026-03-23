import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('weekly-plan-reasoning')
  async weeklyPlanReasoning(@Req() req: any) {
    const userId = req.user.userId;
    return this.aiService.getWeeklyPlanReasoning(userId);
  }
}
