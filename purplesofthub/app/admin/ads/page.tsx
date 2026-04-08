'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ClientAds {
  id: string
  full_name: string
  email: string
  business_name: string | null
  active_plan: string | null
  plan_status: string | null
  totalSpend: number
  totalReach: number
  totalClicks: number
  activeCampaigns: number
}

export default function AdsManagerPage() {
  const [clients, setClients] = useState<ClientAds[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalSpend: 0,
    totalReach: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .not('active_plan', 'is', null)
      .order('created_at', { ascending: false })

    if (profiles) {
      const enriched = await Promise.all(
        profiles.map(async profile => {
          const { data: campaigns } = await supabase
            .from('ad_campaigns')
            .select('id, status')
            .eq('client_id', profile.id)

          const { data: statsData } = await supabase
            .from('ad_stats')
            .select('spend, reach, clicks')
            .eq('client_id', profile.id)

          const totalSpend = statsData?.reduce((s, r) => s + (r.spend || 0), 0) || 0
          const totalReach = statsData?.reduce((s, r) => s + (r.reach || 0), 0) || 0
          const totalClicks = statsData?.reduce((s, r) => s + (r.clicks || 0), 0) || 0
          const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0

          return {
            ...profile,
            totalSpend,
            totalReach,
            totalClicks,
            activeCampaigns,
          }
        })
      )

      setClients(enriched)
      setStats({
        totalClients: enriched.length,
        activeClients: enriched.filter(c => c.plan_status === 'active').length,
        totalSpend: enriched.reduce((s, c) => s + c.totalSpend, 0),
        totalReach: enriched.reduce((s, c) => s + c.totalReach, 0),
      })
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: 'var(--cmd-heading)',
            margin: '0 0 4px',
          }}>
            Ads Manager 📊
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--cmd-body)',
            margin: 0,
          }}>
            Manage all client ad campaigns
          </p>
        </div>
        <Link
          href="/admin/campaigns/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            padding: '11px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          + New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {[
          {
            label: 'Total Ad Clients',
            value: stats.totalClients,
            icon: '👥',
            color: '#7c3aed',
            bg: 'rgba(124,58,237,0.1)',
          },
          {
            label: 'Active Plans',
            value: stats.activeClients,
            icon: '✅',
            color: '#10b981',
            bg: 'rgba(16,185,129,0.1)',
          },
          {
            label: 'Total Ad Spend',
            value: `₦${stats.totalSpend.toLocaleString()}`,
            icon: '💰',
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)',
          },
          {
            label: 'Total Reach',
            value: stats.totalReach > 1000
              ? `${(stats.totalReach/1000).toFixed(1)}K`
              : stats.totalReach,
            icon: '👁',
            color: '#22d3ee',
            bg: 'rgba(34,211,238,0.1)',
          },
        ].map(stat => (
          <div key={stat.label} className="cmd-stat-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: stat.color,
                  margin: '0 0 2px',
                  lineHeight: 1,
                }}>
                  {loading ? '...' : stat.value}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--cmd-body)',
                  margin: 0,
                }}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clients table */}
      <div style={{
        background: 'var(--cmd-card)',
        border: '1px solid var(--cmd-border)',
        borderRadius: '20px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 80px 80px 80px 120px',
          gap: '16px',
          padding: '14px 24px',
          borderBottom: '1px solid var(--cmd-border)',
          background: 'rgba(124,58,237,0.04)',
        }}>
          {['Client', 'Plan', 'Status', 'Spend', 'Reach', 'Campaigns', 'Actions'].map(h => (
            <p key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--cmd-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              margin: 0,
            }}>
              {h}
            </p>
          ))}
        </div>

        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--cmd-body)',
          }}>
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div style={{
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📊</p>
            <p style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--cmd-heading)',
              margin: '0 0 6px',
            }}>
              No ad clients yet
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--cmd-body)',
              margin: 0,
            }}>
              Clients who purchase Meta Ads plans will appear here
            </p>
          </div>
        ) : (
          clients.map((client, i) => (
            <div
              key={client.id}
              className="cmd-table-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 80px 80px 80px 120px',
                gap: '16px',
                padding: '16px 24px',
                borderBottom: i < clients.length - 1
                  ? '1px solid rgba(124,58,237,0.06)'
                  : 'none',
                alignItems: 'center',
              }}
            >
              {/* Client */}
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--cmd-heading)',
                  margin: '0 0 2px',
                }}>
                  {client.full_name}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--cmd-body)',
                  margin: '0 0 2px',
                }}>
                  {client.email}
                </p>
                {client.business_name && (
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--cmd-muted)',
                    margin: 0,
                  }}>
                    {client.business_name}
                  </p>
                )}
              </div>

              {/* Plan */}
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#a855f7',
                background: 'rgba(124,58,237,0.1)',
                padding: '3px 10px',
                borderRadius: '100px',
                display: 'inline-block',
                whiteSpace: 'nowrap',
              }}>
                {client.active_plan || '—'}
              </span>

              {/* Status */}
              <span className={
                client.plan_status === 'active'
                  ? 'cmd-badge-active'
                  : 'cmd-badge-pending'
              }>
                {client.plan_status === 'active' ? '🟢 Active' : '⏳ Pending'}
              </span>

              {/* Spend */}
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#f59e0b',
                margin: 0,
              }}>
                ₦{client.totalSpend.toLocaleString()}
              </p>

              {/* Reach */}
              <p style={{
                fontSize: '13px',
                color: 'var(--cmd-body)',
                margin: 0,
              }}>
                {client.totalReach > 1000
                  ? `${(client.totalReach/1000).toFixed(1)}K`
                  : client.totalReach || '0'}
              </p>

              {/* Campaigns */}
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#22d3ee',
                background: 'rgba(34,211,238,0.1)',
                padding: '3px 10px',
                borderRadius: '100px',
                display: 'inline-block',
                textAlign: 'center',
              }}>
                {client.activeCampaigns}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <Link
                  href={`/admin/ads/${client.id}`}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#a855f7',
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Manage →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}