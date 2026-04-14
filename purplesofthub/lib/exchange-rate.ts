/**
 * Exchange Rate Utility
 *
 * Fetches and caches USD to NGN exchange rate for 24 hours.
 * Uses in-memory caching to minimize API calls and improve performance.
 *
 * The rate is fetched only when:
 * - No cached rate exists
 * - Cache has expired (>24 hours old)
 *
 * Subsequent requests within 24 hours return the cached rate.
 */

interface CachedRate {
  rate: number
  timestamp: number
}

// In-memory cache: { rate: number, timestamp: number }
let cache: CachedRate | null = null

// 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 86400000 ms

// Default fallback rate
const FALLBACK_RATE = 1400

/**
 * Get the current USD to NGN exchange rate
 *
 * - Returns cached rate if available and fresh (<24 hours old)
 * - Fetches fresh rate from API if cache is expired or missing
 * - Falls back to 1400 if API fails
 *
 * @returns Promise<number> - Exchange rate (NGN per USD)
 */
export async function getUSDtoNGNRate(): Promise<number> {
  const now = Date.now()

  // Return cached rate if still valid
  if (cache && now - cache.timestamp < CACHE_DURATION) {
    console.log(
      `[Exchange Rate] Using cached rate: ₦${cache.rate} (age: ${Math.round((now - cache.timestamp) / 1000 / 60)} minutes)`
    )
    return cache.rate
  }

  try {
    console.log('[Exchange Rate] Fetching fresh rate from API...')

    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 86400 }, // Revalidate every 24 hours for Next.js cache
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const rate = Math.round(data.rates.NGN)

    // Update cache
    cache = {
      rate,
      timestamp: now,
    }

    console.log(`[Exchange Rate] Fresh rate fetched: ₦${rate}/USD at ${new Date(now).toISOString()}`)
    return rate
  } catch (error) {
    console.error('[Exchange Rate] Failed to fetch from API, using fallback:', error)

    // If cache exists (even if expired), use it as fallback
    if (cache) {
      console.log(
        `[Exchange Rate] Cache expired but using stale rate as fallback: ₦${cache.rate}/USD`
      )
      return cache.rate
    }

    // Ultimate fallback
    console.log(`[Exchange Rate] Using hardcoded fallback: ₦${FALLBACK_RATE}/USD`)
    return FALLBACK_RATE
  }
}

/**
 * Get cached rate without fetching
 * Returns null if no cached rate exists
 */
export function getCachedRate(): number | null {
  const now = Date.now()

  if (cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.rate
  }

  return null
}

/**
 * Convert NGN price to USD using current rate
 *
 * @param ngnPrice - Price in NGN
 * @param rate - Exchange rate (NGN per USD)
 * @returns Rounded USD price
 */
export function convertNGNtoUSD(ngnPrice: number, rate: number): number {
  return Math.round(ngnPrice / rate)
}

/**
 * Format a price pair with both NGN and USD
 *
 * @param ngnPrice - Price in NGN
 * @param rate - Exchange rate (NGN per USD)
 * @returns Formatted string like "₦450,000 (~$321 USD)"
 */
export function formatPricePair(ngnPrice: number, rate: number): string {
  const usdPrice = convertNGNtoUSD(ngnPrice, rate)
  return `₦${ngnPrice.toLocaleString()} (~$${usdPrice.toLocaleString()} USD)`
}

/**
 * Cache statistics for debugging (development only)
 */
export function getCacheStats() {
  if (!cache) {
    return { cached: false, message: 'No cached rate' }
  }

  const now = Date.now()
  const age = now - cache.timestamp
  const remaining = CACHE_DURATION - age

  return {
    cached: true,
    rate: cache.rate,
    age: Math.round(age / 1000 / 60), // minutes
    remaining: Math.round(remaining / 1000 / 60), // minutes
    cached_at: new Date(cache.timestamp).toISOString(),
    expires_at: new Date(cache.timestamp + CACHE_DURATION).toISOString(),
  }
}
