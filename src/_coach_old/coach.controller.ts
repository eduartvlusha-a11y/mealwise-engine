import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CoachService } from './coach.service';

@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  // GET /coach/:userId
  @Get(':userId')
  async getMessages(@Param('userId') userId: string) {
    return this.coachService.getMessages(userId);
  }

  // POST /coach/:userId
  @Post(':userId')
  async addMessage(
    @Param('userId') userId: string,
    @Body() body: { question: string; answer: string },
  ) {
    return this.coachService.addMessage(
      userId,
      body.question,
      body.answer,
    );
  }
}
