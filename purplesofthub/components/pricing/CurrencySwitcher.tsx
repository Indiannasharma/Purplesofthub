'use client'

import { useEffect, useRef, useState } from 'react'
import { CURRENCY_CONFIG, SUPPORTED_CURRENCIES } from '@/lib/pricing/currency'
import { useCurrency } from '@/context/CurrencyContext'

interface Props {
  compact?: boolean
  onChange?: () => void
}

export default function CurrencySwitcher({ compact = false, onChange }: Props) {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={rootRef}
      className={`currency-switcher ${compact ? 'currency-switcher-compact' : ''}`}
      title="Select display currency"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 4 : 8,
        border: '1px solid rgba(168,85,247,0.28)',
        borderRadius: 10,
        background: 'rgba(124,58,237,0.08)',
        color: 'var(--text-secondary, #9d8fd4)',
        padding: compact ? '5px 7px' : '8px 11px',
        minHeight: compact ? 34 : 40,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        aria-label="Display currency"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: compact ? 4 : 7,
          border: 0,
          padding: 0,
          margin: 0,
          background: 'transparent',
          color: 'inherit',
          fontFamily: 'Outfit, sans-serif',
          cursor: 'pointer',
          lineHeight: 1,
          outline: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            color: '#a855f7',
            fontSize: compact ? 12 : 13,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {CURRENCY_CONFIG[currency].symbol}
        </span>
        <span
          style={{
            color: 'var(--text-primary, #1a0533)',
            fontSize: compact ? 11.5 : 13,
            fontWeight: 900,
            letterSpacing: 0,
            lineHeight: 1,
          }}
        >
          {currency}
        </span>
        <span
          aria-hidden="true"
          style={{
            color: '#a855f7',
            fontSize: compact ? 10 : 11,
            lineHeight: 1,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        >
          ▾
        </span>
      </button>
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
      {open && (
        <div
          role="listbox"
          aria-label="Currency options"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 1200,
            width: compact ? 118 : 142,
            padding: 6,
            borderRadius: 12,
            border: '1px solid rgba(168,85,247,0.24)',
            background: 'var(--nav-bg, rgba(255,255,255,0.98))',
            boxShadow: '0 18px 50px rgba(24, 5, 51, 0.16)',
            backdropFilter: 'blur(18px) saturate(180%)',
            WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          }}
        >
          {SUPPORTED_CURRENCIES.map(code => {
            const active = code === currency

            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setCurrency(code)
                  setOpen(false)
                  onChange?.()
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: compact ? '8px 9px' : '9px 10px',
                  border: 0,
                  borderRadius: 9,
                  background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                  color: active ? '#7c3aed' : 'var(--text-primary, #1a0533)',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: compact ? 12 : 13,
                  fontWeight: active ? 900 : 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{code}</span>
                <span style={{ color: active ? '#7c3aed' : 'var(--text-muted, #7c5a9e)' }}>
                  {CURRENCY_CONFIG[code].symbol}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
