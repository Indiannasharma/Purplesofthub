import { NextResponse } from 'next/server'
import { getUSDtoNGNRate, getCacheStats } from '@/lib/exchange-rate'

/**
 * GET /api/exchange-rate
 *
 * Returns current USD to NGN exchange rate and cache status.
 * Rate is cached for 24 hours.
 *
 * Response:
 * {
 *   rate: number,        // NGN per USD (e.g., 1400)
 *   lastUpdated: string, // ISO timestamp of when rate was fetched
 *   cacheAge: number,    // Age of cache in minutes
 *   debug?: object       // Cache stats (only in development)
 * }
 */
export async function GET(request: Request) {
  try {
    const rate = await getUSDtoNGNRate()

    const response = {
      rate,
      lastUpdated: new Date().toISOString(),
      cacheAge: 'variable', // Will be recalculated on each request
    }

    // Include debug info in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        ...response,
        debug: getCacheStats(),
      })
    }

    return NextResponse.json(response, {
      headers: {
        // Cache this response for 1 hour on the CDN
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Exchange rate API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch exchange rate',
        fallback: 1400,
      },
      { status: 503 }
    )
  }
}
