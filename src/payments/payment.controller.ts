import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  @Post('subscribe')
  async subscribe(@Req() req: any) {
    const userId = req.user.userId;

    // Not charging yet – architecture only
    return this.payments.createSubscriptionIntent(userId, 'PRO');
  }
}
