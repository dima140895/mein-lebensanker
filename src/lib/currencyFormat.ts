/**
 * Currency & date formatting utilities for displaying monetary values
 * with their associated currency code, and dates in locale format.
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
  CHF: 'CHF',
  JPY: 'JPY',
  TRY: 'TRY',
  PLN: 'PLN',
  CZK: 'CZK',
  SEK: 'SEK',
  NOK: 'NOK',
  DKK: 'DKK',
  CAD: 'CAD',
  AUD: 'AUD',
};

/**
 * Adds thousand-separator dots to a numeric string.
 * Examples: "5000" => "5.000", "1234567" => "1.234.567"
 */
function addThousandSeparator(numStr: string): string {
  // Remove any existing separators/spaces
  const cleaned = numStr.replace(/[.\s]/g, '').replace(/,/g, '.');
  
  // Split integer and decimal parts
  const parts = cleaned.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts.slice(1).join('.') : null;
  
  // Add dots as thousand separators to the integer part
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return decimalPart !== null ? `${formatted},${decimalPart}` : formatted;
}

/**
 * Formats a monetary value with thousand separators and currency code.
 * Examples:
 *   formatWithCurrency("1000", "EUR")    => "1.000 EUR"
 *   formatWithCurrency("50000", "USD")   => "50.000 USD"
 *   formatWithCurrency("500")            => "500 EUR"  (default EUR)
 */
export function formatWithCurrency(value: unknown, currency?: unknown): string {
  if (!value || (typeof value === 'string' && !value.trim())) return '';

  const strValue = String(value).trim();
  const currencyCode = (currency && typeof currency === 'string' && currency.trim())
    ? currency.trim().toUpperCase()
    : 'EUR';

  const label = CURRENCY_SYMBOLS[currencyCode] || currencyCode;

  // Only add thousand separators if the value is numeric
  const numericValue = strValue.replace(/[.\s]/g, '').replace(/,/g, '.');
  const formatted = /^\d+(\.\d+)?$/.test(numericValue)
    ? addThousandSeparator(strValue)
    : strValue;

  return `${formatted} ${label}`;
}

/**
 * Formats a date string (ISO / YYYY-MM-DD) into DD.MM.YYYY format.
 * Returns the original string if parsing fails.
 */
export function formatDate(dateStr: unknown, language: 'de' | 'en' = 'de'): string {
  if (!dateStr || (typeof dateStr === 'string' && !dateStr.trim())) return '';

  const str = String(dateStr).trim();
  const date = new Date(str);

  if (isNaN(date.getTime())) return str;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (language === 'en') {
    return `${month}/${day}/${year}`;
  }

  return `${day}.${month}.${year}`;
}
