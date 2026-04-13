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

// ── Shared field styles ───────────────────────────────────────────────────────
const fieldBase: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 9,
  border: '1px solid rgba(124,58,237,0.22)',
  background: 'rgba(124,58,237,0.06)',
  color: 'var(--text-primary)',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 4,
}

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
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn)
  const [form, setForm] = useState({
    firstName: userName.split(' ')[0] || '',
    lastName: userName.split(' ').slice(1).join(' ') || '',
    email: userEmail,
    phone: userPhone,
    businessName: '',
    password: '',
  })

  useEffect(() => {
    const checkAndPrefill = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setIsUserLoggedIn(true)
          const fullName = user.user_metadata?.full_name || userName || ''
          const parts = fullName.trim().split(' ')
          const first = parts[0] || ''
          const last = parts.slice(1).join(' ') || ''

          const { data: profile } = await supabase
            .from('profiles')
            .select('phone, full_name')
            .eq('id', user.id)
            .single()

          const phone = profile?.phone || userPhone || ''
          const nameFromProfile = profile?.full_name || fullName
          const nameParts = nameFromProfile.trim().split(' ')

          setForm(p => ({
            ...p,
            email: user.email || userEmail || '',
            firstName: nameParts[0] || first,
            lastName: nameParts.slice(1).join(' ') || last,
            phone,
          }))
          setStep('payment')
        }
      } catch {
        // Silent fallback
      }
    }
    checkAndPrefill()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!form.firstName.trim()) { setError('First name required'); return false }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Valid email required'); return false }
    if (!form.phone.trim()) { setError('Phone number required'); return false }
    if (!isUserLoggedIn && form.password.length < 8) { setError('Password must be 8+ characters'); return false }
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
          { display_name: 'Client Name', variable_name: 'name', value: `${form.firstName} ${form.lastName}`.trim() },
        ],
      },
      callback: async (response: any) => { await processPayment(response.reference, 'paystack') },
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
      customer: { email: form.email, phone_number: form.phone, name: `${form.firstName} ${form.lastName}`.trim() },
      customizations: {
        title: `PurpleSoftHub — ${plan.name}`,
        description: `${service.name} — ${plan.name} Plan`,
        logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
      },
      callback: async (response: any) => {
        if (response.status === 'successful') await processPayment(String(response.transaction_id), 'flutterwave')
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
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone,
          businessName: form.businessName, password: form.password,
          serviceId: service.id, serviceName: service.name,
          planId: plan.id, planName: plan.name,
          amount: plan.priceNGN, billingType: plan.billingType,
          paymentReference: reference, paymentMethod: method,
          isLoggedIn: isUserLoggedIn,
        }),
      })
      const data = await res.json()
      if (data.success) { setStep('success') } else { setError(data.error || 'Something went wrong'); setStep('payment') }
    } catch {
      setError('Network error. Please try again.')
      setStep('payment')
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--cyber-bg, #f8f5ff)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 420,
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(124,58,237,0.22)',
        }}
      >
        {/* Top gradient accent */}
        <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#7c3aed,#a855f7,#7c3aed,transparent)', borderRadius: '20px 20px 0 0' }} />

        <div style={{ padding: '18px 20px 20px' }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid rgba(124,58,237,0.2)',
              background: 'rgba(124,58,237,0.06)',
              color: 'var(--text-muted)',
              fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit', lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Plan badge */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.22)',
              borderRadius: 100, padding: '4px 11px', marginBottom: 16,
            }}
          >
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#a855f7', boxShadow: '0 0 6px #a855f7',
              display: 'inline-block', animation: 'ucm-pulse 1.8s infinite',
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
              {service.name} — {plan.name} — {formatPrice(plan.priceNGN)}
              {plan.billingType === 'monthly' ? '/mo' : plan.billingType === 'yearly' ? '/yr' : ''}
            </span>
          </div>

          {/* ── SUCCESS ───────────────────────────────────────────────────── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)',
                border: '2px solid rgba(16,185,129,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>🎉</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--cyber-heading,#1a1a2e)', margin: '0 0 8px' }}>
                Payment Successful!
              </h2>
              <p style={{ fontSize: 13, color: 'var(--cyber-body,#4a3f6b)', lineHeight: 1.6, margin: '0 0 4px' }}>
                Your <strong style={{ color: '#a855f7' }}>{plan.name}</strong> plan for{' '}
                <strong style={{ color: '#7c3aed' }}>{service.name}</strong> is now active.
              </p>
              <p style={{ fontSize: 12, color: 'var(--cyber-body,#4a3f6b)', margin: '0 0 20px' }}>
                Our team will reach out within 24 hours.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                  color: '#fff', padding: '9px 20px', borderRadius: 10,
                  textDecoration: 'none', fontWeight: 800, fontSize: 13,
                  boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                }}>
                  Dashboard →
                </Link>
                <a
                  href={`https://wa.me/2348167593393?text=Hi! I just paid for ${service.name} ${plan.name} plan`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#25D366', color: '#fff', padding: '9px 16px',
                    borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13,
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* ── PROCESSING ────────────────────────────────────────────────── */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '3px solid rgba(124,58,237,0.15)',
                borderTop: '3px solid #7c3aed',
                margin: '0 auto 16px',
                animation: 'ucm-spin 1s linear infinite',
              }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--cyber-heading,#1a1a2e)', margin: '0 0 6px' }}>
                {isUserLoggedIn ? 'Processing payment…' : 'Setting up your account…'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--cyber-body,#4a3f6b)', margin: 0 }}>
                Please don't close this window
              </p>
            </div>
          )}

          {/* ── DETAILS FORM ──────────────────────────────────────────────── */}
          {step === 'details' && (
            <>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: 'var(--cyber-heading,#1a1a2e)', margin: '0 0 4px' }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: 12, color: 'var(--cyber-body,#4a3f6b)', margin: '0 0 16px', lineHeight: 1.5 }}>
                Fill in your details to continue to secure payment.
              </p>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8, padding: '8px 12px', marginBottom: 12,
                  fontSize: 12, color: '#ef4444',
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={labelStyle}>First Name *</label>
                    <input type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)}
                      placeholder="Emmanuel" style={fieldBase}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.55)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                      onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(124,58,237,0.22)'; (e.target as HTMLInputElement).style.boxShadow = 'none' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)}
                      placeholder="Ekanem" style={fieldBase}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.55)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                      onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(124,58,237,0.22)'; (e.target as HTMLInputElement).style.boxShadow = 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="you@business.com" style={fieldBase}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.55)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(124,58,237,0.22)'; (e.target as HTMLInputElement).style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="+234 900 000 0000" style={fieldBase}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.55)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(124,58,237,0.22)'; (e.target as HTMLInputElement).style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Business Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input type="text" value={form.businessName} onChange={e => update('businessName', e.target.value)}
                    placeholder="Your Business" style={fieldBase}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.55)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(124,58,237,0.22)'; (e.target as HTMLInputElement).style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Create Password *</label>
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                    placeholder="Min 8 characters" style={fieldBase}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.55)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(124,58,237,0.22)'; (e.target as HTMLInputElement).style.boxShadow = 'none' }}
                  />
                </div>

                <button
                  onClick={() => { if (validate()) setStep('payment') }}
                  className="btn-main"
                  style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 700, marginTop: 2 }}
                >
                  Continue to Payment →
                </button>

                <p style={{ fontSize: 11, color: 'var(--cyber-body,#4a3f6b)', textAlign: 'center', margin: 0 }}>
                  Already have an account?{' '}
                  <a href="/sign-in" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
                </p>
              </div>
            </>
          )}

          {/* ── PAYMENT STEP ──────────────────────────────────────────────── */}
          {step === 'payment' && (
            <>
              {!isUserLoggedIn && (
                <button
                  onClick={() => setStep('details')}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--cyber-body,#4a3f6b)', fontSize: 12,
                    cursor: 'pointer', marginBottom: 14,
                    fontFamily: 'inherit', padding: 0,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  ← Back
                </button>
              )}

              <h2 style={{ fontSize: 17, fontWeight: 900, color: 'var(--cyber-heading,#1a1a2e)', margin: '0 0 4px' }}>
                Choose Payment Method
              </h2>
              <p style={{ fontSize: 12, color: 'var(--cyber-body,#4a3f6b)', margin: '0 0 14px', lineHeight: 1.5 }}>
                Secure payment for <strong style={{ color: '#a855f7' }}>{service.name}</strong>
              </p>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8, padding: '8px 12px', marginBottom: 12,
                  fontSize: 12, color: '#ef4444',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Price summary */}
              <div style={{
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--cyber-body,#4a3f6b)', margin: '0 0 2px', fontWeight: 600 }}>{service.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--cyber-body,#4a3f6b)', margin: 0, opacity: 0.7 }}>
                    {plan.name} · {plan.billingType === 'monthly' ? 'Monthly' : plan.billingType === 'yearly' ? 'Yearly' : 'One-time'}
                  </p>
                </div>
                <p style={{ fontSize: 17, fontWeight: 900, color: '#7c3aed', margin: 0 }}>{formatPrice(plan.priceNGN)}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Paystack */}
                <button
                  onClick={handlePaystack}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(0,192,120,0.3)',
                    background: 'rgba(0,192,120,0.05)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: '#00C078', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💳</div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--cyber-heading,#1a1a2e)', margin: '0 0 1px' }}>Pay with Paystack</p>
                      <p style={{ fontSize: 11, color: 'var(--cyber-body,#4a3f6b)', margin: 0 }}>Card · Bank Transfer · USSD</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: '#00C078' }}>→</span>
                </button>

                {/* Flutterwave */}
                <button
                  onClick={handleFlutterwave}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(245,166,35,0.3)',
                    background: 'rgba(245,166,35,0.05)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--cyber-heading,#1a1a2e)', margin: '0 0 1px' }}>Pay with Flutterwave</p>
                      <p style={{ fontSize: 11, color: 'var(--cyber-body,#4a3f6b)', margin: 0 }}>Card · Mobile Money · Bank</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: '#F5A623' }}>→</span>
                </button>

                <p style={{ fontSize: 11, color: 'var(--cyber-body,#4a3f6b)', textAlign: 'center', margin: '2px 0 0', opacity: 0.7 }}>
                  🔒 Secure &amp; encrypted payment
                </p>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes ucm-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes ucm-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.3; transform: scale(0.65); }
          }
        `}</style>
      </div>
    </div>
  )
}
