'use client'

import { useState } from 'react'
import CheckoutModal from '@/app/services/_components/CheckoutModal'

interface Plan {
  name: string
  price: number
  deliveryTime: string
  features: string[]
  popular?: boolean
}

interface Service {
  id: string
  name: string
  description: string
  category: string
  delivery_time: string
  starting_price: number
  icon?: string
}

interface ServicePlanModalProps {
  service: Service
  onClose: () => void
}

const SERVICE_PLANS: Record<string, Plan[]> = {
  'meta-ads': [
    {
      name: 'Flex Weekly',
      price: 25000,
      deliveryTime: 'Weekly',
      features: ['Weekly ad management', 'Flexible budget', 'Creative updates', 'Basic analytics'],
    },
    {
      name: 'Starter',
      price: 50000,
      deliveryTime: 'Monthly',
      features: ['2 ad campaigns', 'Basic targeting', 'Weekly reports', 'Email support'],
    },
    {
      name: 'Growth',
      price: 100000,
      deliveryTime: 'Monthly',
      features: ['5 ad campaigns', 'Advanced targeting', 'Daily optimization', 'Priority support', 'A/B testing'],
      popular: true,
    },
    {
      name: 'Scale',
      price: 200000,
      deliveryTime: 'Monthly',
      features: ['Unlimited campaigns', 'Lookalike audiences', 'Conversion tracking', '24/7 support', 'Custom creatives'],
    },
    {
      name: 'Enterprise',
      price: 400000,
      deliveryTime: 'Monthly',
      features: ['Full service management', 'Dedicated account manager', 'Custom reporting', 'Multi-platform integration'],
    },
  ],
  'web-dev': [
    {
      name: 'Basic Website',
      price: 150000,
      deliveryTime: '2-3 weeks',
      features: ['Up to 5 pages', 'Responsive design', 'Contact form', 'Basic SEO'],
    },
    {
      name: 'Business Site',
      price: 250000,
      deliveryTime: '3-4 weeks',
      features: ['Up to 10 pages', 'CMS integration', 'Advanced animations', 'SEO optimization', 'Analytics setup'],
      popular: true,
    },
    {
      name: 'E-commerce',
      price: 400000,
      deliveryTime: '4-6 weeks',
      features: ['Full online store', 'Payment integration', 'Inventory management', 'Admin dashboard', 'Mobile app ready'],
    },
    {
      name: 'SaaS Platform',
      price: 600000,
      deliveryTime: '6-8 weeks',
      features: ['Custom web application', 'User authentication', 'Database design', 'API development', '3 months support'],
    },
  ],
  'mobile-app': [
    {
      name: 'Basic App',
      price: 250000,
      deliveryTime: '4-5 weeks',
      features: ['Single platform', 'Basic UI/UX', 'Core features', 'App store deployment'],
    },
    {
      name: 'Standard App',
      price: 400000,
      deliveryTime: '6-7 weeks',
      features: ['Cross-platform', 'Custom design', 'API integration', 'Push notifications', 'Analytics'],
      popular: true,
    },
    {
      name: 'Advanced App',
      price: 600000,
      deliveryTime: '8-10 weeks',
      features: ['Complex features', 'Backend development', 'Real-time updates', 'Payment integration', '6 months support'],
    },
  ],
  'social-media-mgmt': [
    {
      name: 'Starter',
      price: 75000,
      deliveryTime: 'Monthly',
      features: ['3 posts/week', 'Basic graphics', 'Hashtag research', 'Monthly report'],
    },
    {
      name: 'Growth',
      price: 150000,
      deliveryTime: 'Monthly',
      features: ['Daily posts', 'Custom graphics', 'Community management', 'Weekly reports', 'Story content'],
      popular: true,
    },
    {
      name: 'Premium',
      price: 250000,
      deliveryTime: 'Monthly',
      features: ['Multiple daily posts', 'Video content', 'Influencer collaboration', 'Daily engagement', 'Strategy calls'],
    },
  ],
  'music-promotion': [
    {
      name: 'Basic',
      price: 30000,
      deliveryTime: '2 weeks',
      features: ['TikTok promotion', 'Instagram reels', 'Basic analytics', 'Hashtag strategy'],
    },
    {
      name: 'Standard',
      price: 60000,
      deliveryTime: '3 weeks',
      features: ['Multi-platform', 'Influencer outreach', 'Playlist pitching', 'Detailed analytics'],
      popular: true,
    },
    {
      name: 'Premium',
      price: 100000,
      deliveryTime: '4 weeks',
      features: ['Full campaign', 'Music video promotion', 'PR outreach', 'Radio promotion', 'Chart tracking'],
    },
  ],
  'music-distribution': [
    {
      name: 'Single',
      price: 15000,
      deliveryTime: '1 week',
      features: ['150+ platforms', 'Spotify & Apple Music', 'Basic analytics', 'Keep 100% royalties'],
    },
    {
      name: 'EP (3-6 tracks)',
      price: 40000,
      deliveryTime: '1-2 weeks',
      features: ['All platforms', 'Pre-save campaigns', 'Detailed analytics', 'Promotional tools'],
      popular: true,
    },
    {
      name: 'Album (7+ tracks)',
      price: 75000,
      deliveryTime: '2 weeks',
      features: ['Global distribution', 'Marketing support', 'Playlist pitching', 'Release strategy', 'Priority support'],
    },
  ],
  'account-recovery': [
    {
      name: 'Basic Recovery',
      price: 50000,
      deliveryTime: '1-2 weeks',
      features: ['Account assessment', 'Appeal letter', 'Document preparation', 'Email support'],
    },
    {
      name: 'Standard Recovery',
      price: 100000,
      deliveryTime: '2-3 weeks',
      features: ['Full case management', 'Legal documentation', 'Direct platform contact', 'Progress updates'],
      popular: true,
    },
    {
      name: 'Premium Recovery',
      price: 200000,
      deliveryTime: '3-4 weeks',
      features: ['Priority handling', 'Legal team support', 'Guaranteed results*', '24/7 support', 'Prevention consulting'],
    },
  ],
  'ui-ux-design': [
    {
      name: 'Landing Page',
      price: 100000,
      deliveryTime: '1-2 weeks',
      features: ['Custom design', 'Responsive layout', 'Prototype', 'Design system'],
    },
    {
      name: 'Web App Design',
      price: 200000,
      deliveryTime: '2-3 weeks',
      features: ['Full UX research', 'Wireframes', 'High-fidelity mockups', 'Interactive prototype', 'Developer handoff'],
      popular: true,
    },
    {
      name: 'Complete Product',
      price: 350000,
      deliveryTime: '4-6 weeks',
      features: ['End-to-end design', 'User testing', 'Design system', 'Multiple revisions', 'Ongoing support'],
    },
  ],
  'seo': [
    {
      name: 'Basic SEO',
      price: 40000,
      deliveryTime: 'Monthly',
      features: ['Keyword research', 'On-page optimization', 'Basic link building', 'Monthly report'],
    },
    {
      name: 'Growth SEO',
      price: 80000,
      deliveryTime: 'Monthly',
      features: ['Content strategy', 'Technical SEO', 'Quality backlinks', 'Competitor analysis', 'Weekly updates'],
      popular: true,
    },
    {
      name: 'Enterprise SEO',
      price: 150000,
      deliveryTime: 'Monthly',
      features: ['Full SEO audit', 'Content creation', 'Link building campaign', 'Local SEO', 'Conversion optimization'],
    },
  ],
}

