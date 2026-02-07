/**
 * Currency formatting utilities for displaying monetary values
 * with their associated currency symbol/code.
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  JPY: '¥',
  TRY: '₺',
  PLN: 'zł',
  CZK: 'Kč',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  CAD: 'CA$',
  AUD: 'A$',
};

/**
 * Formats a monetary value with its currency symbol.
 * Examples:
 *   formatWithCurrency("1000", "EUR") => "1.000 €"
 *   formatWithCurrency("500", "USD") => "500 $"
 *   formatWithCurrency("500")        => "500 €"  (default EUR)
 */
export function formatWithCurrency(value: unknown, currency?: unknown): string {
  if (!value || (typeof value === 'string' && !value.trim())) return '';

  const strValue = String(value).trim();
  const currencyCode = (currency && typeof currency === 'string' && currency.trim())
    ? currency.trim().toUpperCase()
    : 'EUR';

  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;

  return `${strValue} ${symbol}`;
}
