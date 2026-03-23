import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  Get,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalyzerService } from './analyzer.service';
import type { Express } from 'express';
import { BarcodeDto } from './dtos/barcode.dto';
import { TextDto } from './dtos/text.dto';
import { GroceryPriceDto } from './dtos/grocery-price.dto';


@Controller('analyzer')
export class AnalyzerController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  // 👉 POST /analyzer/photo — upload food photo
  @Post('photo')
  @UseInterceptors(FileInterceptor('image'))
  async analyzePhoto(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user?.id;

    if (!file) {
      return { error: 'No image uploaded.' };
    }

    return this.analyzerService.analyzeImage(userId, file);
  }

  // 👉 POST /analyzer/barcode — analyze barcode
  @Post('barcode')
  async analyzeBarcode(@Body() body: BarcodeDto) {
    if (!body.barcode) {
      return { error: 'Barcode is required.' };
    }

    // analyzerService ONLY takes (barcode)
    return this.analyzerService.analyzeBarcode(body.barcode);
  }

  // 👉 POST /analyzer/text — analyze plain text food description
  @Post('text')
async analyzeText(@Req() req: any, @Body() body: TextDto) {
  const userId = req.user?.id;

  if (!body.text) {
    return { error: 'Text input is required.' };
  }

  return this.analyzerService.analyzeText(userId, body.text);
}

  // 👉 GET /analyzer/history — list previous AI scans for the user
  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = req.user?.id;
    return this.analyzerService.getUserHistory(userId);
  }
  
  @Post('grocery-prices')
async getGroceryPrices(@Req() req: any, @Body() body: GroceryPriceDto) {
  const userId = req.user?.id;

  if (!body.items || !Array.isArray(body.items)) {
    return { error: 'Items array is required.' };
  }

    return this.analyzerService.analyzeGroceryPrices(
    userId,
    body.items,
    body.days,
    body.dietPreference,
    body.country,
  );

}


}
