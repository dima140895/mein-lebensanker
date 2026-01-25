// Stripe Price IDs für die Pakete
export const PRICING = {
  single: {
    name: 'single',
    price: 39,
    priceId: 'price_1StQxpICzkfBNYhyfkFifG39',
    maxProfiles: 1,
  },
  couple: {
    name: 'couple',
    price: 49,
    priceId: 'price_1StQy5ICzkfBNYhyGqh7RUsk',
    maxProfiles: 2,
  },
  family: {
    name: 'family',
    price: 99,
    priceId: 'price_1StQyTICzkfBNYhyNTAl4QrA',
    maxProfiles: 4,
  },
  updateService: {
    name: 'update_service',
    price: 12,
    priceId: 'price_1StQyfICzkfBNYhyTXftLV1j',
    interval: 'year',
  },
} as const;

// Upgrade-Preise (Differenzbeträge)
export const UPGRADE_PRICES = {
  single_to_couple: 10,
  single_to_family: 60,
  couple_to_family: 50,
} as const;

export type PackageType = 'single' | 'couple' | 'family';

export const getPackageInfo = (tier: PackageType) => PRICING[tier];

export const getUpgradePrice = (from: PackageType, to: PackageType): number | null => {
  const key = `${from}_to_${to}` as keyof typeof UPGRADE_PRICES;
  return UPGRADE_PRICES[key] ?? null;
};

export const canUpgrade = (from: PackageType, to: PackageType): boolean => {
  const fromMax = PRICING[from].maxProfiles;
  const toMax = PRICING[to].maxProfiles;
  return toMax > fromMax;
};
