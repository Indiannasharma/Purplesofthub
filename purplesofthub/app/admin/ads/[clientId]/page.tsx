'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminPage } from "@/components/admin/AdminPage";
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AdsClient { full_name: string | null; active_plan: string | null }
interface AdsCampaign { id: string; platform: string; campaign_name: string; objective: string; status: string; budget_spent: number; budget_total: number }
interface AdsStat { id: string; stat_date: string; platform: string; spend: number; reach: number; clicks: number; impressions: number; conversions: number; roas: number }

interface Props {
  params: Promise<{ clientId: string }>
}

export default function ClientAdsPage({ params }: Props) {
  const { clientId } = use(params)
  const [client, setClient] = useState<AdsClient | null>(null)
  const [campaigns, setCampaigns] = useState<AdsCampaign[]>([])
  const [stats, setStats] = useState<AdsStat[]>([])
  const [loading, setLoading] = useState(true)
  const [readError, setReadError] = useState(false);
  const [showAddStats, setShowAddStats] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [statForm, setStatForm] = useState({
    stat_date: new Date().toISOString().split('T')[0],
    platform: 'facebook',
    impressions: '',
    reach: '',
    clicks: '',
    spend: '',
    conversions: '',
    roas: '',
  })



  const loadData = useCallback(async () => {
    try {
      setReadError(false);

    const supabase = createClient()

    const [profileRes, campaignsRes, statsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', clientId).single(),
      supabase.from('ad_campaigns').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
      supabase.from('ad_stats').select('*').eq('client_id', clientId).order('stat_date', { ascending: false }).limit(30),
    ])

    if (profileRes.error || campaignsRes.error || statsRes.error) throw profileRes.error || campaignsRes.error || statsRes.error;
    setClient(profileRes.data)
    setCampaigns(campaignsRes.data || [])
    setStats(statsRes.data || [])
    setLoading(false)

    } catch { setReadError(true); } finally { setLoading(false); }
  }, [clientId])



  const addManualStats = async () => {
    if (!selectedCampaign) {
      alert('Select a campaign first')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('ad_stats').upsert({
      campaign_id: selectedCampaign,
      client_id: clientId,
      platform: statForm.platform,
      stat_date: statForm.stat_date,
      impressions: parseInt(statForm.impressions) || 0,
      reach: parseInt(statForm.reach) || 0,
      clicks: parseInt(statForm.clicks) || 0,
      spend: parseFloat(statForm.spend) || 0,
      conversions: parseInt(statForm.conversions) || 0,
      roas: parseFloat(statForm.roas) || 0,
      ctr: statForm.clicks && statForm.impressions
        ? ((parseInt(statForm.clicks) / parseInt(statForm.impressions)) * 100)
        : 0,
    })

    if (!error) {
      setShowAddStats(false)
      loadData()
    }
  }

  const createCampaign = async () => {
    const name = prompt('Campaign name:')
    if (!name) return
    const supabase = createClient()
    await supabase.from('ad_campaigns').insert({
      client_id: clientId,
      campaign_name: name,
      platform: 'both',
      status: 'active',
      objective: 'traffic',
      budget_total: 0,
      budget_spent: 0,
    })
    loadData()
  }

  useEffect(() => {
    // Resolve external reads in a callback after the committed render.
    void Promise.resolve().then(async () => {
    loadData()
      })
  }, [loadData])

  if (readError) return <AdminPage className="cc-module"><AdminErrorState title="Could not load these records" description="Refresh to try again. No record counts are shown while the read has failed." onRetry={() => window.location.reload()} /></AdminPage>;

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      color: "var(--cc-text-secondary)",
    }}>
      Loading client data...
    </div>
  )

  const totalStats = stats.reduce(
    (acc, s) => ({
      spend: acc.spend + (s.spend || 0),
      reach: acc.reach + (s.reach || 0),
      clicks: acc.clicks + (s.clicks || 0),
      impressions: acc.impressions + (s.impressions || 0),
      conversions: acc.conversions + (s.conversions || 0),
    }),
    { spend: 0, reach: 0, clicks: 0, impressions: 0, conversions: 0 }
  )

  const avgRoas = stats.length > 0
    ? stats.reduce((s, r) => s + (r.roas || 0), 0) / stats.length
    : 0

  return (
    <AdminPage className="cc-module admin-form admin-adopted">

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/admin/ads" style={{
            fontSize: '13px',
            color: "var(--cc-text-secondary)",
            textDecoration: 'none',
          }}>
            ← Ads Manager
          </Link>
          <span style={{ color: "var(--cc-text-muted)" }}>/</span>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: "var(--cc-text)",
            margin: 0,
          }}>
            {client?.full_name || 'Client Ads'}
          </h1>
          {client?.active_plan && (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: "var(--cc-accent)",
              background: 'rgba(124,58,237,0.1)',
              padding: '3px 10px',
              borderRadius: '100px',
              border: "1px solid var(--cc-border)",
            }}>
              {client.active_plan} Plan
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddStats(!showAddStats)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid rgba(124,58,237,0.3)',
              background: 'transparent',
              color: "var(--cc-accent)",
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            📊 Add Stats
          </button>
          <button
            onClick={createCampaign}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: "var(--cc-accent)",
              color: "var(--cc-on-accent)",
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: "none",
            }}
          >
            + New Campaign
          </button>
        </div>
      </div>

      {/* Add Stats Form */}
      {showAddStats && (
        <div style={{
          background: "var(--cc-surface)",
          border: "1px solid var(--cc-border)",
          borderRadius: 12,
          padding: '24px',
          marginBottom: '24px',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: "var(--cc-text)",
            margin: '0 0 16px',
          }}>
            📊 Add Manual Stats
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                fontSize: '11px',
                fontWeight: 600,
                color: "var(--cc-text-secondary)",
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '6px',
              }} htmlFor="admin-adsclientIdpagetsx-1">
                Campaign *
              </label>
              <select
                value={selectedCampaign}
                onChange={e => setSelectedCampaign(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: "1px solid var(--cc-border)",
                  background: 'rgba(124,58,237,0.06)',
                  color: "var(--cc-text)",
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                id="admin-adsclientIdpagetsx-1">
                <option value="">Select campaign...</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.campaign_name}</option>
                ))}
              </select>
            </div>

            {[
              { key: 'stat_date', label: 'Date', type: 'date' },
              { key: 'platform', label: 'Platform', type: 'select', options: ['facebook', 'instagram', 'both'] },
              { key: 'impressions', label: 'Impressions', type: 'number' },
              { key: 'reach', label: 'Reach', type: 'number' },
              { key: 'clicks', label: 'Clicks', type: 'number' },
              { key: 'spend', label: 'Spend (₦)', type: 'number' },
              { key: 'conversions', label: 'Conversions', type: 'number' },
              { key: 'roas', label: 'ROAS', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: "var(--cc-text-secondary)",
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={statForm[field.key as keyof typeof statForm]}
                    onChange={e => setStatForm(p => ({ ...p, [field.key]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: "1px solid var(--cc-border)",
                      background: 'rgba(124,58,237,0.06)',
                      color: "var(--cc-text)",
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                   aria-label="statForm[field.key as keyof typeof statForm]">
                    {field.options?.map(o => (
                      <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={statForm[field.key as keyof typeof statForm]}
                    onChange={e => setStatForm(p => ({ ...p, [field.key]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: "1px solid var(--cc-border)",
                      background: 'rgba(124,58,237,0.06)',
                      color: "var(--cc-text)",
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                   aria-label="statForm[field.key as keyof typeof statForm]"/>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={addManualStats}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                background: "var(--cc-accent)",
                color: "var(--cc-on-accent)",
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ✅ Save Stats
            </button>
            <button
              onClick={() => setShowAddStats(false)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: "1px solid var(--cc-border)",
                background: 'transparent',
                color: "var(--cc-text-secondary)",
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Performance Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[
          { label: 'Total Spend', value: `₦${totalStats.spend.toLocaleString()}`, icon: '💰', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Total Reach', value: totalStats.reach > 1000 ? `${(totalStats.reach/1000).toFixed(1)}K` : totalStats.reach.toString(), icon: '👥', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
          { label: 'Total Clicks', value: totalStats.clicks.toLocaleString(), icon: '👆', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
          { label: 'Impressions', value: totalStats.impressions > 1000 ? `${(totalStats.impressions/1000).toFixed(1)}K` : totalStats.impressions.toString(), icon: '👁', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
          { label: 'Conversions', value: totalStats.conversions.toString(), icon: '🎯', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Avg ROAS', value: `${avgRoas.toFixed(1)}x`, icon: '📈', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(stat => (
          <div key={stat.label} className="cc-panel" style={{ padding: '20px 24px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              marginBottom: '10px',
            }}>
              {stat.icon}
            </div>
            <p style={{
              fontSize: '20px',
              fontWeight: 600,
              color: stat.color,
              margin: '0 0 2px',
              lineHeight: 1,
            }}>
              {stat.value}
            </p>
            <p style={{
              fontSize: '12px',
              color: "var(--cc-text-secondary)",
              margin: 0,
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Campaigns */}
      <div style={{
        background: "var(--cc-surface)",
        border: '1px solid var(--cc-border)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--cc-border)',
          background: 'rgba(124,58,237,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: "var(--cc-text)",
            margin: 0,
          }}>
            🚀 Campaigns ({campaigns.length})
          </h2>
        </div>

        {campaigns.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: "var(--cc-text-secondary)",
            fontSize: '14px',
          }}>
            No campaigns yet. Create one above.
          </div>
        ) : (
          campaigns.map((campaign, i) => (
            <div
              key={campaign.id}
              className="hover:bg-[var(--cc-subtle)] transition-colors"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: i < campaigns.length - 1
                  ? '1px solid rgba(124,58,237,0.06)'
                  : 'none',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: campaign.platform === 'facebook'
                    ? 'rgba(59,89,152,0.15)'
                    : campaign.platform === 'instagram'
                    ? 'rgba(193,53,132,0.15)'
                    : 'rgba(124,58,237,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  {campaign.platform === 'facebook' ? '📘' : campaign.platform === 'instagram' ? '📸' : '💜'}
                </div>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: "var(--cc-text)",
                    margin: '0 0 2px',
                  }}>
                    {campaign.campaign_name}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: "var(--cc-text-secondary)",
                    margin: 0,
                    textTransform: 'capitalize',
                  }}>
                    {campaign.platform} · {campaign.objective}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className={
                  campaign.status === 'active'
                    ? 'cc-pill cc-pill-success'
                    : campaign.status === 'paused'
                    ? 'cc-pill cc-pill-warning'
                    : 'cc-pill cc-pill-error'
                }>
                  {campaign.status === 'active' ? '🟢 Active' : campaign.status === 'paused' ? '⏸ Paused' : campaign.status}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: "var(--cc-warning)",
                }}>
                  ₦{(campaign.budget_spent || 0).toLocaleString()}
                  <span style={{ fontSize: '11px', color: "var(--cc-text-muted)", fontWeight: 400 }}>
                    {' '}/ ₦{(campaign.budget_total || 0).toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Stats */}
      <div style={{
        background: "var(--cc-surface)",
        border: '1px solid var(--cc-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--cc-border)',
          background: 'rgba(124,58,237,0.04)',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: "var(--cc-text)",
            margin: 0,
          }}>
            📈 Recent Performance
          </h2>
        </div>

        {stats.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: "var(--cc-text-secondary)",
            fontSize: '14px',
          }}>
            No stats yet. Click &quot;Add Stats&quot; to enter data.
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 100px 80px 80px 80px 80px 80px 80px',
              gap: '12px',
              padding: '12px 24px',
              borderBottom: '1px solid rgba(124,58,237,0.06)',
              background: 'rgba(124,58,237,0.02)',
            }} className="admin-responsive-grid admin-grid-header">
              {['Date', 'Platform', 'Impressions', 'Reach', 'Clicks', 'Spend', 'Conv.', 'ROAS'].map(h => (
                <p key={h} style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: "var(--cc-text-muted)",
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </p>
              ))}
            </div>
            {stats.slice(0, 10).map((stat, i) => (
              <div
                key={stat.id}
                className="hover:bg-[var(--cc-subtle)] transition-colors admin-responsive-grid admin-grid-header"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 100px 80px 80px 80px 80px 80px 80px',
                  gap: '12px',
                  padding: '12px 24px',
                  borderBottom: i < 9 ? '1px solid rgba(124,58,237,0.04)' : 'none',
                  alignItems: 'center',
                }}
              >
                <p style={{
                  fontSize: '12px',
                  color: "var(--cc-text-secondary)",
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}>
                  {new Date(stat.stat_date).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: stat.platform === 'facebook' ? '#3b5998' : stat.platform === 'instagram' ? '#C13584' : '#a855f7',
                  background: stat.platform === 'facebook' ? 'rgba(59,89,152,0.1)' : stat.platform === 'instagram' ? 'rgba(193,53,132,0.1)' : 'rgba(168,85,247,0.1)',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  textTransform: 'capitalize',
                  display: 'inline-block',
                }}>
                  {stat.platform === 'facebook' ? '📘 FB' : stat.platform === 'instagram' ? '📸 IG' : '💜 Both'}
                </span>
                {[
                  stat.impressions?.toLocaleString(),
                  stat.reach?.toLocaleString(),
                  stat.clicks?.toLocaleString(),
                  `₦${(stat.spend || 0).toLocaleString()}`,
                  stat.conversions || '0',
                  `${(stat.roas || 0).toFixed(1)}x`,
                ].map((val, vi) => (
                  <p key={vi} style={{
                    fontSize: '12px',
                    fontWeight: vi === 3 ? 700 : 400,
                    color: vi === 3 ? '#f59e0b' : vi === 5 ? '#10b981' : 'var(--cc-text-secondary)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    {val}
                  </p>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </AdminPage>
  )
}