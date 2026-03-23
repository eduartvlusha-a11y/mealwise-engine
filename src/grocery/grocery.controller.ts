import { Controller, Post, Get, Req, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { GroceryService } from './grocery.service';
import { GenerateGroceryDto } from './dtos/generate-grocery.dto';
import { GroceryPricingService } from './pricing/grocery-pricing.service';
import { GroceryPriceDto } from './dtos/grocery-price.dto';
import { IngredientDisplayService } from '../common/services/ingredient-display.service';
import { IntelligenceService } from '../intelligence/intelligence.service';



@UseGuards(JwtAuthGuard)
@Controller('grocery')

export class GroceryController {
  constructor(
    private readonly groceryService: GroceryService,
    private readonly pricingService: GroceryPricingService,
    private readonly ingredientDisplayService: IngredientDisplayService,
    private readonly intelligenceService: IntelligenceService,
  ) {}

  @Post('generate')
  async generate(@Req() req: any, @Body() dto: GenerateGroceryDto) {
    const userId = req.user?.sub ?? req.user.id;
    return this.groceryService.generate(userId, dto);
  }

  @Get('week')
async getWeeklyList(@Req() req: any) {
  console.log('[GROCERY AUTH CHECK]', req.user);

  const userId = req.user.userId;
  return this.groceryService.getWeekly(userId);
}


  @Post('grocery-prices')
async getGroceryPrices(@Req() req: any, @Body() body: GroceryPriceDto) {
  const { items, countryCode, currency, userCurrency, source, conversionMode } = body;

  const userId = req.user.userId;


  return this.pricingService.calculatePrices(
    items,
    userId,                         // 👈 FIX – insert userId here
    countryCode,
    currency ?? 'EUR',
    userCurrency,
    source,
    conversionMode,
  );
}

@Post('intelligence-week')
async getIntelligenceWeek(@Req() req: any) {
  const userId = req.user.userId;

  return this.intelligenceService.getWeeklyIntelligence(userId);
}

@Get('test-display')
testDisplay() {
  const ingredient = {
    name: 'tomato',
    ingredientType: 'produce',
    internal: { grams: 300, milliliters: 0, count: 0 }
  };

  return this.ingredientDisplayService.toDisplay(ingredient);
}

}
