import { Module } from '@nestjs/common';
import { AiClient } from './ai.client';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiClient, AiService],
  exports: [AiClient, AiService],
})
export class AiModule {}
