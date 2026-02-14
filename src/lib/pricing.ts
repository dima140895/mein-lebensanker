// Stripe Price IDs für die Pakete
export const PRICING = {
  single: {
    name: 'single',
    price: 49,
    priceId: 'price_1T0iZ9EwPqOvJ6cU78f3uayM',
    maxProfiles: 1,
  },
  couple: {
    name: 'couple',
    price: 69,
    priceId: 'price_1T0iZcEwPqOvJ6cUh4TsrHY4',
    maxProfiles: 2,
  },
  family: {
    name: 'family',
    basePrice: 99,
    basePriceId: 'price_1T0iaAEwPqOvJ6cU57ldUbdi',
    pricePerAdditionalProfile: 10,
    additionalProfilePriceId: 'price_1T0iaAEwPqOvJ6cU57ldUbdi',
    minProfiles: 4,
    maxProfiles: 10,
  },
} as const;

// Upgrade-Preise (Differenzbeträge) - für Family wird dynamisch berechnet
export const UPGRADE_PRICES = {
  single_to_couple: 20, // 69 - 49 = 20
  // Family upgrades werden dynamisch berechnet basierend auf Profilanzahl
} as const;

// Berechne den Family-Preis basierend auf Profilanzahl
export const calculateFamilyPrice = (profileCount: number): number => {
  const { basePrice, pricePerAdditionalProfile, minProfiles, maxProfiles } = PRICING.family;
  const clampedCount = Math.max(minProfiles, Math.min(maxProfiles, profileCount));
  const additionalProfiles = clampedCount - minProfiles;
  return basePrice + (additionalProfiles * pricePerAdditionalProfile);
};

// Berechne Upgrade-Preis zu Family
export const calculateUpgradeToFamilyPrice = (from: 'single' | 'couple', familyProfileCount: number): number => {
  const fromPrice = PRICING[from].price;
  const familyPrice = calculateFamilyPrice(familyProfileCount);
  return familyPrice - fromPrice;
};

export type PackageType = 'single' | 'couple' | 'family';

export const getPackageInfo = (tier: PackageType) => PRICING[tier];

export const getUpgradePrice = (from: PackageType, to: PackageType, familyProfileCount?: number): number | null => {
  if (to === 'family' && (from === 'single' || from === 'couple')) {
    return calculateUpgradeToFamilyPrice(from, familyProfileCount || PRICING.family.minProfiles);
  }
  if (from === 'single' && to === 'couple') {
    return UPGRADE_PRICES.single_to_couple;
  }
  return null;
};

export const canUpgrade = (from: PackageType, to: PackageType): boolean => {
  const tiers: PackageType[] = ['single', 'couple', 'family'];
  return tiers.indexOf(to) > tiers.indexOf(from);
};
