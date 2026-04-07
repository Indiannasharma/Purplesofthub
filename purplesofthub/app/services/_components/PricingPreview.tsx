'use client'

import Link from 'next/link'

export default function PricingPreview() {
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
          color: 'var(--text-primary, var(--cyber-heading, #1a1a1a))',
          margin: '0 0 16px',
          letterSpacing: '-0.5px',
        }}>
          Simple Transparent Pricing
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary, var(--cyber-body, #6b5fa0))',
          maxWidth: '460px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Starting from ₦450,000 / $300.
          No hidden fees. No surprises.
        </p>
      </div>

      {/* First 3 tier cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
      }}>
        {[
          {
            name: 'Starter',
            ngn: '₦450,000',
            usd: '$300',
            color: '#6b7280',
            bg: 'rgba(107,114,128,0.08)',
            border: 'rgba(107,114,128,0.2)',
            delivery: '2 weeks',
            support: '2 weeks',
            features: [
              '1–3 pages',
              'Mobile responsive design',
              'Contact form',
              'Basic SEO setup',
              'Social media links',
              'WhatsApp chat button',
              'Free domain connection',
              'SSL Certificate',
            ],
          },
          {
            name: 'Essential',
            ngn: '₦750,000',
            usd: '$500',
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.08)',
            border: 'rgba(59,130,246,0.2)',
            delivery: '3 weeks',
            support: '1 month',
            features: [
              'Up to 5 pages',
              'Mobile responsive design',
              'Contact form + Newsletter',
              'Basic SEO setup',
              'Social media integration',
              'WhatsApp chat button',
              'Free domain + SSL',
              'Google Analytics setup',
              'Basic speed optimisation',
            ],
          },
          {
            name: 'Professional',
            ngn: '₦975,000',
            usd: '$650',
            color: '#8b5cf6',
            bg: 'rgba(139,92,246,0.08)',
            border: 'rgba(139,92,246,0.2)',
            delivery: '4 weeks',
            support: '2 months',
            features: [
              'Up to 8 pages',
              'Premium UI/UX design',
              'Contact form + Newsletter',
              'Advanced SEO setup',
              'Blog section',
              'Social media integration',
              'WhatsApp + Live chat',
              'Free domain + SSL',
              'Google Analytics setup',
              'Speed optimisation',
            ],
          },
        ].map((tier, i) => (
          <div key={tier.name} style={{
            background: 'var(--card, #ffffff)',
            border: `1px solid ${tier.border}`,
            borderRadius: '20px',
            padding: '28px',
            transition: 'all 0.3s',
            position: 'relative',
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
            el.style.borderColor = tier.border
            el.style.boxShadow = 'none'
          }}>

            {/* Plan number */}
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: tier.color,
              background: tier.bg,
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
              color: 'var(--text-primary, var(--cyber-heading, #1a1a1a))',
              margin: '0 0 12px',
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
              {tier.ngn}
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary, var(--cyber-body, #9d8fd4))',
              margin: '0 0 20px',
            }}>
              {tier.usd} USD · {tier.delivery} delivery
            </p>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: tier.border,
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
                  color: 'var(--text-secondary, var(--cyber-body, #555555))',
                  lineHeight: 1.4,
                }}>
                  <span style={{
                    color: tier.color,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Support */}
            <div style={{
              fontSize: '12px',
              color: tier.color,
              background: tier.bg,
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontWeight: 600,
            }}>
              🛡️ {tier.support} support
            </div>

            {/* Button */}
            <Link
              href={`/contact?plan=${tier.name}`}
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
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = tier.color
                el.style.color = '#fff'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = 'transparent'
                el.style.color = tier.color
              }}
            >
              Get Started →
            </Link>
          </div>
        ))}
      </div>

      {/* See More Button */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary, var(--cyber-body, #9d8fd4))',
          marginBottom: '16px',
        }}>
          We have 6 more plans — Advanced to Diamond
        </p>
        <Link
          href="/services/web-development/pricing"
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
          See All 9 Plans →
        </Link>
      </div>
    </section>
  )
}
