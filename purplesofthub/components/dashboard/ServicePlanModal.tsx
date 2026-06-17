'use client'

import CheckoutModal from '@/app/services/_components/CheckoutModal'
import type { Service, ServicePlan } from '@/lib/payments/service-plans'
import { formatRegionalPrice } from '@/lib/pricing/currency'
import { useCurrency } from '@/context/CurrencyContext'
import { useState } from 'react'

interface ServicePlanModalProps {
  service: Service
  onClose: () => void
}

function getBillingLabel(plan: ServicePlan) {
  if (plan.billingType === 'monthly' && plan.delivery.toLowerCase().includes('week')) {
    return 'per week'
  }

  if (plan.billingType === 'monthly') return 'per month'
  if (plan.billingType === 'yearly') return 'per year'
  return 'one-time'
}

export default function ServicePlanModal({ service, onClose }: ServicePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const { currency } = useCurrency()

  const payablePlans = service.plans.filter(plan => !plan.isCustom && plan.priceNGN > 0)
  const customPlans = service.plans.filter(plan => plan.isCustom || plan.priceNGN <= 0)

  const handlePaymentSuccess = async (reference: string, method: 'paystack' | 'flutterwave') => {
    if (!selectedPlan) return

    try {
      const response = await fetch('/api/dashboard/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          planName: selectedPlan.name,
          amount: selectedPlan.priceNGN,
          deliveryTime: selectedPlan.delivery,
          paymentReference: reference,
          paymentMethod: method,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        console.error('Failed to create project:', data.error)
      }
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setShowSuccess(true)
      setSelectedPlan(null)
    }
  }

  if (showSuccess) {
    return (
      <div style={overlayStyle} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
        <div style={{ ...modalStyle, maxWidth: '480px', textAlign: 'center' }}>
          <div style={successIconStyle}>✓</div>
          <h2 style={titleStyle}>Payment Successful</h2>
          <p style={bodyTextStyle}>
            Your <strong style={{ color: '#a855f7' }}>{service.name}</strong> project has been created.
          </p>
          <p style={{ ...bodyTextStyle, fontSize: '13px', marginBottom: '28px' }}>
            You can track progress in My Projects.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/dashboard/projects" style={primaryLinkStyle}>View My Projects →</a>
            <button onClick={onClose} style={secondaryButtonStyle}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedPlan) {
    return (
      <CheckoutModal
        plan={selectedPlan.name}
        serviceId={service.id}
        serviceName={service.name}
        amount={selectedPlan.priceNGN}
        isLoggedIn={true}
        onSuccess={handlePaymentSuccess}
        onClose={() => setSelectedPlan(null)}
      />
    )
  }

  return (
    <div style={overlayStyle} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle} aria-label="Close service plans">
          ×
        </button>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={serviceIconStyle}>{service.icon}</div>
            <div>
              <h2 style={titleStyle}>{service.name}</h2>
              <span style={categoryPillStyle}>{service.category}</span>
            </div>
          </div>
          <p style={bodyTextStyle}>{service.description}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--cmd-heading)', margin: 0 }}>
            Choose Your Plan
          </h3>

          {payablePlans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              style={{
                ...planButtonStyle,
                border: plan.highlighted ? '2px solid #7c3aed' : planButtonStyle.border,
                background: plan.highlighted ? 'rgba(124,58,237,0.06)' : planButtonStyle.background,
              }}
            >
              {plan.badge && <span style={badgeStyle}>{plan.badge}</span>}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--cmd-heading)', margin: '0 0 4px' }}>
                    {plan.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--cmd-muted)', margin: 0 }}>
                    Delivery: {plan.delivery}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: '#a855f7', margin: '0 0 2px' }}>
                    {formatRegionalPrice(plan.priceNGN, plan.priceUSD, currency)}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--cmd-muted)', margin: 0 }}>
                    {getBillingLabel(plan)}
                  </p>
                </div>
              </div>
              <p style={{ ...bodyTextStyle, fontSize: '13px', margin: '12px 0 0', textAlign: 'left' }}>
                {plan.description}
              </p>
              <ul style={featureListStyle}>
                {plan.features.slice(0, 6).map(feature => (
                  <li key={feature} style={featureItemStyle}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {customPlans.length > 0 && (
          <div style={noteStyle}>
            <p style={{ fontSize: '13px', color: 'var(--cmd-heading)', fontWeight: 800, margin: '0 0 4px' }}>
              Need a custom plan?
            </p>
            <p style={{ fontSize: '12px', color: 'var(--cmd-body)', margin: 0, lineHeight: 1.5 }}>
              {customPlans.map(plan => plan.name).join(', ')} plans need a custom quote, so they are not sent to direct checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}

const modalStyle: React.CSSProperties = {
  background: 'var(--cmd-card)',
  border: '1px solid rgba(124,58,237,0.3)',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '680px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: 'clamp(24px, 4vw, 40px)',
  position: 'relative',
  boxShadow: '0 0 60px rgba(124,58,237,0.2)',
}

const closeButtonStyle: React.CSSProperties = {
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
}

const serviceIconStyle: React.CSSProperties = {
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
}

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 900,
  color: 'var(--cmd-heading)',
  margin: '0 0 6px',
}

const categoryPillStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#a855f7',
  background: 'rgba(124,58,237,0.1)',
  padding: '3px 10px',
  borderRadius: '100px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const bodyTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--cmd-body)',
  lineHeight: 1.6,
  margin: 0,
}

const planButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '20px',
  borderRadius: '16px',
  border: '1px solid rgba(124,58,237,0.15)',
  background: 'var(--cmd-card)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  position: 'relative',
  fontFamily: 'inherit',
}

const badgeStyle: React.CSSProperties = {
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
}

const featureListStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  listStyle: 'none',
  padding: 0,
  margin: '12px 0 0',
}

const featureItemStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--cmd-body)',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  background: 'rgba(124,58,237,0.06)',
  borderRadius: '6px',
}

const noteStyle: React.CSSProperties = {
  padding: '16px',
  background: 'rgba(34,211,238,0.06)',
  border: '1px solid rgba(34,211,238,0.2)',
  borderRadius: '12px',
}

const successIconStyle: React.CSSProperties = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: 'rgba(16,185,129,0.15)',
  border: '2px solid rgba(16,185,129,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '34px',
  color: '#10b981',
  margin: '0 auto 24px',
}

const primaryLinkStyle: React.CSSProperties = {
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
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '13px 28px',
  borderRadius: '12px',
  border: '1px solid rgba(124,58,237,0.2)',
  background: 'transparent',
  color: 'var(--cmd-body)',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
