'use client'

import Link from 'next/link'

export default function FacebookAdsPricing() {
  // Use CSS variables for proper light/dark mode support
  const cardBg = 'var(--bg-card, var(--cyber-card, #ffffff))'
  const textColor = 'var(--text-primary, var(--cyber-heading, #1a1a1a))'
  const textSecondary = 'var(--text-secondary, var(--cyber-body, #6b5fa0))'
  const textMuted = 'var(--text-muted, #9d8fd4)'
  const plans = [
    {
      name: 'Flex Weekly',
      ngn: 42000,
      usd: 30,
      subtitle: 'Perfect for testing â€¢ Minimum 2 weeks',
      features: [
        'Full campaign setup & strategy for the week',
        '4â€“6 ad creatives',
        'Daily monitoring + optimization',
        'End-of-week performance report + recommendations',
        'Both Facebook & Instagram',
      ],
      color: '#6b7280',
      note: 'Can be upgraded to monthly anytime.',
    },
    {
      name: 'Starter',
      ngn: 150000,
      usd: 107,
      features: [
        'Campaign setup & strategy',
        '3â€“5 ad creatives per month',
        'Basic audience targeting',
        'Weekly optimization & reports',
        '1 platform (Facebook or Instagram)',
      ],
      color: '#3b82f6',
    },
    {
      name: 'Growth',
      badge: 'Most Popular',
      ngn: 250000,
      usd: 179,
      features: [
        'Everything in Starter',
        '8â€“10 ad creatives per month',
        'Advanced targeting, lookalikes & retargeting',
        'A/B testing',
        'Bi-weekly strategy calls',
        'Both Facebook & Instagram',
      ],
      color: '#8b5cf6',
    },
  ]

  return (
    <section style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: 'clamp(40px, 5vw, 80px) 16px',
    }}>
      {/* Section header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
      }}>
        <p style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#a855f7',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '12px',
        }}>
          Pricing Plans
        </p>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 900,
          color: textColor,
          margin: '0 0 16px',
          letterSpacing: '-0.5px',
        }}>
          Simple Transparent Pricing
        </h2>
        <p style={{
          fontSize: '16px',
          color: textSecondary,
          maxWidth: '460px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Starting from â‚¦42,000 / $30 per week.
          No hidden fees. No surprises.
        </p>
      </div>

      {/* 3 tier cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
      }}>
        {plans.map((tier, i) => (
          <div key={tier.name} style={{
            background: cardBg,
            border: `1px solid ${tier.color}30`,
            borderRadius: '20px',
            padding: '28px',
            transition: 'all 0.3s',
            position: 'relative',
            borderTop: tier.badge ? `3px solid ${tier.color}` : undefined,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.transform = 'translateY(-4px)'
            el.style.borderColor = tier.color
            el.style.boxShadow = `0 16px 48px ${tier.color}18`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.transform = 'translateY(0)'
            el.style.borderColor = `${tier.color}30`
            el.style.boxShadow = 'none'
          }}>

            {tier.badge && (
              <span style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: `linear-gradient(135deg, ${tier.color}, #a855f7)`,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '100px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {tier.badge}
              </span>
            )}

            {/* Plan number */}
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: tier.color,
              background: `${tier.color}12`,
              padding: '3px 10px',
              borderRadius: '100px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '16px',
            }}>
              Plan 0{i + 1}
            </span>

            {/* Name */}
            <h3 style={{
              fontSize: '20px',
              fontWeight: 900,
              color: textColor,
              margin: '0 0 8px',
            }}>
              {tier.name}
            </h3>

            {/* Price */}
            <p style={{
              fontSize: '32px',
              fontWeight: 900,
              color: tier.color,
              margin: '0 0 4px',
              lineHeight: 1,
            }}>
              â‚¦{tier.ngn.toLocaleString()}
            </p>
            <p style={{
              fontSize: '13px',
              color: textMuted,
              margin: '0 0 8px',
            }}>
              ~${tier.usd} USD{tier.name === 'Flex Weekly' ? ' / week' : ''}
            </p>
            {tier.subtitle && (
              <p style={{
                fontSize: '12px',
                color: tier.color,
                background: `${tier.color}08`,
                padding: '4px 10px',
                borderRadius: '6px',
                display: 'inline-block',
                marginBottom: '16px',
                fontWeight: 500,
              }}>
                {tier.subtitle}
              </p>
            )}

            {/* Divider */}
            <div style={{
              height: '1px',
              background: `${tier.color}20`,
              marginBottom: '16px',
            }}/>

            {/* Features */}
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 24px',
              display: 'grid',
              gap: '8px',
            }}>
              {tier.features.map(f => (
                <li key={f} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '13px',
                  color: textSecondary,
                  lineHeight: 1.4,
                }}>
                  <span style={{
                    color: tier.color,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}>
                    âœ“
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Note for Flex Weekly */}
            {tier.note && (
              <p style={{
                fontSize: '12px',
                color: tier.color,
                background: `${tier.color}08`,
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontWeight: 500,
                textAlign: 'center',
              }}>
                {tier.note}
              </p>
            )}

            {/* Button */}
            <Link
              href={`/contact?plan=${tier.name}&service=facebook-and-instagram-ads`}
              className={`fb-pricing-btn-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                borderRadius: '10px',
                border: `2px solid ${tier.color}40`,
                color: tier.color,
                fontWeight: 800,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                background: 'transparent',
              }}
            >
              Get Started â†’
            </Link>
            <style>{`
              .fb-pricing-btn-${i}:hover {
                background: ${tier.color} !important;
                color: #fff !important;
              }
            `}</style>
          </div>
        ))}
      </div>

      {/* See More Button */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '14px',
          color: textSecondary,
          marginBottom: '16px',
        }}>
          We have 5 more plans â€” Scale to Enterprise
        </p>
        <Link
          href="/services/facebook-and-instagram-ads/pricing"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            padding: '16px 40px',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '16px',
            boxShadow: '0 8px 28px rgba(124,58,237,0.3)',
            transition: 'all 0.2s',
          }}
        >
          See All 5 Plans â†’
        </Link>
      </div>
    </section>
  )
}

