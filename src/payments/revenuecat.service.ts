import { Injectable } from '@nestjs/common';

@Injectable()
export class RevenueCatService {
  async handleWebhook(payload: any) {
    // 🚧 Placeholder — no secrets yet
    // Later: verify signature + map entitlement → subscriptionTier
    return { received: true };
  }

  async syncUserEntitlement(userId: string) {
    // 🚧 Placeholder for manual sync / testing
    return {
      userId,
      entitlement: 'pro',
      active: false,
    };
  }
}
