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
    expect(calculateFamilyPrice(4)).toBe(99);
  });

  it('should calculate correct family price for additional profiles', () => {
    expect(calculateFamilyPrice(5)).toBe(99 + 10);      // 109€
    expect(calculateFamilyPrice(6)).toBe(99 + 10 * 2);  // 119€
    expect(calculateFamilyPrice(7)).toBe(99 + 10 * 3);  // 129€
    expect(calculateFamilyPrice(8)).toBe(99 + 10 * 4);  // 139€
    expect(calculateFamilyPrice(9)).toBe(99 + 10 * 5);  // 149€
    expect(calculateFamilyPrice(10)).toBe(99 + 10 * 6); // 159€
  });

  it('should clamp family price to min/max profiles', () => {
    expect(calculateFamilyPrice(3)).toBe(99);  // clamped to 4
    expect(calculateFamilyPrice(11)).toBe(159); // clamped to 10
  });
});

describe('Upgrade Pricing from Single (49€)', () => {
  it('should calculate correct upgrade to Family with 4 profiles', () => {
    expect(calculateUpgradeToFamilyPrice('single', 4)).toBe(50); // 99 - 49
  });

  it('should calculate correct upgrade to Family with various profile counts', () => {
    expect(calculateUpgradeToFamilyPrice('single', 5)).toBe(60);   // 109 - 49
    expect(calculateUpgradeToFamilyPrice('single', 6)).toBe(70);   // 119 - 49
    expect(calculateUpgradeToFamilyPrice('single', 7)).toBe(80);   // 129 - 49
    expect(calculateUpgradeToFamilyPrice('single', 8)).toBe(90);   // 139 - 49
    expect(calculateUpgradeToFamilyPrice('single', 9)).toBe(100);  // 149 - 49
    expect(calculateUpgradeToFamilyPrice('single', 10)).toBe(110); // 159 - 49
  });
});

describe('Upgrade Pricing from Couple (69€)', () => {
  it('should calculate correct upgrade to Family with 4 profiles', () => {
    expect(calculateUpgradeToFamilyPrice('couple', 4)).toBe(30); // 99 - 69
  });

  it('should calculate correct upgrade to Family with various profile counts', () => {
    expect(calculateUpgradeToFamilyPrice('couple', 5)).toBe(40);  // 109 - 69
    expect(calculateUpgradeToFamilyPrice('couple', 6)).toBe(50);  // 119 - 69
    expect(calculateUpgradeToFamilyPrice('couple', 7)).toBe(60);  // 129 - 69
    expect(calculateUpgradeToFamilyPrice('couple', 8)).toBe(70);  // 139 - 69
    expect(calculateUpgradeToFamilyPrice('couple', 9)).toBe(80);  // 149 - 69
    expect(calculateUpgradeToFamilyPrice('couple', 10)).toBe(90); // 159 - 69
  });
});

describe('getUpgradePrice helper', () => {
  it('should return correct upgrade price for Single to Couple', () => {
    expect(getUpgradePrice('single', 'couple')).toBe(20); // 69 - 49
  });

  it('should return correct upgrade price for Single to Family', () => {
    expect(getUpgradePrice('single', 'family', 4)).toBe(50);
    expect(getUpgradePrice('single', 'family', 6)).toBe(70);
    expect(getUpgradePrice('single', 'family', 10)).toBe(110);
  });

  it('should return correct upgrade price for Couple to Family', () => {
    expect(getUpgradePrice('couple', 'family', 4)).toBe(30);
    expect(getUpgradePrice('couple', 'family', 6)).toBe(50);
    expect(getUpgradePrice('couple', 'family', 10)).toBe(90);
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
