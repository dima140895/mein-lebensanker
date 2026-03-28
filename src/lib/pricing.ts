// New pricing model: Anker (one-time), Anker Plus (subscription), Anker Familie (subscription)
export const PRICING = {
  anker: {
    name: 'anker',
    price: 49,
    priceId: 'price_1TFxsEEwPqOvJ6cUDbqzpbmI',
    productId: 'prod_UEQj99bUYvaibb',
    mode: 'payment' as const,
    maxProfiles: 1,
    modules: ['vorsorge'],
  },
  plus: {
    name: 'plus',
    price: 9,
    priceId: 'price_1TFxtDICzkfBNYhy7DjVuBt7',
    productId: 'prod_UEQka5CkpEf8XO',
    mode: 'subscription' as const,
    trialDays: 14,
    maxProfiles: 1,
    modules: ['vorsorge', 'pflege-begleiter', 'krankheits-begleiter'],
  },
  familie: {
    name: 'familie',
    price: 14,
    priceId: 'price_1TFxtdICzkfBNYhyZbGYHWYU',
    productId: 'prod_UEQlhCOAIAVMaV',
    mode: 'subscription' as const,
    trialDays: 14,
    maxProfiles: 10,
    modules: ['vorsorge', 'pflege-begleiter', 'krankheits-begleiter', 'familienfreigabe'],
  },
} as const;

export type PlanType = 'anker' | 'plus' | 'familie';

export const getPlanInfo = (plan: PlanType) => PRICING[plan];

export const isSubscriptionPlan = (plan: PlanType): boolean => {
  return PRICING[plan].mode === 'subscription';
};

// Check if a module is available for a given plan
export const isPlanModule = (plan: PlanType, module: string): boolean => {
  return PRICING[plan].modules.includes(module);
};

// Legacy exports for backward compatibility during migration
export type PackageType = PlanType;
