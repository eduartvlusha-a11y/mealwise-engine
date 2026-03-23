import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OpenFoodFactsClient {
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v2/product/';

  constructor(private readonly http: HttpService) {}

  async lookupBarcode(barcode: string) {
    try {
      const url = `${this.baseUrl}${barcode}.json`;

      const response = await firstValueFrom(
        this.http.get(url, {
          timeout: 5000, // 5 seconds timeout
        }),
      );

      const data = response.data;

      if (!data || !data.product) {
        return null;
      }

      return {
        name: data.product.product_name || null,
        brand: data.product.brands || null,
        quantity: data.product.quantity || null,
        ingredients:
          data.product.ingredients?.map((i) => i.text) || null,
        nutriments: data.product.nutriments || null,
        image: data.product.image_small_url || null,
      };
    } catch (err) {
      console.error('OpenFoodFacts error:', err.message);
      return null;
    }
  }
}
