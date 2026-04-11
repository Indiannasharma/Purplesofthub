'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Service, ServicePlan } from '@/lib/payments/service-plans'
import { formatPrice } from '@/lib/payments/service-plans'

interface Props {
  service: Service
  plan: ServicePlan
  onClose: () => void
  userEmail?: string
  userName?: string
  userPhone?: string
  isLoggedIn?: boolean
}

type Step = 'details' | 'payment' | 'processing' | 'success'

export default function UniversalCheckoutModal({
  service,
  plan,
  onClose,
  userEmail = '',
  userName = '',
  userPhone = '',
  isLoggedIn = false,
}: Props) {
  const [step, setStep] = useState<Step>(isLoggedIn ? 'payment' : 'details')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: userName.split(' ')[0] || '',
    lastName: userName.split(' ').slice(1).join(' ') || '',
    email: userEmail,
    phone: userPhone,
    businessName: '',
    password: '',
  })

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!form.firstName.trim()) {
      setError('First name required')
      return false
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Valid email required')
      return false
    }
    if (!form.phone.trim()) {
      setError('Phone number required')
      return false
    }
    if (!isLoggedIn && form.password.length < 8) {
      setError('Password must be 8+ characters')
      return false
    }
    setError('')
    return true
  }

  const handlePaystack = () => {
    if (!validate()) return
    setStep('processing')

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: form.email,
      amount: plan.priceNGN * 100,
      currency: 'NGN',
      ref: `PSW-${service.id.toUpperCase()}-${plan.id.toUpperCase()}-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Service', variable_name: 'service', value: service.name },
          { display_name: 'Plan', variable_name: 'plan', value: plan.name },
          {
            display_name: 'Client Name',
            variable_name: 'name',
            value: `${form.firstName} ${form.lastName}`.trim(),
          },
        ],
      },
      callback: async (response: any) => {
        await processPayment(response.reference, 'paystack')
      },
      onClose: () => setStep('payment'),
    })
    handler.openIframe()
  }

  const handleFlutterwave = () => {
    if (!validate()) return
    setStep('processing')

    const config = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: `PSW-${service.id.toUpperCase()}-${Date.now()}`,
      amount: plan.priceNGN,
      currency: 'NGN',
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: form.email,
        phone_number: form.phone,
        name: `${form.firstName} ${form.lastName}`.trim(),
      },
      customizations: {
        title: `PurpleSoftHub — ${plan.name}`,
        description: `${service.name} — ${plan.name} Plan`,
        logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
      },
      callback: async (response: any) => {
        if (response.status === 'successful') {
          await processPayment(String(response.transaction_id), 'flutterwave')
        }
      },
      onclose: () => setStep('payment'),
    }

    const flw = new (window as any).FlutterwaveCheckout(config)
    flw.open()
  }

  const processPayment = async (reference: string, method: 'paystack' | 'flutterwave') => {
    setStep('processing')
    try {
      const res = await fetch('/api/checkout/universal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          businessName: form.businessName,
          password: form.password,
          serviceId: service.id,
          serviceName: service.name,
          planId: plan.id,
          planName: plan.name,
          amount: plan.priceNGN,
          billingType: plan.billingType,
          paymentReference: reference,
          paymentMethod: method,
          isLoggedIn,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('success')
      } else {
        setError(data.error || 'Something went wrong')
        setStep('payment')
      }
    } catch {
      setError('Network error. Please try again.')
      setStep('payment')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
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
          background: 'var(--cyber-bg, #f0ebff)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'clamp(24px, 4vw, 40px)',
          position: 'relative',
          boxShadow: '0 0 60px rgba(124,58,237,0.2)',
        }}
      >
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
            color: 'var(--cyber-body, #4a3f6b)',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Plan badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '100px',
            padding: '5px 14px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#a855f7',
              boxShadow: '0 0 8px #a855f7',
              display: 'inline-block',
              animation: 'pulse 1.8s infinite',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#a855f7',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              whiteSpace: 'nowrap',
            }}
          >
            {service.name} — {plan.name} — {formatPrice(plan.priceNGN)}
            {plan.billingType === 'monthly'
              ? '/mo'
              : plan.billingType === 'yearly'
              ? '/yr'
              : ''}
          </span>
        </div>

        {/* SUCCESS */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
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
                color: 'var(--cyber-heading, #1a1a2e)',
                margin: '0 0 12px',
              }}
            >
              Payment Successful!
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--cyber-body, #4a3f6b)',
                lineHeight: 1.6,
                margin: '0 0 8px',
              }}
            >
              Your <strong style={{ color: '#a855f7' }}>{plan.name}</strong> plan for{' '}
              <strong style={{ color: '#7c3aed' }}>{service.name}</strong> is now active.
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--cyber-body, #4a3f6b)',
                margin: '0 0 24px',
              }}
            >
              Our team will reach out within 24 hours to get started.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '14px',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                }}
              >
                Go to Dashboard →
              </Link>
              <a
                href={`https://wa.me/2348167593393?text=Hi! I just paid for ${service.name} ${plan.name} plan`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#25D366',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid rgba(124,58,237,0.2)',
                borderTop: '3px solid #7c3aed',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--cyber-heading, #1a1a2e)',
                margin: '0 0 8px',
              }}
            >
              Setting up your account...
            </p>
            <p style={{ fontSize: '13px', color: 'var(--cyber-body, #4a3f6b)', margin: 0 }}>
              Please don't close this window
            </p>
          </div>
        )}

        {/* DETAILS FORM */}
        {step === 'details' && (
          <>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 6px' }}>
              Create Your Account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--cyber-body, #4a3f6b)', margin: '0 0 24px' }}>
              Fill in your details to get started
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#ef4444',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="First Name *" style={{ padding: '11px 16px', borderRadius: '10px', border: '1.5px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.06)', outline: 'none', fontFamily: 'inherit' }} />
                <input type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Last Name" style={{ padding: '11px 16px', borderRadius: '10px', border: '1.5px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.06)', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email Address *" style={{ padding: '11px 16px', borderRadius: '10px', border: '1.5px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.06)', outline: 'none', fontFamily: 'inherit', width: '100%' }} />
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Phone Number *" style={{ padding: '11px 16px', borderRadius: '10px', border: '1.5px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.06)', outline: 'none', fontFamily: 'inherit', width: '100%' }} />
              <input type="text" value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Business Name (optional)" style={{ padding: '11px 16px', borderRadius: '10px', border: '1.5px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.06)', outline: 'none', fontFamily: 'inherit', width: '100%' }} />
              <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Create Password (min 8 chars) *" style={{ padding: '11px 16px', borderRadius: '10px', border: '1.5px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.06)', outline: 'none', fontFamily: 'inherit', width: '100%' }} />
              <button
                onClick={() => {
                  if (validate()) setStep('payment')
                }}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                  marginTop: '4px',
                }}
              >
                Continue to Payment →
              </button>
              <p style={{ fontSize: '12px', color: 'var(--cyber-body, #4a3f6b)', textAlign: 'center', margin: 0 }}>
                Already have an account?{' '}
                <a href="/sign-in" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </a>
              </p>
            </div>
          </>
        )}

        {/* PAYMENT STEP */}
        {step === 'payment' && (
          <>
            {!isLoggedIn && (
              <button
                onClick={() => setStep('details')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cyber-body, #4a3f6b)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  fontFamily: 'inherit',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ← Back
              </button>
            )}

            <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 6px' }}>
              Choose Payment Method
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--cyber-body, #4a3f6b)', margin: '0 0 24px' }}>
              Secure payment for <strong style={{ color: '#a855f7' }}>{service.name}</strong>
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#ef4444',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Price summary */}
            <div
              style={{
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ fontSize: '13px', color: 'var(--cyber-body, #4a3f6b)', margin: '0 0 2px' }}>{service.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--cyber-body, #4a3f6b)', margin: 0, opacity: 0.7 }}>
                  {plan.name} Plan · {plan.billingType === 'monthly' ? 'Monthly' : plan.billingType === 'yearly' ? 'Yearly' : 'One-time'}
                </p>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed', margin: 0 }}>{formatPrice(plan.priceNGN)}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Paystack */}
              <button
                onClick={handlePaystack}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: '2px solid rgba(0,192,120,0.3)',
                  background: 'rgba(0,192,120,0.06)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#00C078', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    💳
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 2px' }}>Pay with Paystack</p>
                    <p style={{ fontSize: '12px', color: 'var(--cyber-body, #4a3f6b)', margin: 0 }}>Card, Bank Transfer, USSD</p>
                  </div>
                </div>
                <span style={{ fontSize: '20px', color: '#00C078' }}>→</span>
              </button>

              {/* Flutterwave */}
              <button
                onClick={handleFlutterwave}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: '2px solid rgba(245,166,35,0.3)',
                  background: 'rgba(245,166,35,0.06)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    ⚡
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 2px' }}>Pay with Flutterwave</p>
                    <p style={{ fontSize: '12px', color: 'var(--cyber-body, #4a3f6b)', margin: 0 }}>Card, Mobile Money, Bank</p>
                  </div>
                </div>
                <span style={{ fontSize: '20px', color: '#F5A623' }}>→</span>
              </button>

              <p style={{ fontSize: '11px', color: 'var(--cyber-body, #4a3f6b)', textAlign: 'center', margin: '4px 0 0', opacity: 0.7 }}>
                🔒 Secure & encrypted payment
              </p>
            </div>
          </>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.65); }
          }
          input:focus {
            border-color: #7c3aed !important;
            box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
          }
          input::placeholder {
            color: rgba(100,80,150,0.4);
          }
        `}</style>
      </div>
    </div>
  )
}