const DEFAULT_PLANS: Plan[] = [
  {
    name: 'Basic',
    price: 50000,
    deliveryTime: '2-3 weeks',
    features: ['Basic service delivery', 'Email support', 'Standard timeline'],
  },
  {
    name: 'Standard',
    price: 100000,
    deliveryTime: '3-4 weeks',
    features: ['Enhanced service', 'Priority support', 'Faster delivery', 'Revisions included'],
    popular: true,
  },
  {
    name: 'Premium',
    price: 200000,
    deliveryTime: '4-6 weeks',
    features: ['Full service package', '24/7 support', 'Rush delivery', 'Unlimited revisions', 'Extended support'],
  },
]

export default function ServicePlanModal({ service, onClose }: ServicePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const plans = SERVICE_PLANS[service.id] || DEFAULT_PLANS

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`
    }
    if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`
    }
    return `₦${price.toLocaleString()}`
  }

  const handleProceedToPayment = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowCheckout(true)
  }

  const handlePaymentSuccess = async (reference: string, method: 'paystack' | 'flutterwave') => {
    try {
      // Create project in database
      const response = await fetch('/api/dashboard/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          planName: selectedPlan?.name,
          amount: selectedPlan?.price,
          deliveryTime: selectedPlan?.deliveryTime,
          paymentReference: reference,
          paymentMethod: method,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowSuccess(true)
        setShowCheckout(false)
      } else {
        console.error('Failed to create project:', data.error)
        // Still show success as payment was successful
        setShowSuccess(true)
        setShowCheckout(false)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      // Still show success as payment was successful
      setShowSuccess(true)
      setShowCheckout(false)
    }
  }

  if (showSuccess) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={e => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          style={{
            background: 'var(--cmd-card)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            padding: '40px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 0 60px rgba(124,58,237,0.2)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              border: '2px solid rgba(16,185,129,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '0 auto 24px',
              boxShadow: '0 0 30px rgba(16,185,129,0.2)',
            }}
          >
            🎉
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 900,
              color: 'var(--cmd-heading)',
              margin: '0 0 12px',
            }}
          >
            Payment Successful!
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--cmd-body)',
              lineHeight: 1.6,
              margin: '0 0 8px',
            }}
          >
            Your <strong style={{ color: '#a855f7' }}>{service.name}</strong> project has been created.
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--cmd-body)',
              margin: '0 0 28px',
            }}
          >
            You can track progress in <strong>My Projects</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a
              href="/dashboard/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                padding: '13px 28px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '15px',
                boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              }}
            >
              View My Projects →
            </a>
            <button
              onClick={onClose}
              style={{
                padding: '13px 28px',
                borderRadius: '12px',
                border: '1px solid rgba(124,58,237,0.2)',
                background: 'transparent',
                color: 'var(--cmd-body)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showCheckout && selectedPlan) {
    return (
      <CheckoutModal
        plan={selectedPlan.name}
        serviceId={service.id}
        serviceName={service.name}
        amount={selectedPlan.price}
        onSuccess={handlePaymentSuccess}
        onClose={() => {
          setShowCheckout(false)
          setSelectedPlan(null)
        }}
      />
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'clamp(24px, 4vw, 40px)',
          position: 'relative',
          boxShadow: '0 0 60px rgba(124,58,237,0.2)',
        }}
      >
        {/* Corner decorations */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '32px',
            height: '32px',
            borderTop: '2px solid #7c3aed',
            borderLeft: '2px solid #7c3aed',
            borderRadius: '24px 0 0 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '32px',
            height: '32px',
            borderBottom: '2px solid #22d3ee',
            borderRight: '2px solid #22d3ee',
            borderRadius: '0 0 24px 0',
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid rgba(124,58,237,0.2)',
            background: 'rgba(124,58,237,0.08)',
            color: 'var(--cmd-body)',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit',
          }}
        >
          ×
        </button>

        {/* Service Header */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 0 12px rgba(124,58,237,0.1)',
              }}
            >
              {service.icon}
            </div>
            <div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: 'var(--cmd-heading)',
                  margin: '0 0 4px',
                }}
              >
                {service.name}
              </h2>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#a855f7',
                  background: 'rgba(124,58,237,0.1)',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {service.category}
              </span>
            </div>
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--cmd-body)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {service.description}
          </p>
        </div>

        {/* Plans Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--cmd-heading)',
              margin: '0 0 4px',
            }}
          >
            Choose Your Plan
          </h3>

          {plans.map((plan, index) => (
            <div
              key={plan.name}
              onClick={() => handleProceedToPayment(plan)}
              style={{
                padding: '20px',
                borderRadius: '16px',
                border: plan.popular
                  ? '2px solid #7c3aed'
                  : '1px solid rgba(124,58,237,0.15)',
                background: plan.popular
                  ? 'rgba(124,58,237,0.04)'
                  : 'var(--cmd-card)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.15)'
                if (!plan.popular) {
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                if (!plan.popular) {
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)'
                }
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '20px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '0 0 8px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Most Popular
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: 'var(--cmd-heading)',
                      margin: '0 0 4px',
                    }}
                  >
                    {plan.name}
                  </h4>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--cmd-muted)',
                      margin: 0,
                    }}
                  >
                    Delivery: {plan.deliveryTime}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      fontSize: '22px',
                      fontWeight: 900,
                      color: '#a855f7',
                      margin: '0 0 2px',
                    }}
                  >
                    {formatPrice(plan.price)}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--cmd-muted)',
                      margin: 0,
                    }}
                  >
                    one-time
                  </p>
                </div>
              </div>

              <ul
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  listStyle: 'none',
                  padding: 0,
                  margin: '12px 0 0',
                }}
              >
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '12px',
                      color: 'var(--cmd-body)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      background: 'rgba(124,58,237,0.06)',
                      borderRadius: '6px',
                    }}
                  >
                    <span style={{ color: '#10b981' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div
          style={{
            padding: '16px',
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: '12px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '18px' }}>💡</span>
          <div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--cmd-heading)',
                fontWeight: 600,
                margin: '0 0 4px',
              }}
            >
              Need a custom plan?
            </p>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--cmd-body)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Contact our sales team for enterprise solutions or custom requirements tailored to your specific needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}