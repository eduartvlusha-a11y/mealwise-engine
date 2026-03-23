import { Module } from '@nestjs/common';
import { UnitConversionService } from './services/unit-conversion.service';
import { IngredientTypeService } from './services/ingredient-type.service';

@Module({
  providers: [
    UnitConversionService,
    IngredientTypeService,
  ],
  exports: [
    UnitConversionService,
    IngredientTypeService,
  ],
})
export class CommonModule {}
