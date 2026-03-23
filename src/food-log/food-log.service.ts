import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmMealDto } from './dto/confirm-meal.dto';
import { MEAL_TEMPLATES } from '../meal-suggestions/meal-templates.table';

@Injectable()
export class FoodLogService {
  constructor(private readonly prisma: PrismaService) {}

  async confirmMeal(userId: string, dto: ConfirmMealDto) {
    const template = MEAL_TEMPLATES.find(
      (t) => t.id === dto.templateId,
    );

    if (!template) {
      throw new Error('Meal template not found');
    }

    const ratio = dto.grams / template.defaultGrams;

    const calories = Math.round(template.calories * ratio);
    const protein = Math.round(template.protein * ratio);
    const carbs = Math.round(template.carbs * ratio);
    const fat = Math.round(template.fats * ratio);

    const day = new Date(dto.date);
    day.setHours(0, 0, 0, 0);

    return this.prisma.foodLog.create({
      data: {
        userId,
        date: day,
        meal: dto.meal,
        source: dto.source ?? 'plan',
        templateId: template.id,
        name: template.name,
        grams: dto.grams,
        calories,
        protein,
        carbs,
        fat,
      },
    });
  }
}
