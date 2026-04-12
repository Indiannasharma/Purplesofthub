import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  draft:     { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.2)' },
  pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: 'rgba(245,158,11,0.2)'  },
  paid:      { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.2)'  },
  overdue:   { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: 'rgba(239,68,68,0.2)'   },
  cancelled: { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.2)' },
}

export default async function ClientInvoicesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`*, projects(title)`)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const totalPaid = (invoices || [])
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + (Number(i.amount) || 0), 0)

  const totalPending = (invoices || [])
    .filter(i => i.status === 'pending')
    .reduce((s, i) => s + (Number(i.amount) || 0), 0)

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--cmd-heading)', margin: '0 0 4px' }}>
          My Invoices
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--cmd-body)', margin: 0 }}>
          {invoices?.length || 0} total invoices
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total Paid',     value: `₦${totalPaid.toLocaleString()}`,     icon: '✅', color: '#10b981' },
          { label: 'Pending',        value: `₦${totalPending.toLocaleString()}`,  icon: '⏳', color: '#f59e0b' },
          { label: 'Total Invoices', value: invoices?.length || 0,                icon: '🧾', color: '#a855f7' },
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

      {/* Empty state */}
      {!invoices?.length ? (
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '16px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🧾</p>
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
          {invoices.map((invoice: any) => {
            const s = STATUS_STYLES[invoice.status] || STATUS_STYLES.draft
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
                {/* Gradient left accent */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, bottom: 0,
                  width: '3px',
                  background: 'linear-gradient(180deg, #7c3aed, #22d3ee)',
                }} />

                {/* Left: invoice ID + project + date */}
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

                {/* Right: amount + status */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0,
                }}>
                  <p style={{
                    fontSize: '20px', fontWeight: 900,
                    color: '#7c3aed', margin: 0,
                  }}>
                    ₦{Number(invoice.amount || 0).toLocaleString()}
                  </p>
                  <span style={{
                    display: 'inline-flex', padding: '4px 12px',
                    borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                    background: s.bg, color: s.color,
                    border: `1px solid ${s.border}`,
                    textTransform: 'capitalize', whiteSpace: 'nowrap',
                  }}>
                    {invoice.status || 'draft'}
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
