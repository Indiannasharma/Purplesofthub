'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_CURRENCY,
  getBrowserLocaleCurrency,
  getCurrencyForCountry,
  isSupportedCurrency,
  type SupportedCurrency,
} from '@/lib/pricing/currency'

const STORAGE_KEY = 'purplesofthub_currency'

interface CurrencyContextValue {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  children,
  initialCountry,
}: {
  children: ReactNode
  initialCountry?: string | null
}) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() =>
    getCurrencyForCountry(initialCountry) || DEFAULT_CURRENCY
  )

  useEffect(() => {
    const savedCurrency = window.localStorage.getItem(STORAGE_KEY)
    if (isSupportedCurrency(savedCurrency)) {
      setCurrencyState(savedCurrency)
      return
    }

    const localeCurrency = getBrowserLocaleCurrency(navigator.language)
    if (localeCurrency) setCurrencyState(localeCurrency)
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isSupportedCurrency(event.newValue)) {
        setCurrencyState(event.newValue)
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency: (nextCurrency) => {
      setCurrencyState(nextCurrency)
      window.localStorage.setItem(STORAGE_KEY, nextCurrency)
    },
  }), [currency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used inside CurrencyProvider')
  return context
}
