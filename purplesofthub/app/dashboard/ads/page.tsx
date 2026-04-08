'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ClientAdsDashboard() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [platform, setPlatform] = useState<'all' | 'facebook' | 'instagram'>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, campaignsRes, statsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('ad_campaigns').select('*').eq('client_id', user.id).order('created_at', { ascending: false }),
      supabase.from('ad_stats').select('*').eq('client_id', user.id).order('stat_date', { ascending: false }).limit(60),
    ])

    setProfile(profileRes.data)
    setCampaigns(campaignsRes.data || [])
    setStats(statsRes.data || [])
    setLoading(false)
  }

  const filteredStats = stats.filter(s =>
    platform === 'all' || s.platform === platform || s.platform === 'both'
  )

  const totals = filteredStats.reduce(
    (acc, s) => ({
      spend: acc.spend + (s.spend || 0),
      reach: acc.reach + (s.reach || 0),
      clicks: acc.clicks + (s.clicks || 0),
      impressions: acc.impressions + (s.impressions || 0),
      conversions: acc.conversions + (s.conversions || 0),
    }),
    { spend: 0, reach: 0, clicks: 0, impressions: 0, conversions: 0 }
  )

  const avgCtr = totals.impressions > 0
    ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
    : '0.00'

  const avgRoas = filteredStats.length > 0
    ? (filteredStats.reduce((s, r) => s + (r.roas || 0), 0) / filteredStats.length).toFixed(1)
    : '0.0'

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: 'var(--cmd-heading)',
            margin: '0 0 4px',
          }}>
            Ads Performance 📊
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--cmd-body)',
            margin: 0,
          }}>
            {profile?.active_plan} Plan · Facebook & Instagram
          </p>
        </div>

        {/* Platform filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--cmd-card)',
          border: '1px solid var(--cmd-border)',
          borderRadius: '12px',
          padding: '4px',
        }}>
          {[
            { key: 'all', label: '💜 All' },
            { key: 'facebook', label: '📘 Facebook' },
            { key: 'instagram', label: '📸 Instagram' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPlatform(p.key as any)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                background: platform === p.key
                  ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                  : 'transparent',
                color: platform === p.key ? '#fff' : 'var(--cmd-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meta connection status */}
      <div style={{
        background: profile?.meta_connected
          ? 'rgba(16,185,129,0.08)'
          : 'rgba(245,158,11,0.08)',
        border: `1px solid ${
          profile?.meta_connected
            ? 'rgba(16,185,129,0.25)'
            : 'rgba(245,158,11,0.25)'
        }`,
        borderRadius: '14px',
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{profile?.meta_connected ? '✅' : '⚠️'}</span>
          <div>
            <p style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--cmd-heading)',
              margin: '0 0 2px',
            }}>
              {profile?.meta_connected
                ? 'Meta Account Connected'
                : 'Meta Account Not Connected'
              }
            </p>
            <p style={{
              fontSize: '12px',
              color: 'var(--cmd-body)',
              margin: 0,
            }}>
              {profile?.meta_connected
                ? 'Your Facebook & Instagram are linked. Data updates automatically.'
                : 'Connect your Meta account to enable automatic data syncing.'
              }
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/connect-meta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            borderRadius: '10px',
            background: profile?.meta_connected
              ? 'rgba(16,185,129,0.1)'
              : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: profile?.meta_connected
              ? '1px solid rgba(16,185,129,0.3)'
              : 'none',
            color: profile?.meta_connected ? '#10b981' : '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {profile?.meta_connected ? '⚙️ Manage Connection' : '🔗 Connect Meta Account'}
        </Link>
      </div>

      {/* Performance Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total Spend', value: `₦${totals.spend.toLocaleString()}`, icon: '💰', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'People Reached', value: totals.reach > 1000 ? `${(totals.reach/1000).toFixed(1)}K` : totals.reach.toString(), icon: '👥', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
          { label: 'Total Clicks', value: totals.clicks.toLocaleString(), icon: '👆', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
          { label: 'Impressions', value: totals.impressions > 1000 ? `${(totals.impressions/1000).toFixed(1)}K` : totals.impressions.toString(), icon: '👁', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
          { label: 'Click Rate (CTR)', value: `${avgCtr}%`, icon: '📊', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Return on Ads (ROAS)', value: `${avgRoas}x`, icon: '📈', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(stat => (
          <div key={stat.label} className="cmd-stat-card">
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
              fontSize: '22px',
              fontWeight: 900,
              color: stat.color,
              margin: '0 0 4px',
              lineHeight: 1,
            }}>
              {loading ? '...' : stat.value}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'var(--cmd-body)',
              margin: 0,
              lineHeight: 1.3,
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Active Campaigns */}
      <div style={{
        background: 'var(--cmd-card)',
        border: '1px solid var(--cmd-border)',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--cmd-border)',
          background: 'rgba(124,58,237,0.04)',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 800,
            color: 'var(--cmd-heading)',
            margin: 0,
          }}>
            🚀 Your Campaigns
          </h2>
        </div>

        {campaigns.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🚀</p>
            <p style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--cmd-heading)',
              margin: '0 0 6px',
            }}>
              No campaigns yet
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--cmd-body)',
              margin: '0 0 20px',
            }}>
              Your account manager will set up your campaigns shortly.
              You'll see live data here.
            </p>
            <a
              href="https://wa.me/2348167593393"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#25D366',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              💬 Chat with us on WhatsApp
            </a>
          </div>
        ) : (
          campaigns.map((campaign, i) => (
            <div
              key={campaign.id}
              className="cmd-table-row"
              style={{
                padding: '16px 24px',
                borderBottom: i < campaigns.length - 1
                  ? '1px solid rgba(124,58,237,0.06)'
                  : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: campaign.platform === 'facebook'
                    ? 'rgba(59,89,152,0.15)'
                    : campaign.platform === 'instagram'
                    ? 'rgba(193,53,132,0.15)'
                    : 'rgba(124,58,237,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                }}>
                  {campaign.platform === 'facebook' ? '📘' : campaign.platform === 'instagram' ? '📸' : '💜'}
                </div>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--cmd-heading)',
                    margin: '0 0 3px',
                  }}>
                    {campaign.campaign_name}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--cmd-body)',
                    margin: 0,
                    textTransform: 'capitalize',
                  }}>
                    {campaign.platform} Ads · {campaign.objective}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Budget bar */}
                <div style={{ width: '100px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--cmd-muted)' }}>Budget</span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#f59e0b',
                    }}>
                      {campaign.budget_total > 0
                        ? Math.round((campaign.budget_spent / campaign.budget_total) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div style={{
                    height: '4px',
                    background: 'rgba(124,58,237,0.1)',
                    borderRadius: '100px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: campaign.budget_total > 0
                        ? `${Math.min((campaign.budget_spent / campaign.budget_total) * 100, 100)}%`
                        : '0%',
                      background: 'linear-gradient(90deg, #7c3aed, #22d3ee)',
                      borderRadius: '100px',
                    }}/>
                  </div>
                </div>

                <span className={campaign.status === 'active' ? 'cmd-badge-active' : 'cmd-badge-pending'}>
                  {campaign.status === 'active' ? '🟢 Live' : campaign.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Stats Table */}
      {stats.length > 0 && (
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid var(--cmd-border)',
          borderRadius: '20px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--cmd-border)',
            background: 'rgba(124,58,237,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--cmd-heading)',
              margin: 0,
            }}>
              📅 Daily Performance
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--cmd-muted)' }}>Last 30 days</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'rgba(124,58,237,0.02)' }}>
                  {['Date', 'Platform', 'Reach', 'Clicks', 'Spend', 'ROAS'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--cmd-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      textAlign: 'left',
                      borderBottom: '1px solid rgba(124,58,237,0.06)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStats.slice(0, 14).map((stat, i) => (
                  <tr key={stat.id} className="cmd-table-row" style={{ borderBottom: '1px solid rgba(124,58,237,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--cmd-body)' }}>
                      {new Date(stat.stat_date).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: stat.platform === 'facebook' ? '#3b5998' : '#C13584',
                        background: stat.platform === 'facebook' ? 'rgba(59,89,152,0.1)' : 'rgba(193,53,132,0.1)',
                        padding: '2px 8px',
                        borderRadius: '100px',
                        textTransform: 'capitalize',
                      }}>
                        {stat.platform === 'facebook' ? '📘 Facebook' : '📸 Instagram'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--cmd-body)' }}>
                      {(stat.reach || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#7c3aed', fontWeight: 600 }}>
                      {(stat.clicks || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>
                      ₦{(stat.spend || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: (stat.roas || 0) >= 2 ? '#10b981' : '#f59e0b',
                      }}>
                        {(stat.roas || 0).toFixed(1)}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}