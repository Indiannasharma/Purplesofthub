'use client'

import { format } from 'date-fns'
import Link from 'next/link'
import CurrencySwitcher from '@/components/pricing/CurrencySwitcher'
import { useCurrency } from '@/context/CurrencyContext'
import {
  CURRENCY_CONFIG,
  formatCurrencyAmount,
  type SupportedCurrency,
} from '@/lib/pricing/currency'

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  draft: { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.2)' },
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  paid: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
  overdue: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
  cancelled: { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.2)' },
}

interface Invoice {
  id: string
  amount: number | string | null
  currency?: string | null
  status?: string | null
  due_date?: string | null
  projects?: { title?: string | null } | null
}

interface Props {
  invoices: Invoice[]
}

function toDisplayAmount(amount: number, sourceCurrency: string | null | undefined, displayCurrency: SupportedCurrency) {
  const numericAmount = Number(amount || 0)
  if (!numericAmount) return 0

  const source = (sourceCurrency || 'NGN').toUpperCase() as SupportedCurrency
  const sourceRate = CURRENCY_CONFIG[source]?.usdRate || CURRENCY_CONFIG.NGN.usdRate
  const usdBase = source === 'USD' ? numericAmount : numericAmount / sourceRate

  return usdBase * CURRENCY_CONFIG[displayCurrency].usdRate
}

function formatInvoiceAmount(amount: number, sourceCurrency: string | null | undefined, displayCurrency: SupportedCurrency) {
  return formatCurrencyAmount(toDisplayAmount(amount, sourceCurrency, displayCurrency), displayCurrency)
}

export default function InvoicesClient({ invoices }: Props) {
  const { currency } = useCurrency()
  const totalPaid = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + toDisplayAmount(Number(invoice.amount || 0), invoice.currency, currency), 0)

  const totalPending = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + toDisplayAmount(Number(invoice.amount || 0), invoice.currency, currency), 0)

  return (
    <>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--cmd-heading)', margin: '0 0 4px' }}>
          My Invoices
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--cmd-body)', margin: 0 }}>
          {invoices.length} total invoices
        </p>
        <div style={{ marginTop: '14px' }}>
          <CurrencySwitcher compact dropdownAlign="left" />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total Paid', value: formatCurrencyAmount(totalPaid, currency), icon: '✓', color: '#10b981' },
          { label: 'Pending', value: formatCurrencyAmount(totalPending, currency), icon: '⌛', color: '#f59e0b' },
          { label: 'Total Invoices', value: invoices.length, icon: '#', color: '#a855f7' },
        ].map(stat => (
          <div
            key={stat.label}
            className="cmd-stat-card"
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: `${stat.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <p style={{
              fontSize: '22px', fontWeight: 900, color: stat.color,
              margin: '0 0 1px', lineHeight: 1,
            }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--cmd-body)', margin: 0 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {!invoices.length ? (
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '16px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>#</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 8px' }}>
            No invoices yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--cmd-body)', margin: '0 0 24px' }}>
            Invoices from your projects will appear here
          </p>
          <Link href="/dashboard/services">
            <button style={{
              padding: '12px 24px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Browse Services →
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invoices.map((invoice) => {
            const status = invoice.status || 'draft'
            const s = STATUS_STYLES[status] || STATUS_STYLES.draft
            return (
              <div
                key={invoice.id}
                style={{
                  background: 'var(--cmd-card)',
                  border: '1px solid rgba(124,58,237,0.12)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, bottom: 0,
                  width: '3px',
                  background: 'linear-gradient(180deg, #7c3aed, #22d3ee)',
                }} />

                <div style={{ paddingLeft: '8px' }}>
                  <p style={{
                    fontSize: '13px', fontWeight: 700,
                    color: '#a855f7', fontFamily: 'monospace',
                    margin: '0 0 4px', letterSpacing: '0.05em',
                  }}>
                    #{String(invoice.id).slice(0, 8).toUpperCase()}
                  </p>
                  <p style={{
                    fontSize: '14px', fontWeight: 700,
                    color: 'var(--cmd-heading)', margin: '0 0 4px',
                  }}>
                    {invoice.projects?.title || 'General Invoice'}
                  </p>
                  {invoice.due_date && (
                    <p style={{ fontSize: '12px', color: 'var(--cmd-muted)', margin: 0 }}>
                      Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0,
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '20px', fontWeight: 900,
                      color: '#7c3aed', margin: 0,
                    }}>
                      {formatInvoiceAmount(Number(invoice.amount || 0), invoice.currency, currency)}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--cmd-muted)', margin: '3px 0 0' }}>
                      Stored in {(invoice.currency || 'NGN').toUpperCase()}
                    </p>
                  </div>
                  <span style={{
                    display: 'inline-flex', padding: '4px 12px',
                    borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                    background: s.bg, color: s.color,
                    border: `1px solid ${s.border}`,
                    textTransform: 'capitalize', whiteSpace: 'nowrap',
                  }}>
                    {status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
