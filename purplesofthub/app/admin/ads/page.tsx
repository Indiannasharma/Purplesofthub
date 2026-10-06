'use client'

import { useEffect, useState } from 'react'
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
  const [readError, setReadError] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalSpend: 0,
    totalReach: 0,
  })



  async function loadData() {
    try {
      setReadError(false);

    const supabase = createClient()

    const { data: profiles , error: readFailure1} = await supabase
      .from('profiles')
      .select('*')
      .not('active_plan', 'is', null)
      .order('created_at', { ascending: false })
      if (readFailure1) throw readFailure1;

    if (profiles) {
      const enriched = await Promise.all(
        profiles.map(async profile => {
          const { data: campaigns , error: readFailure2} = await supabase
            .from('ad_campaigns')
            .select('id, status')
            .eq('client_id', profile.id)
      if (readFailure2) throw readFailure2;

          const { data: statsData , error: readFailure3} = await supabase
            .from('ad_stats')
            .select('spend, reach, clicks')
            .eq('client_id', profile.id)
      if (readFailure3) throw readFailure3;

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

    } catch { setReadError(true); } finally { setLoading(false); }
  }

  useEffect(() => {
    // Resolve external reads in a callback after the committed render.
    void Promise.resolve().then(async () => {
    loadData()
      })
  }, [])

  if (readError) return <AdminPage className="cc-module"><AdminErrorState title="Could not load these records" description="Refresh to try again. No record counts are shown while the read has failed." onRetry={() => window.location.reload()} /></AdminPage>;

  return (
    <AdminPage className="cc-module admin-form admin-adopted">

      {/* Header */}
      <AdminPageHeader title={<>Ads Manager</>} description={<>Select a client to manage campaigns and manually recorded advertising metrics.</>}  />

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
          <div key={stat.label} className="cc-panel" style={{ padding: '20px 24px' }}>
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
                  fontWeight: 600,
                  color: stat.color,
                  margin: '0 0 2px',
                  lineHeight: 1,
                }}>
                  {loading ? '...' : stat.value}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: "var(--cc-text-secondary)",
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
        background: "var(--cc-surface)",
        border: '1px solid var(--cc-border)',
        borderRadius: 12,
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 80px 80px 80px 120px',
          gap: '16px',
          padding: '14px 24px',
          borderBottom: '1px solid var(--cc-border)',
          background: 'rgba(124,58,237,0.04)',
        }} className="admin-responsive-grid admin-grid-header">
          {['Client', 'Plan', 'Status', 'Spend', 'Reach', 'Campaigns', 'Actions'].map(h => (
            <p key={h} style={{
              fontSize: '11px',
              fontWeight: 600,
              color: "var(--cc-text-muted)",
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
            color: "var(--cc-text-secondary)",
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
              fontWeight: 600,
              color: "var(--cc-text)",
              margin: '0 0 6px',
            }}>
              No ad clients yet
            </p>
            <p style={{
              fontSize: '13px',
              color: "var(--cc-text-secondary)",
              margin: 0,
            }}>
              Clients who purchase Meta Ads plans will appear here
            </p>
          </div>
        ) : (
          clients.map((client, i) => (
            <div
              key={client.id}
              className="hover:bg-[var(--cc-subtle)] transition-colors admin-responsive-grid admin-grid-record"
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
              <div data-label="Client">
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: "var(--cc-text)",
                  margin: '0 0 2px',
                }}>
                  {client.full_name}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: "var(--cc-text-secondary)",
                  margin: '0 0 2px',
                }}>
                  {client.email}
                </p>
                {client.business_name && (
                  <p style={{
                    fontSize: '11px',
                    color: "var(--cc-text-muted)",
                    margin: 0,
                  }}>
                    {client.business_name}
                  </p>
                )}
              </div>

              {/* Plan */}
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: "var(--cc-accent)",
                background: 'rgba(124,58,237,0.1)',
                padding: '3px 10px',
                borderRadius: '100px',
                display: 'inline-block',
                whiteSpace: 'nowrap',
              }} data-label="Plan">
                {client.active_plan || '—'}
              </span>

              {/* Status */}
              <span className={
                client.plan_status === 'active'
                  ? 'cc-pill cc-pill-success'
                  : 'cc-pill cc-pill-warning'
              } data-label="Status">
                {client.plan_status === 'active' ? '🟢 Active' : '⏳ Pending'}
              </span>

              {/* Spend */}
              <p style={{
                fontSize: '13px',
                fontWeight: 600,
                color: "var(--cc-warning)",
                margin: 0,
              }} data-label="Spend">
                ₦{client.totalSpend.toLocaleString()}
              </p>

              {/* Reach */}
              <p style={{
                fontSize: '13px',
                color: "var(--cc-text-secondary)",
                margin: 0,
              }} data-label="Reach">
                {client.totalReach > 1000
                  ? `${(client.totalReach/1000).toFixed(1)}K`
                  : client.totalReach || '0'}
              </p>

              {/* Campaigns */}
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#22d3ee',
                background: 'rgba(34,211,238,0.1)',
                padding: '3px 10px',
                borderRadius: '100px',
                display: 'inline-block',
                textAlign: 'center',
              }} data-label="Campaigns">
                {client.activeCampaigns}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px' }} data-label="Actions">
                <Link
                  href={`/admin/ads/${client.id}`}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: "var(--cc-accent)",
                    background: 'rgba(124,58,237,0.1)',
                    border: "1px solid var(--cc-border)",
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
    </AdminPage>
  )
}