import { Injectable } from '@nestjs/common';

export type PaymentProvider = 'stripe' | 'revenuecat';

@Injectable()
export class PaymentService {
  getActiveProvider(): PaymentProvider {
    // 🔒 Architecture only – no live payments yet
    return 'stripe';
  }

  async createSubscriptionIntent(userId: string, tier: 'PRO') {
    // 🚧 Placeholder – will be implemented later
    return {
      provider: this.getActiveProvider(),
      tier,
      status: 'not_configured',
    };
  }
}
