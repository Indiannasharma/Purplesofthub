'use client'

import type { CSSProperties } from 'react'
import { useCurrency } from '@/context/CurrencyContext'
import { formatRegionalPrice } from '@/lib/pricing/currency'

interface Props {
  amountNGN: number
  amountUSD?: number
  prefix?: string
  suffix?: string
  includeCode?: boolean
  style?: CSSProperties
  className?: string
}

export default function RegionalPrice({
  amountNGN,
  amountUSD,
  prefix = '',
  suffix = '',
  includeCode = true,
  style,
  className,
}: Props) {
  const { currency } = useCurrency()
  const price = formatRegionalPrice(amountNGN, amountUSD, currency, { includeCode })

  return (
    <span className={className} style={style}>
      {prefix}{price}{suffix}
    </span>
  )
}
