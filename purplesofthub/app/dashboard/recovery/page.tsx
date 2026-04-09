'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RecoveryRequest {
  id: string
  platform: string
  handle: string | null
  support_type: string | null
  status: string
  admin_notes: string | null
  created_at: string
  amount_paid: number | null
}

const platformIcons: Record<string, string> = {
  facebook: '📘',
  instagram: '📸',
  tiktok: '🎵',
  twitter: '🐦',
  youtube: '📺',
  others: '🌐',
}

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  processing: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
  in_progress: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
  approved: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  completed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
}

export default function DashboardRecoveryPage() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('account_recovery_requests')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Recovery requests error:', error)
    }
    setRequests(data || [])
    setLoading(false)
  }

  const statusLabels: Record<string, string> = {
    pending: '⏳ Pending Review',
    processing: '🔄 Processing',
    in_progress: '🔄 In Progress',
    approved: '✅ Approved',
    completed: '✅ Completed',
    rejected: '❌ Rejected',
  }

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          color: 'var(--cmd-heading)',
          margin: '0 0 4px',
        }}>
          Account Recovery 🔐
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--cmd-body)',
          margin: 0,
        }}>
          Track your recovery requests
        </p>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'rgba(124,58,237,0.06)',
        border: '1px solid rgba(124,58,237,0.15)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '18px' }}>ℹ️</span>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--cmd-heading)', fontWeight: 600, margin: '0 0 4px' }}>
            Need help recovering an account?
          </p>
          <p style={{ fontSize: '12px', color: 'var(--cmd-body)', margin: 0 }}>
            Our team handles recovery requests manually. If you need to submit a new request,{' '}
            <a href="https://www.purplesofthub.com/services/social-media-management/account-recovery" 
               target="_blank" 
               rel="noopener noreferrer"
               style={{ color: '#a855f7', fontWeight: 600 }}>
              visit our Account Recovery page
            </a>.
          </p>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{
          background: 'var(--cmd-card)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--cmd-body)',
        }}>
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.12)',
          borderRadius: '20px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🔐</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 6px' }}>
            No recovery requests
          </p>
          <p style={{ fontSize: '13px', color: 'var(--cmd-body)', margin: 0 }}>
            You haven't submitted any recovery requests yet
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map(request => {
            const platform = platformIcons[request.platform] || '🌐'
            const statusStyle = statusColors[request.status] || statusColors.pending
            const isExpanded = expanded === request.id

            return (
              <div
                key={request.id}
                style={{
                  background: 'var(--cmd-card)',
                  border: '1px solid rgba(124,58,237,0.12)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                {/* Card header */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : request.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: statusStyle.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                    }}>
                      {platform}
                    </div>

                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 3px' }}>
                        {request.handle || request.platform}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--cmd-body)', margin: 0, textTransform: 'capitalize' }}>
                        {request.support_type?.replace('_', ' ') || 'Account Recovery'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: statusStyle.color,
                      background: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                      padding: '4px 12px',
                      borderRadius: '100px',
                    }}>
                      {statusLabels[request.status] || 'Pending'}
                    </span>

                    <span style={{ fontSize: '11px', color: 'var(--cmd-muted)' }}>
                      {new Date(request.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <span style={{
                      color: 'var(--cmd-muted)',
                      fontSize: '18px',
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                    }}>
                      ⌄
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{
                    padding: '20px',
                    borderTop: '1px solid rgba(124,58,237,0.1)',
                    background: 'rgba(124,58,237,0.03)',
                  }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-muted)', minWidth: '100px' }}>Platform:</span>
                        <span style={{ fontSize: '14px', color: 'var(--cmd-heading)', textTransform: 'capitalize' }}>{request.platform}</span>
                      </div>
                      {request.handle && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-muted)', minWidth: '100px' }}>Handle:</span>
                          <span style={{ fontSize: '14px', color: 'var(--cmd-heading)' }}>@{request.handle}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-muted)', minWidth: '100px' }}>Status:</span>
                        <span style={{ fontSize: '14px', color: statusStyle.color, fontWeight: 600 }}>
                          {statusLabels[request.status]}
                        </span>
                      </div>
                      {request.admin_notes && (
                        <div style={{
                          marginTop: '8px',
                          background: 'rgba(245,158,11,0.08)',
                          border: '1px solid rgba(245,158,11,0.25)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                        }}>
                          <p style={{ 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            color: '#d97706', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.07em', 
                            margin: '0 0 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            📌 Admin Notes (Internal)
                          </p>
                          <p style={{ 
                            fontSize: '14px', 
                            color: 'var(--cmd-heading)', 
                            margin: 0,
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {request.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      background: 'rgba(124,58,237,0.06)',
                      border: '1px solid rgba(124,58,237,0.15)',
                      borderRadius: '10px',
                    }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-muted)', margin: '0 0 8px' }}>
                        📋 Timeline
                      </p>
                      <div style={{ fontSize: '12px', color: 'var(--cmd-body)' }}>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Submitted:</strong> {new Date(request.created_at).toLocaleString('en-NG', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                        <p style={{ margin: '4px 0', color: statusStyle.color }}>
                          <strong>Current Status:</strong> {statusLabels[request.status]}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a
                        href={`mailto:support@purplesofthub.com?subject=Re: Recovery Request #${request.id.slice(0, 8)}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          background: 'rgba(124,58,237,0.1)',
                          border: '1px solid rgba(124,58,237,0.2)',
                          color: '#a855f7',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        📧 Contact Support
                      </a>
                      <a
                        href="https://wa.me/2348167593393"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          background: 'rgba(37,211,102,0.1)',
                          border: '1px solid rgba(37,211,102,0.2)',
                          color: '#25D366',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        💬 WhatsApp Support
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}