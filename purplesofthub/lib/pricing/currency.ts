export const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'CAD', 'GBP', 'EUR'] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export interface CurrencyConfig {
  code: SupportedCurrency
  symbol: string
  label: string
  locale: string
  usdRate: number
}

export const DEFAULT_CURRENCY: SupportedCurrency = 'USD'
export const BASE_NGN_PER_USD = 1400

export const CURRENCY_CONFIG: Record<SupportedCurrency, CurrencyConfig> = {
  NGN: { code: 'NGN', symbol: '₦', label: 'Nigerian Naira', locale: 'en-NG', usdRate: BASE_NGN_PER_USD },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US', usdRate: 1 },
  CAD: { code: 'CAD', symbol: '$', label: 'Canadian Dollar', locale: 'en-CA', usdRate: 1.35 },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB', usdRate: 0.8 },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', locale: 'en-IE', usdRate: 0.92 },
}

const EUROPE_COUNTRIES = new Set([
  'AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE',
  'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'XK', 'LV', 'LI', 'LT',
  'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'SM',
  'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'UA', 'VA',
])

export const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  NG: 'NGN',
  US: 'USD',
  CA: 'CAD',
  GB: 'GBP',
  UK: 'GBP',
}

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value as SupportedCurrency)
}

export function normalizeCountryCode(countryCode?: string | null) {
  const code = countryCode?.trim().toUpperCase()
  return code || null
}

export function getCurrencyForCountry(countryCode?: string | null): SupportedCurrency {
  const code = normalizeCountryCode(countryCode)
  if (!code) return DEFAULT_CURRENCY
  if (COUNTRY_CURRENCY_MAP[code]) return COUNTRY_CURRENCY_MAP[code]
  if (EUROPE_COUNTRIES.has(code)) return 'EUR'
  return DEFAULT_CURRENCY
}

export function getCountryFromLocale(locale?: string | null) {
  if (!locale) return null

  try {
    const region = new Intl.Locale(locale).region
    if (region) return region.toUpperCase()
  } catch {
    // Fall through to the lightweight parser below.
  }

  const parts = locale.split(/[-_]/)
  const maybeRegion = parts.find(part => part.length === 2 && /^[a-z]{2}$/i.test(part))
  return maybeRegion ? maybeRegion.toUpperCase() : null
}

export function getBrowserLocaleCurrency(locale?: string | null): SupportedCurrency {
  return getCurrencyForCountry(getCountryFromLocale(locale))
}

export function roundPrice(amount: number, currency: SupportedCurrency) {
  if (!Number.isFinite(amount) || amount <= 0) return 0

  const increment =
    currency === 'NGN'
      ? amount >= 100000 ? 5000 : 1000
      : amount >= 100 ? 10 : 5

  return Math.max(increment, Math.round(amount / increment) * increment)
}

export function convertPrice(
  amountNGN: number,
  amountUSD: number | undefined,
  currency: SupportedCurrency,
) {
  if (!amountNGN && !amountUSD) return 0

  const usdBase = amountUSD && amountUSD > 0 ? amountUSD : amountNGN / BASE_NGN_PER_USD
  const rawAmount = currency === 'NGN' ? amountNGN : usdBase * CURRENCY_CONFIG[currency].usdRate

  return roundPrice(rawAmount, currency)
}

export function formatCurrencyAmount(
  amount: number,
  currency: SupportedCurrency,
  options: { includeCode?: boolean; plus?: boolean } = {},
) {
  if (!amount) return 'Custom'

  const config = CURRENCY_CONFIG[currency]
  const formattedAmount = Math.round(amount).toLocaleString(config.locale, {
    maximumFractionDigits: 0,
  })
  const value = `${config.symbol}${formattedAmount}${options.plus ? '+' : ''}`

  return options.includeCode === false ? value : `${config.code} ${value}`
}

export function formatRegionalPrice(
  amountNGN: number,
  amountUSD: number | undefined,
  currency: SupportedCurrency,
  options: { includeCode?: boolean; plus?: boolean } = {},
) {
  return formatCurrencyAmount(convertPrice(amountNGN, amountUSD, currency), currency, options)
}
