'use client'

import { useExchangeRate, convertNGNtoUSD } from '@/lib/hooks/useExchangeRate'

interface Props {
  ngnPrice: number
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
}

/**
 * Displays a price with dynamic USD conversion using current exchange rate
 *
 * Shows: From ₦450,000 (~$321 USD)
 *
 * The USD price is calculated dynamically from the NGN price using
 * the current exchange rate fetched from /api/exchange-rate
 */
export default function DynamicStartingPrice({
  ngnPrice,
  showLabel = true,
  size = 'medium',
}: Props) {
  const { rate, loading } = useExchangeRate()

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
        ₦{ngnPrice.toLocaleString()}
      </span>

      <span
        style={{
          fontSize: labelSize,
          color: 'var(--cyber-body, #4a3f6b)',
          minWidth: '120px',
          textAlign: 'left',
        }}
      >
        {loading ? (
          <span style={{ opacity: 0.6 }}>calculating...</span>
        ) : (
          <>
            (~${convertNGNtoUSD(ngnPrice, rate).toLocaleString()} USD)
          </>
        )}
      </span>
    </div>
  )
}
