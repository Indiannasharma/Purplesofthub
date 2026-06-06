'use client'

import { CURRENCY_CONFIG, SUPPORTED_CURRENCIES } from '@/lib/pricing/currency'
import { useCurrency } from '@/context/CurrencyContext'

interface Props {
  compact?: boolean
  onChange?: () => void
}

export default function CurrencySwitcher({ compact = false, onChange }: Props) {
  const { currency, setCurrency } = useCurrency()

  return (
    <label
      title="Select display currency"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 6 : 8,
        border: '1px solid rgba(168,85,247,0.28)',
        borderRadius: 10,
        background: 'rgba(124,58,237,0.08)',
        color: 'var(--text-secondary, #9d8fd4)',
        padding: compact ? '7px 9px' : '8px 11px',
        minHeight: compact ? 38 : 40,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          color: '#a855f7',
          fontSize: 13,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {CURRENCY_CONFIG[currency].symbol}
      </span>
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Currency
      </span>
      <select
        value={currency}
        aria-label="Display currency"
        onChange={(event) => {
          setCurrency(event.target.value as typeof currency)
          onChange?.()
        }}
        style={{
          border: 0,
          outline: 0,
          background: 'transparent',
          color: 'inherit',
          fontFamily: 'Outfit, sans-serif',
          fontSize: compact ? 12 : 13,
          fontWeight: 800,
          cursor: 'pointer',
          maxWidth: compact ? 74 : 88,
        }}
      >
        {SUPPORTED_CURRENCIES.map(code => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  )
}
