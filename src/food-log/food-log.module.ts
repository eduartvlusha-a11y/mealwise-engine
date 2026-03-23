import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FoodLogService } from './food-log.service';
import { FoodLogController } from './food-log.controller';

@Module({
  imports: [PrismaModule],
  providers: [FoodLogService],
  controllers: [FoodLogController],
  exports: [FoodLogService],
})
export class FoodLogModule {}
