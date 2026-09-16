/** Locale-aware currency formatting used across shop, checkout and donations. */

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    const symbol = SYMBOLS[currency] ?? '';
    return `${symbol}${Number(amount || 0).toFixed(2)}`;
  }
};

export const currencySymbol = (currency = 'USD'): string => SYMBOLS[currency] ?? '';
