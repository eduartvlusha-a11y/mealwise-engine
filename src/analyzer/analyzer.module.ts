import { Module } from '@nestjs/common';
import { AnalyzerController } from './analyzer.controller';
import { AnalyzerService } from './analyzer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { OpenFoodFactsClient } from './openfoodfacts.client';
import { AiModule } from '../ai/ai.module';
import { GroceryOptimizationModule } from '../grocery-optimization/grocery-optimization.module';



// import { AiModule } from '../ai/ai.module'; // 👉 enable later when AI integration begins

@Module({
  imports: [
    GroceryOptimizationModule,
    HttpModule,
    PrismaModule,
    AiModule,
    // AiModule, // 👉 activate when AI pipeline is ready
  ],
  controllers: [AnalyzerController],
  providers: [AnalyzerService, OpenFoodFactsClient],
  exports: [AnalyzerService],
})
export class AnalyzerModule {}
