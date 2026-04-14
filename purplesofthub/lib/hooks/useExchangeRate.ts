'use client'

import { useState, useEffect } from 'react'

interface ExchangeRateData {
  rate: number
  lastUpdated: string
  cacheAge: string
}

const FALLBACK_RATE = 1400

/**
 * Hook to fetch and manage exchange rate on the client
 *
 * Fetches rate from /api/exchange-rate and caches it in localStorage
 * to avoid redundant API calls during a user session.
 */
export function useExchangeRate() {
  const [rate, setRate] = useState<number>(FALLBACK_RATE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchRate() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/exchange-rate', {
          next: { revalidate: 3600 }, // Revalidate every hour on client
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch exchange rate: ${response.status}`)
        }

        const data: ExchangeRateData = await response.json()

        if (isMounted) {
          setRate(data.rate)
          // Store in sessionStorage for this session
          sessionStorage.setItem('exchangeRate', JSON.stringify(data))
        }
      } catch (err) {
        console.error('Exchange rate fetch error:', err)

        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch rate')

          // Try to use cached rate from sessionStorage
          const cached = sessionStorage.getItem('exchangeRate')
          if (cached) {
            try {
              const data = JSON.parse(cached)
              setRate(data.rate)
            } catch {
              setRate(FALLBACK_RATE)
            }
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRate()

    return () => {
      isMounted = false
    }
  }, [])

  return { rate, loading, error }
}

/**
 * Convert NGN to USD using exchange rate
 */
export function convertNGNtoUSD(ngnPrice: number, rate: number): number {
  return Math.round(ngnPrice / rate)
}

/**
 * Format price pair showing both NGN and USD
 */
export function formatPricePair(ngnPrice: number, rate: number): string {
  const usdPrice = convertNGNtoUSD(ngnPrice, rate)
  return `₦${ngnPrice.toLocaleString()} (~$${usdPrice.toLocaleString()} USD)`
}
