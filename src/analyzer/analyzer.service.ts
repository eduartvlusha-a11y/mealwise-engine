import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Express } from 'express';
import { OpenFoodFactsClient } from './openfoodfacts.client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AiService } from '../ai/ai.service';
import * as fs from 'fs';
import * as path from 'path';
import { COUNTRY_PRICE_COEFFICIENTS } from './data/country-price-coefficients';
import { GroceryOptimizationService } from '../grocery-optimization/grocery-optimization.service';



// import { AiService } from '../ai/ai.service'; // 👉 will plug this later when AI is ready

@Injectable()
export class AnalyzerService {
  private barcodePrompt: string;
  private textPrompt: string;
  private photoPrompt: string;
  private groceryPricePrompt: string;
  private loadPrompt(filename: string): string {
  const devPath = path.join(process.cwd(), 'src/ai/prompts', filename);
  const prodPath = path.join(__dirname, 'ai/prompts/ai/prompts', filename);

  if (fs.existsSync(devPath)) {
    return fs.readFileSync(devPath, 'utf8');
  }
  if (fs.existsSync(prodPath)) {
    return fs.readFileSync(prodPath, 'utf8');
  }

  throw new Error(`Prompt file not found: ${filename}`);
}



  constructor(
  private prisma: PrismaService,
  private openFoodFacts: OpenFoodFactsClient,
  private aiService: AiService,
  private optimizationService: GroceryOptimizationService,
) {



  // Load the fallback prompt at service startup
  const promptPath = join(process.cwd(), 'src/ai/prompts/barcode_fallback.prompt.txt');
this.barcodePrompt = readFileSync(promptPath, 'utf8');
const textPromptPath = join(process.cwd(), 'src/ai/prompts/analyze_text.prompt.txt');
this.textPrompt = readFileSync(textPromptPath, 'utf8');
const photoPromptPath = join(process.cwd(), 'src/ai/prompts/analyze_photo.prompt.txt');
this.photoPrompt = readFileSync(photoPromptPath, 'utf8');
this.groceryPricePrompt = this.loadPrompt('grocery_price.prompt.txt');


}


  /**
   * STEP 1 — Store the raw image temporarily
   * STEP 2 — (later) Send image to AI → extract food + calories + ingredients
   * STEP 3 — Save result in DB
   */
  async analyzeImage(userId: string, file: Express.Multer.File) {
  if (!file) {
    return {
      success: false,
      message: 'No image uploaded.',
    };
  }

  try {
    // Convert image → base64
    const base64Image = file.buffer.toString('base64');

    // Prepare mixed Vision input (text + image)
    const visionInput = [
      {
        role: 'user',
        content: this.photoPrompt, // text prompt
      },
      {
        image: {
          base64: base64Image, // vision image block
        },
      },
    ];

    // Run Vision + JSON parsing
    const aiResponse = await this.aiService.runJsonPrompt(visionInput);

    if (!aiResponse) {
      return {
        success: false,
        source: 'ai-photo',
        message: 'AI failed to analyze the image.',
      };
    }

    return {
      success: true,
      source: 'ai-photo',
      data: aiResponse,
    };

  } catch (err) {
    console.error('Photo analysis error:', err.message);

    return {
      success: false,
      message: 'Internal error analyzing photo.',
    };
  }
}



  async analyzeBarcode(barcode: string) {
  if (!barcode) {
    return {
      success: false,
      message: 'Barcode missing.',
    };
  }

  // 1) Try OpenFoodFacts first
  const offData = await this.openFoodFacts.lookupBarcode(barcode);

  if (offData) {
    return {
      success: true,
      source: 'openfoodfacts',
      data: offData,
    };
  }

  // 2) AI Fallback — use LLM to intelligently guess the product
  try {
    const prompt = this.barcodePrompt.replace('{{barcode}}', barcode);

    const aiResponse = await this.aiService.runJsonPrompt(prompt);

    if (aiResponse) {
      return {
        success: true,
        source: 'ai-fallback',
        data: aiResponse,
      };
    }
  } catch (err) {
    console.error('AI fallback failed:', err.message);
  }

  // 3) If even AI fails — return not found
  return {
    success: false,
    source: 'none',
    message: 'Product not found (DB + AI).',
  };
}



async analyzeText(userId: string, text: string) {
  // If text is empty
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      message: 'Text input cannot be empty.',
    };
  }

  try {
    // Build prompt
    const prompt = this.textPrompt.replace('{{text}}', text);

    // Run with AiService to parse JSON
    const aiResponse = await this.aiService.runJsonPrompt(prompt);

    if (!aiResponse) {
      return {
        success: false,
        source: 'ai-fallback',
        message: 'AI failed to parse the text.',
      };
    }

    // Everything OK
    return {
      success: true,
      source: 'ai-text',
      data: aiResponse,
    };

  } catch (err) {
    console.error('Text analyzer error:', err.message);
    return {
      success: false,
      message: 'Internal error analyzing text.',
    };
  }
}


  /**
   * List user history for the analyzer (photos, barcode scans, text inputs)
   */
  async getUserHistory(userId: string) {
    return this.prisma.analyzerResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // limit for now
    });
  }

 async analyzeGroceryPrices(
  userId: string,
  items: string[],
  days: number,
  dietPreference: string,
  country: string,
) {
  // Build prompt
  const prompt =
    this.groceryPricePrompt
      .replace('{{days}}', String(days))
      .replace('{{dietPreference}}', dietPreference) +
    '\n\n' +
    JSON.stringify({ items });

  // Run AI
  const result = await this.aiService.runJsonPrompt(prompt);

  // Apply country-based price multiplier
  const coefficient =
    COUNTRY_PRICE_COEFFICIENTS[country.toLowerCase()] ?? 1;

  if (result?.items) {
    result.items = result.items.map((item: any) => ({
      ...item,
      estimatedCost: Number(
        (item.estimatedCost * coefficient).toFixed(2),
      ),
    }));
  }

  if (result?.totalCost) {
    result.totalCost = Number(
      (result.totalCost * coefficient).toFixed(2),
    );
  }

  // 🔥 Auto-save grocery optimization
  await this.optimizationService.create({
    userId: userId,
    country: country ?? null,
    currency: result.currency ?? null,
    totalCost: result.totalCost,
    source: 'ai-grocery',
    items: result.items,
  });

  return {
    success: true,
    source: 'ai-grocery',
    data: result,
  };
}

}
