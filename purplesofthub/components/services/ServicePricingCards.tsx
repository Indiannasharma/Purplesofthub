'use client'

import { useState, useEffect } from 'react'
import type { Service, ServicePlan } from '@/lib/payments/service-plans'
import { formatPrice } from '@/lib/payments/service-plans'
import UniversalCheckoutModal from '@/components/checkout/UniversalCheckoutModal'

interface Props {
  service: Service
  showAll?: boolean
  previewCount?: number
}

export default function ServicePricingCards({
  service,
  showAll = true,
  previewCount = 3,
}: Props) {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null)
  const [showAllPlans, setShowAllPlans] = useState(showAll)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')

  // Check if user is logged in using the SSR-aware browser client
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Must use createBrowserClient (from @supabase/ssr) — it reads the
        // cookie-based session that Next.js middleware sets. The plain
        // @supabase/supabase-js createClient does NOT read cookies and will
        // always return null for the user even when signed in.
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setIsLoggedIn(true)
          setUserEmail(user.email || '')
          setUserName(user.user_metadata?.full_name || '')

          // Get phone + full_name from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone, full_name')
            .eq('id', user.id)
            .single()

          if (profile?.phone) setUserPhone(profile.phone)
          if (profile?.full_name) setUserName(profile.full_name)
        }
      } catch (err) {
        console.error('Session check error:', err)
      }
    }
    checkSession()
  }, [])

  const plans = showAllPlans ? service.plans : service.plans.slice(0, previewCount)
  const hasMore = service.plans.length > previewCount
  const getBillingLabel = (plan: ServicePlan) => {
    if (plan.billingType === 'monthly' && plan.delivery.toLowerCase().includes('week')) {
      return '· per week'
    }

    if (plan.billingType === 'monthly') {
      return '· per month'
    }

    if (plan.billingType === 'yearly') {
      return '· per year'
    }

    return '· one-time'
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '28px',
          marginBottom: hasMore && !showAllPlans ? '24px' : '32px',
        }}
      >
        {plans.map(plan => (
          <div
            key={plan.id}
            style={{
              background: plan.highlighted
                ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(34,211,238,0.05))'
                : 'var(--cyber-card, rgba(255,255,255,0.7))',
              border: plan.highlighted
                ? '2px solid rgba(124,58,237,0.4)'
                : '1px solid var(--cyber-border, rgba(124,58,237,0.15))',
              borderRadius: '20px',
              padding: '24px',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.highlighted
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: plan.highlighted ? '#fff' : '#a855f7',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 14px',
                  borderRadius: '100px',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.05em',
                }}
              >
                {plan.badge}
              </div>
            )}

            {/* Plan name */}
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--cyber-heading, #1a1a2e)',
                margin: '0 0 8px',
              }}
            >
              {plan.name}
            </h3>

            {/* Price */}
            <div style={{ marginBottom: '12px' }}>
              {plan.isCustom ? (
                <p
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: '#7c3aed',
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  Custom
                </p>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: '32px',
                      fontWeight: 900,
                      color: '#7c3aed',
                      margin: '0 0 2px',
                      lineHeight: 1,
                    }}
                  >
                    {formatPrice(plan.priceNGN)}
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--cyber-body, #4a3f6b)',
                      margin: 0,
                    }}
                  >
                    {formatPrice(plan.priceUSD, 'USD')} {getBillingLabel(plan)}
                  </p>
                </>
              )}
            </div>

            {/* Delivery */}
            <p
              style={{
                fontSize: '12px',
                color: '#a855f7',
                fontWeight: 600,
                margin: '0 0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ⏱️ {plan.delivery}
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: '13px',
                color: 'var(--cyber-body, #4a3f6b)',
                lineHeight: 1.6,
                margin: '0 0 16px',
              }}
            >
              {plan.description}
            </p>

            {/* Features */}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flex: 1,
              }}
            >
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--cyber-body, #4a3f6b)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: '#10b981',
                      flexShrink: 0,
                      marginTop: '1px',
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            {plan.isCustom ? (
              <a
                href={`https://wa.me/2348167593393?text=Hi! I'm interested in ${service.name} - ${plan.name} plan`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#7c3aed',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                💬 Contact Us
              </a>
            ) : (
              <button
                onClick={() => setSelectedPlan(plan)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: plan.highlighted
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : 'rgba(124,58,237,0.1)',
                  color: plan.highlighted ? '#fff' : '#7c3aed',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: plan.highlighted
                    ? '0 4px 16px rgba(124,58,237,0.35)'
                    : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {isLoggedIn ? '💳 Pay Now →' : 'Get Started →'}
              </button>
            )}

            {/* Logged in indicator */}
            {isLoggedIn && !plan.isCustom && (
              <p
                style={{
                  fontSize: '11px',
                  color: '#10b981',
                  textAlign: 'center',
                  margin: '8px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                ✅ Signed in — no account needed
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Show all plans button */}
      {hasMore && !showAllPlans && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setShowAllPlans(true)}
            style={{
              padding: '12px 32px',
              borderRadius: '12px',
              border: '1px solid rgba(124,58,237,0.3)',
              background: 'rgba(124,58,237,0.06)',
              color: '#7c3aed',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            See All {service.plans.length} Plans ↓
          </button>
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
    </>
  )
}
