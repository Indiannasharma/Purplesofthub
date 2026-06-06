'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { formatRegionalPrice } from '@/lib/pricing/currency'

interface Props {
  ngnPrice: number
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
}

/**
 * Displays a starting price using the current regional display currency.
 */
export default function DynamicStartingPrice({
  ngnPrice,
  showLabel = true,
  size = 'medium',
}: Props) {
  const { currency } = useCurrency()

  const sizeStyles = {
    small: { priceSize: '14px', labelSize: '12px', gap: '8px' },
    medium: { priceSize: '18px', labelSize: '14px', gap: '12px' },
    large: { priceSize: '28px', labelSize: '16px', gap: '16px' },
  }

  const { priceSize, labelSize, gap } = sizeStyles[size]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        flexWrap: 'wrap',
      }}
    >
      {showLabel && (
        <span
          style={{
            fontSize: labelSize,
            fontWeight: 600,
            color: 'var(--cyber-body, #4a3f6b)',
          }}
        >
          From
        </span>
      )}

      <span
        style={{
          fontSize: priceSize,
          fontWeight: 900,
          color: '#7c3aed',
        }}
      >
        {formatRegionalPrice(ngnPrice, undefined, currency)}
      </span>
    </div>
  )
}
