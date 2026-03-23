import { Injectable } from '@nestjs/common';
import { IngredientType } from './unit-conversion.service';

@Injectable()
export class IngredientTypeService {
  private readonly liquidKeywords = [
    'oil',
    'milk',
    'water',
    'juice',
    'sauce',
    'vinegar',
    'broth',
    'stock',
    'yogurt',
    'cream',
  ];

  private readonly meatKeywords = [
    'chicken',
    'beef',
    'pork',
    'fish',
    'salmon',
    'tuna',
    'turkey',
    'lamb',
    'steak',
    'ham',
    'sausage',
  ];

  private readonly produceKeywords = [
    'apple',
    'banana',
    'orange',
    'tomato',
    'cucumber',
    'lettuce',
    'carrot',
    'broccoli',
    'spinach',
    'pepper',
    'onion',
    'garlic',
    'potato',
    'avocado',
    'berries',
    'strawberry',
    'blueberry',
    'grapes',
  ];

  private readonly spiceKeywords = [
    'salt',
    'pepper',
    'paprika',
    'cumin',
    'turmeric',
    'oregano',
    'basil',
    'chili',
    'cinnamon',
    'ginger',
    'garam masala',
    'curry',
    'parsley',
  ];

    private readonly countKeywords = [
    'egg',
    'eggs',
    'banana',
    'bananas',
    'apple',
    'apples',
    'tomato',
    'tomatoes',
  ];


  getType(name: string): IngredientType {
    const lower = name.toLowerCase().trim();

    if (this.includes(lower, this.countKeywords)) return 'count';
    if (this.includes(lower, this.liquidKeywords)) return 'liquid';
    if (this.includes(lower, this.meatKeywords)) return 'meat';
    if (this.includes(lower, this.produceKeywords)) return 'produce';
    if (this.includes(lower, this.spiceKeywords)) return 'spice';

    return 'solid'; // default fallback
  }

  private includes(name: string, list: string[]): boolean {
    return list.some(keyword => name.includes(keyword));
  }
}
