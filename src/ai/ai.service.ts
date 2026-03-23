import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AiClient } from './ai.client';
import * as fs from 'fs';
import * as path from 'path';
import {
  buildWeeklyPlanReasoning,
  WeeklyPlanReasoningSnapshot,
} from './weekly-plan-reasoning.engine';
import { PrismaService } from '../prisma/prisma.service';

const SUBSCRIPTIONS_ENABLED = false;


@Injectable()
export class AiService {
  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * LEGACY: file-based prompts.
   * Kept only for backwards compatibility with older endpoints.
   */
  loadPrompt(filename: string): string {
    const filePath = path.join(__dirname, 'prompts', filename);
    return fs.readFileSync(filePath, 'utf8');
  }

  // legacy
  async runMegaPrompt(taskPayload: Record<string, any>) {
    const template = this.loadPrompt('mega.prompt.txt');
    const finalPrompt = template + '\n\n' + JSON.stringify(taskPayload, null, 2);
    return this.ai.chat(finalPrompt);
  }

  async runJsonPrompt(prompt: string | any[]) {
    if (typeof prompt === 'string') {
      const response = await this.ai.chat(prompt);
      return this.safeJson(response);
    }

    if (Array.isArray(prompt)) {
      const response = await this.ai.chat(prompt);
      return this.safeJson(response);
    }

    return null;
  }

  /**
   * 🔒 CORE AI EXPLANATION (OPENAI)
   * - OpenAI generates ALL wording at runtime
   * - Input is a frozen deterministic snapshot
   */
  async generateWeeklyPlanReasoning(
    snapshot: WeeklyPlanReasoningSnapshot,
  ) {
    return buildWeeklyPlanReasoning(this.ai, snapshot);
  }

  /**
   * ✅ ENDPOINT BACKING METHOD
   * Called by GET /ai/weekly-plan-reasoning
   */
  async getWeeklyPlanReasoning(userId: string) {
    if (SUBSCRIPTIONS_ENABLED) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user || user.subscriptionTier !== 'PRO') {
    throw new ForbiddenException(
      'AI reasoning requires a Pro subscription',
    );
  }
}


    // 1️⃣ Get ACTIVE weekly plan
    const plan = await this.prisma.userPlan.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!plan) {
      throw new NotFoundException('No active weekly plan found');
    }

    const metrics = plan.metricsJson as any;
    const strategy = plan.strategyJson as any;
    const planData = plan.planJson as any;

    if (!metrics || !strategy || !planData) {
      throw new NotFoundException('Plan data incomplete');
    }

    // 2️⃣ Build FROZEN SNAPSHOT (NO CALCULATION)
    const snapshot: WeeklyPlanReasoningSnapshot = {
      tdee: metrics.tdee,
      calorieTarget: metrics.dailyCaloriesTarget,
      proteinTarget: metrics.dailyProteinTarget,
      calorieDeficitPercent: strategy.calorieDeficitPercent,

      weeklyBudget: metrics.weeklyBudget,
      plannedSpend: planData.weeklyCost ?? metrics.weeklyBudget,
      budgetPressureIndex: strategy.budgetPressureIndex,

      diet: metrics.diet,
      ingredientReuseRate: planData.ingredientReuseRate ?? 1,
      mealCount: planData.totalMeals ?? 0,
      riskLevel: strategy.riskLevel ?? 'medium',

      planFrozen: true,
    };

    // 3️⃣ REAL AI CALL (OPENAI)
    const result = await this.generateWeeklyPlanReasoning(snapshot);

    return {
      reasoningText: result.reasoningText,
    };
  }

  // ---------------------------
  // INTERNAL HELPERS
  // ---------------------------
  private safeJson(text: string) {
    try {
      return JSON.parse(text);
    } catch {
      try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    }
  }
}
