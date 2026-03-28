import { describe, it, expect } from 'vitest';
import { PRICING, getPlanInfo, isSubscriptionPlan, isPlanModule, type PlanType } from './pricing';

describe('Pricing', () => {
  it('should have correct prices', () => {
    expect(PRICING.anker.price).toBe(49);
    expect(PRICING.plus.price).toBe(9);
    expect(PRICING.familie.price).toBe(14);
  });

  it('should identify subscription plans correctly', () => {
    expect(isSubscriptionPlan('anker')).toBe(false);
    expect(isSubscriptionPlan('plus')).toBe(true);
    expect(isSubscriptionPlan('familie')).toBe(true);
  });

  it('should check plan modules correctly', () => {
    expect(isPlanModule('anker', 'vorsorge')).toBe(true);
    expect(isPlanModule('anker', 'pflege-begleiter')).toBe(false);
    expect(isPlanModule('plus', 'pflege-begleiter')).toBe(true);
    expect(isPlanModule('familie', 'familienfreigabe')).toBe(true);
  });

  it('should return plan info', () => {
    const anker = getPlanInfo('anker');
    expect(anker.mode).toBe('payment');
    expect(anker.maxProfiles).toBe(1);

    const familie = getPlanInfo('familie');
    expect(familie.mode).toBe('subscription');
    expect(familie.maxProfiles).toBe(10);
  });
});
