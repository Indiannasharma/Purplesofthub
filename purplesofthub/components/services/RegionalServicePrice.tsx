'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { formatRegionalPrice } from '@/lib/pricing/currency'

interface RegionalServicePriceProps {
  amountNGN: number
  amountUSD: number
  plus?: boolean
}

export default function RegionalServicePrice({ amountNGN, amountUSD, plus = false }: RegionalServicePriceProps) {
  const { currency } = useCurrency()
  return <>{formatRegionalPrice(amountNGN, amountUSD, currency, { plus })}</>
}
