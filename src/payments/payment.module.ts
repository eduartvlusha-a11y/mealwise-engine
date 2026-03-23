import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RevenueCatService } from './revenuecat.service';


@Module({
  providers: [PaymentService, RevenueCatService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
