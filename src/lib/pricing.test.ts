import { describe, it, expect } from 'vitest';
import { 
  calculateFamilyPrice, 
  calculateUpgradeToFamilyPrice, 
  getUpgradePrice,
  canUpgrade,
  PRICING 
} from './pricing';

describe('Family Pricing', () => {
  it('should calculate correct family price for base (4 profiles)', () => {
    expect(calculateFamilyPrice(4)).toBe(59);
  });

  it('should calculate correct family price for additional profiles', () => {
    expect(calculateFamilyPrice(5)).toBe(59 + 19);      // 78€
    expect(calculateFamilyPrice(6)).toBe(59 + 19 * 2);  // 97€
    expect(calculateFamilyPrice(7)).toBe(59 + 19 * 3);  // 116€
    expect(calculateFamilyPrice(8)).toBe(59 + 19 * 4);  // 135€
    expect(calculateFamilyPrice(9)).toBe(59 + 19 * 5);  // 154€
    expect(calculateFamilyPrice(10)).toBe(59 + 19 * 6); // 173€
  });

  it('should clamp family price to min/max profiles', () => {
    expect(calculateFamilyPrice(3)).toBe(59);  // clamped to 4
    expect(calculateFamilyPrice(11)).toBe(173); // clamped to 10
  });
});

describe('Upgrade Pricing from Single (39€)', () => {
  it('should calculate correct upgrade to Family with 4 profiles', () => {
    expect(calculateUpgradeToFamilyPrice('single', 4)).toBe(20); // 59 - 39
  });

  it('should calculate correct upgrade to Family with various profile counts', () => {
    expect(calculateUpgradeToFamilyPrice('single', 5)).toBe(39);  // 78 - 39
    expect(calculateUpgradeToFamilyPrice('single', 6)).toBe(58);  // 97 - 39
    expect(calculateUpgradeToFamilyPrice('single', 7)).toBe(77);  // 116 - 39
    expect(calculateUpgradeToFamilyPrice('single', 8)).toBe(96);  // 135 - 39
    expect(calculateUpgradeToFamilyPrice('single', 9)).toBe(115); // 154 - 39
    expect(calculateUpgradeToFamilyPrice('single', 10)).toBe(134); // 173 - 39
  });
});

describe('Upgrade Pricing from Couple (49€)', () => {
  it('should calculate correct upgrade to Family with 4 profiles', () => {
    expect(calculateUpgradeToFamilyPrice('couple', 4)).toBe(10); // 59 - 49
  });

  it('should calculate correct upgrade to Family with various profile counts', () => {
    expect(calculateUpgradeToFamilyPrice('couple', 5)).toBe(29);  // 78 - 49
    expect(calculateUpgradeToFamilyPrice('couple', 6)).toBe(48);  // 97 - 49
    expect(calculateUpgradeToFamilyPrice('couple', 7)).toBe(67);  // 116 - 49
    expect(calculateUpgradeToFamilyPrice('couple', 8)).toBe(86);  // 135 - 49
    expect(calculateUpgradeToFamilyPrice('couple', 9)).toBe(105); // 154 - 49
    expect(calculateUpgradeToFamilyPrice('couple', 10)).toBe(124); // 173 - 49
  });
});

describe('getUpgradePrice helper', () => {
  it('should return correct upgrade price for Single to Couple', () => {
    expect(getUpgradePrice('single', 'couple')).toBe(10);
  });

  it('should return correct upgrade price for Single to Family', () => {
    expect(getUpgradePrice('single', 'family', 4)).toBe(20);
    expect(getUpgradePrice('single', 'family', 6)).toBe(58);
    expect(getUpgradePrice('single', 'family', 10)).toBe(134);
  });

  it('should return correct upgrade price for Couple to Family', () => {
    expect(getUpgradePrice('couple', 'family', 4)).toBe(10);
    expect(getUpgradePrice('couple', 'family', 6)).toBe(48);
    expect(getUpgradePrice('couple', 'family', 10)).toBe(124);
  });

  it('should return null for invalid upgrades', () => {
    expect(getUpgradePrice('family', 'single')).toBeNull();
    expect(getUpgradePrice('couple', 'single')).toBeNull();
    expect(getUpgradePrice('family', 'couple')).toBeNull();
  });
});

describe('canUpgrade', () => {
  it('should correctly identify valid upgrades', () => {
    expect(canUpgrade('single', 'couple')).toBe(true);
    expect(canUpgrade('single', 'family')).toBe(true);
    expect(canUpgrade('couple', 'family')).toBe(true);
  });

  it('should correctly identify invalid upgrades', () => {
    expect(canUpgrade('family', 'single')).toBe(false);
    expect(canUpgrade('couple', 'single')).toBe(false);
    expect(canUpgrade('family', 'couple')).toBe(false);
    expect(canUpgrade('single', 'single')).toBe(false);
  });
});
