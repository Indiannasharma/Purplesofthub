import {
  BASE_NGN_PER_USD,
  formatCurrencyAmount,
  formatRegionalPrice,
  type SupportedCurrency,
} from '@/lib/pricing/currency'

/**
 * The recovery service is sold at one exact USD price for each supported
 * platform. Keep the NGN checkout amount derived from the shared exchange-rate
 * configuration rather than maintaining a second, manually entered rate.
 */
export const ACCOUNT_RECOVERY_PRICE_USD = 99
export const ACCOUNT_RECOVERY_PRICE_NGN = ACCOUNT_RECOVERY_PRICE_USD * BASE_NGN_PER_USD

export const PAID_ACCOUNT_RECOVERY_PLATFORMS = [
  'facebook',
  'instagram',
  'tiktok',
] as const

export function getAccountRecoveryPriceNGN(platform: string) {
  return (PAID_ACCOUNT_RECOVERY_PLATFORMS as readonly string[]).includes(platform)
    ? ACCOUNT_RECOVERY_PRICE_NGN
    : null
}

export function formatAccountRecoveryPrice(currency: SupportedCurrency) {
  // The USD price is contractual, so it must remain $99 rather than following
  // the generic display rounding used for starting prices elsewhere.
  if (currency === 'USD') {
    return formatCurrencyAmount(ACCOUNT_RECOVERY_PRICE_USD, currency)
  }

  return formatRegionalPrice(ACCOUNT_RECOVERY_PRICE_NGN, ACCOUNT_RECOVERY_PRICE_USD, currency)
}
