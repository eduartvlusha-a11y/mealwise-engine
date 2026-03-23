import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // GET /progress/:userId
  @Get(':userId')
  async getUserProgress(@Param('userId') userId: string) {
    return this.progressService.getUserProgress(userId);
  }

  // POST /progress/:userId
  @Post(':userId')
  async addWeight(
    @Param('userId') userId: string,
    @Body() body: { weight: number },
  ) {
    return this.progressService.addWeightEntry(userId, body.weight);
  }
}
