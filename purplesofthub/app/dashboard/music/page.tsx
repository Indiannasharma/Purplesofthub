'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { getServiceBySlug } from '@/lib/payments/service-plans'
import type { ServicePlan } from '@/lib/payments/service-plans'
import UniversalCheckoutModal from '@/components/checkout/UniversalCheckoutModal'
import MusicSubmitForm from '@/components/dashboard/MusicSubmitForm'

interface MusicCampaign {
  id: string
  track_title: string
  artist_name: string
  platforms: string[]
  status: string
  created_at: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(234,179,8,0.12)',  color: '#ca8a04' },
  active:    { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  completed: { bg: 'rgba(124,58,237,0.12)', color: '#a855f7' },
  rejected:  { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
}

const PLAN_ICONS: Record<string, string> = {
  'music-starter':    '🎵',
  'music-viral':      '🚀',
  'music-platinum':   '💎',
  'music-legend':     '👑',
}

function formatPrice(price: number) {
  return price >= 1000 ? `₦${(price / 1000).toFixed(0)}K` : `₦${price.toLocaleString()}`
}

export default function ClientMusicPage() {
  const [campaigns, setCampaigns]         = useState<MusicCampaign[]>([])
  const [loading, setLoading]             = useState(true)
  const [user, setUser]                   = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn]       = useState(false)
  const [userEmail, setUserEmail]         = useState('')
  const [userName, setUserName]           = useState('')
  const [userPhone, setUserPhone]         = useState('')
  const [selectedPlan, setSelectedPlan]   = useState<ServicePlan | null>(null)
  const [submitFormOpen, setSubmitFormOpen] = useState(false)

  const service = getServiceBySlug('music-promotion')

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        setLoading(false)
        return
      }

      setUser(authUser)
      setIsLoggedIn(true)
      setUserEmail(authUser.email || '')
      setUserName(authUser.user_metadata?.full_name || '')

      // Pull phone + name from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', authUser.id)
        .single()

      if (profile?.phone)     setUserPhone(profile.phone)
      if (profile?.full_name) setUserName(profile.full_name)

      const { data: campaignsData } = await supabase
        .from('music_campaigns')
        .select('*')
        .eq('client_id', authUser.id)
        .order('created_at', { ascending: false })

      setCampaigns(campaignsData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const handleFormSuccess = () => {
    setSubmitFormOpen(false)
    const reload = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('music_campaigns')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      setCampaigns(data || [])
    }
    reload()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: '3px solid rgba(124,58,237,0.2)',
            borderTop: '3px solid #7c3aed',
            margin: '0 auto 12px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ fontSize: '13px', color: 'var(--cmd-muted)' }}>Loading your music campaigns...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!service) return <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cmd-muted)' }}>Service not found</div>

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--cmd-heading)', margin: '0 0 4px' }}>
          🎵 Music Promotion
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--cmd-body)', margin: 0 }}>
          Get your music heard worldwide
        </p>
      </div>

      {/* ── Plan Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '40px',
      }}>
        {service.plans.filter(p => !p.isCustom).map(plan => (
          <div
            key={plan.id}
            style={{
              background: 'var(--cmd-card)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Gradient top border */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, #7c3aed, #a855f7, #22d3ee)',
            }} />

            {/* Icon */}
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', marginBottom: '16px',
              boxShadow: '0 0 12px rgba(124,58,237,0.1)',
            }}>
              {PLAN_ICONS[plan.id] || '🎵'}
            </div>

            {/* Category badge */}
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '100px',
              fontSize: '10px', fontWeight: 700,
              background: 'rgba(124,58,237,0.1)', color: '#a855f7',
              border: '1px solid rgba(124,58,237,0.2)',
              marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              MUSIC
            </span>

            {/* Plan name */}
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--cmd-heading)', margin: '0 0 8px' }}>
              {plan.name}
            </h3>

            {/* Description */}
            <p style={{ fontSize: '13px', color: 'var(--cmd-body)', lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>
              {plan.description}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '12px', color: 'var(--cmd-muted)', flexWrap: 'wrap' }}>
              <span>⏱️ {plan.delivery}</span>
              <span style={{ fontWeight: 700, color: '#a855f7' }}>
                From {formatPrice(plan.priceNGN)}
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setSelectedPlan(plan)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.5)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {isLoggedIn ? '💳 Pay Now →' : 'Get Started →'}
            </button>

            {/* Logged-in indicator */}
            {isLoggedIn && (
              <p style={{
                fontSize: '11px', color: '#10b981', textAlign: 'center',
                margin: '8px 0 0', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '4px',
              }}>
                ✅ Signed in — no account needed
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── My Campaigns ── */}
      {campaigns.length > 0 && (
        <>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cmd-heading)', margin: '0 0 16px' }}>
            My Campaigns
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {campaigns.map(campaign => {
              const s = STATUS_STYLES[campaign.status] || STATUS_STYLES.pending
              return (
                <div
                  key={campaign.id}
                  style={{
                    background: 'var(--cmd-card)',
                    border: '1px solid rgba(124,58,237,0.12)',
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 4px' }}>
                      {campaign.track_title}
                    </h5>
                    <p style={{ fontSize: '13px', color: 'var(--cmd-muted)', margin: '0 0 10px' }}>
                      {campaign.artist_name}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {campaign.platforms?.slice(0, 4).map(p => (
                        <span key={p} style={{
                          fontSize: '11px', padding: '2px 10px', borderRadius: '100px',
                          background: 'rgba(124,58,237,0.1)', color: '#a855f7',
                          border: '1px solid rgba(124,58,237,0.2)',
                        }}>
                          {p}
                        </span>
                      ))}
                      {campaign.platforms?.length > 4 && (
                        <span style={{ fontSize: '11px', color: 'var(--cmd-muted)' }}>
                          +{campaign.platforms.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '4px 12px',
                      borderRadius: '100px', background: s.bg, color: s.color,
                      textTransform: 'capitalize',
                    }}>
                      {campaign.status}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--cmd-muted)', margin: '8px 0 0' }}>
                      {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {campaigns.length === 0 && (
        <div style={{
          marginTop: '8px', borderRadius: '14px', border: '1px dashed rgba(124,58,237,0.2)',
          background: 'rgba(124,58,237,0.03)', padding: '32px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: 'var(--cmd-muted)', margin: 0 }}>
            No music campaigns yet. Pick a plan above to get started! 🎵
          </p>
        </div>
      )}

      {/* Checkout Modal */}
      {selectedPlan && (
        <UniversalCheckoutModal
          service={service}
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          userName={userName}
          userPhone={userPhone}
        />
      )}

      {/* Music Submit Form */}
      {submitFormOpen && (
        <MusicSubmitForm
          planName="Music Promotion"
          planPrice={30000}
          planType="promotion"
          onSuccess={handleFormSuccess}
          onClose={() => setSubmitFormOpen(false)}
        />
      )}
    </div>
  )
}
