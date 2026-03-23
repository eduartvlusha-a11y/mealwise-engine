import { Controller, Post, Get, Req, Body } from '@nestjs/common';
import { PlannerService } from './planner.service';
import { GeneratePlanDto } from './dtos/generate-plan.dto';

@Controller('planner')
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  @Post('generate')
  async generatePlan(@Req() req: any, @Body() dto: GeneratePlanDto) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.plannerService.generatePlan(userId, dto);
  }

  @Get('week')
  async getLatestPlan(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.plannerService.getLatestPlan(userId);
  }
}
