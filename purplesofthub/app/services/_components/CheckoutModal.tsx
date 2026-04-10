'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const PLAN_PRICES: Record<string, number> = {
  Starter: 150000,
  Growth: 250000,
  Scale: 400000,
  Enterprise: 600000,
  'Flex Weekly': 85000,
}

const DRAFT_KEY = 'purplesofthub.checkout.draft'

type Gateway = 'paystack' | 'flutterwave'

interface CheckoutModalProps {
  plan: string
  serviceId?: string
  serviceName?: string
  amount?: number
  isLoggedIn?: boolean
  onSuccess?: (reference: string, method: Gateway) => void
  onClose: () => void
}

type CheckoutDraft = {
  firstName: string
  lastName: string
  email: string
  phone: string
  businessName: string
  password: string
  plan: string
  amount: number
  serviceId?: string
  serviceName?: string
  requiresProjectCreation: boolean
}

export default function CheckoutModal({
  plan,
  serviceId,
  serviceName,
  amount: propAmount,
  isLoggedIn = false,
  onSuccess,
  onClose,
}: CheckoutModalProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>(
    isLoggedIn ? 'payment' : 'details'
  )
  const [gatewayOpening, setGatewayOpening] = useState<Gateway | null>(null)
  const [error, setError] = useState('')
  const [profileLoading, setProfileLoading] = useState(isLoggedIn)
  const [flutterwaveReady, setFlutterwaveReady] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    password: '',
  })

  const amount = propAmount ?? PLAN_PRICES[plan] ?? 150000
  const amountUSD = Math.round(amount / 1400)
  const successUrlBase = '/services/checkout/success'

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (typeof (window as any).FlutterwaveCheckout === 'function') {
      setFlutterwaveReady(true)
      return
    }

    const interval = window.setInterval(() => {
      if (typeof (window as any).FlutterwaveCheckout === 'function') {
        setFlutterwaveReady(true)
        window.clearInterval(interval)
      }
    }, 250)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setProfileLoading(false)
      return
    }

    let active = true

    const loadProfile = async () => {
      setProfileLoading(true)
      try {
        const supabase = createClient()
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user
        if (!user || !active) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .maybeSingle()

        const fullName =
          profile?.full_name ||
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          ''

        const [firstName = '', ...lastParts] = fullName.trim().split(' ').filter(Boolean)
        const lastName = lastParts.join(' ')

        setForm(prev => ({
          ...prev,
          email: prev.email || user.email || '',
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
          phone: prev.phone || profile?.phone || (user.user_metadata?.phone as string | undefined) || '',
        }))
      } catch {
        // Keep checkout usable even if profile lookup fails.
      } finally {
        if (active) setProfileLoading(false)
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [isLoggedIn])

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validateGuestDetails = () => {
    if (!form.firstName.trim()) {
      setError('First name is required.')
      return false
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('A valid email address is required.')
      return false
    }
    if (!form.phone.trim()) {
      setError('Phone number is required.')
      return false
    }
    if (form.password.trim().length < 8) {
      setError('Password must be at least 8 characters.')
      return false
    }
    return true
  }

  const getCheckoutPayload = () => {
    const fullName = `${form.firstName} ${form.lastName}`.trim()
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      businessName: form.businessName.trim(),
      password: form.password,
      plan,
      amount,
      serviceId,
      serviceName: serviceName || plan,
      requiresProjectCreation: Boolean(isLoggedIn),
      fullName,
    }
  }

  const saveDraft = () => {
    const payload = getCheckoutPayload()
    const draft: CheckoutDraft = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      businessName: payload.businessName,
      password: payload.password,
      plan: payload.plan,
      amount: payload.amount,
      serviceId: payload.serviceId,
      serviceName: payload.serviceName,
      requiresProjectCreation: payload.requiresProjectCreation,
    }

    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    window.sessionStorage.setItem(
      'purplesofthub.checkout.nextPath',
      payload.requiresProjectCreation ? '/dashboard/projects' : '/sign-in'
    )
  }

  const initSecureRedirect = async (gateway: Gateway) => {
    if (!isLoggedIn && !validateGuestDetails()) {
      setStep('details')
      return
    }

    if (profileLoading) {
      setError('Loading your profile. Please wait a moment.')
      return
    }

    try {
      setError('')
      setGatewayOpening(gateway)
      saveDraft()

      const payload = getCheckoutPayload()
      const successUrl = `${window.location.origin}${successUrlBase}?provider=${gateway}`

      const response = await fetch(
        gateway === 'paystack'
          ? '/api/payments/paystack/initialize'
          : '/api/payments/flutterwave/initialize',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: payload.serviceId,
            serviceName: payload.serviceName,
            plan: payload.plan,
            planName: payload.plan,
            amount: payload.amount,
            currency: 'NGN',
            email: payload.email,
            name: `${payload.firstName} ${payload.lastName}`.trim() || payload.email,
            phone: payload.phone,
            metadata: {
              service: payload.serviceId || 'service-checkout',
              service_name: payload.serviceName,
              plan_name: payload.plan,
              requires_project_creation: payload.requiresProjectCreation,
            },
            callback_url: successUrl,
            redirect_url: successUrl,
          }),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed.')
      }

      if (gateway === 'paystack') {
        if (!data.authorization_url) {
          throw new Error('Paystack did not return an authorization URL.')
        }
        window.location.href = data.authorization_url
        return
      }

      const flutterwaveConfig = data.config || {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: data.tx_ref,
        amount: payload.amount,
        currency: 'NGN',
        payment_options: 'card,banktransfer,ussd',
        customer: {
          email: payload.email,
          name: `${payload.firstName} ${payload.lastName}`.trim() || payload.email,
          ...(payload.phone ? { phone_number: payload.phone } : {}),
        },
        meta: {
          service: payload.serviceId || 'service-checkout',
          service_name: payload.serviceName,
          plan_name: payload.plan,
          requires_project_creation: payload.requiresProjectCreation,
        },
        customizations: {
          title: payload.serviceName || 'PurpleSoftHub Checkout',
          description: `${payload.plan} plan`,
          logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
        },
        redirect_url: successUrl,
      }

      if (!(window as any).FlutterwaveCheckout) {
        throw new Error('Flutterwave is still loading. Please try again.')
      }

      ;(window as any).FlutterwaveCheckout({
        ...flutterwaveConfig,
        callback: (response: any) => {
          const ref = String(response?.transaction_id || response?.tx_ref || flutterwaveConfig.tx_ref || '')
          if (!ref) {
            setGatewayOpening(null)
            setError('Flutterwave returned an invalid payment reference.')
            setStep('payment')
            return
          }

          const callbackUrl = new URL(successUrl)
          callbackUrl.searchParams.set('reference', ref)
          callbackUrl.searchParams.set('provider', 'flutterwave')
          window.location.href = callbackUrl.toString()
        },
        onclose: () => {
          setGatewayOpening(null)
          setStep('payment')
          setError('Payment window closed. You can try again anytime.')
        },
      })
    } catch (err) {
      setGatewayOpening(null)
      setStep('payment')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid rgba(124,58,237,0.25)',
    background: 'rgba(124,58,237,0.06)',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const buttonBase: React.CSSProperties = {
    width: '100%',
    padding: '18px 20px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'transform 0.2s, opacity 0.2s',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(10px)',
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
          background: 'linear-gradient(180deg, #0f0b1f 0%, #090712 100%)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'clamp(24px, 4vw, 40px)',
          position: 'relative',
          boxShadow: '0 0 60px rgba(124,58,237,0.2)',
          color: '#e9e4ff',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: '1px solid rgba(124,58,237,0.2)',
            background: 'rgba(124,58,237,0.08)',
            color: '#e9e4ff',
            fontSize: '18px',
            cursor: 'pointer',
          }}
          aria-label="Close checkout"
        >
          ×
        </button>

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
              background: '#22d3ee',
              boxShadow: '0 0 8px #22d3ee',
              animation: 'pulse 1.8s infinite',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#a855f7',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            {serviceName || 'PurpleSoftHub Checkout'} - ₦{amount.toLocaleString()}
          </span>
        </div>

        {step === 'details' && (
          <>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 900, margin: '0 0 8px' }}>
              Create Your Account
            </h2>
            <p style={{ fontSize: '14px', color: '#c6b8ef', margin: '0 0 24px', lineHeight: 1.6 }}>
              Complete your details to continue to secure payment.
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#fca5a5',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Emmanuel" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Ekanem" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@business.com" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+234 900 000 0000" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Business Name</label>
                <input value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Your Business" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Create Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min 8 characters"
                  style={inputStyle}
                />
              </div>

              <button
                onClick={() => {
                  if (validateGuestDetails()) setStep('payment')
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                }}
              >
                Continue to Payment →
              </button>

              <p style={{ fontSize: '12px', color: '#c6b8ef', textAlign: 'center', margin: 0 }}>
                Already have an account?{' '}
                <Link href="/sign-in" style={{ color: '#a855f7', fontWeight: 700, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            {!isLoggedIn && (
              <button
                onClick={() => setStep('details')}
                style={backButtonStyle}
              >
                ← Back
              </button>
            )}

            <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 900, margin: '0 0 8px' }}>
              Choose Payment Method
            </h2>
            <p style={{ fontSize: '14px', color: '#c6b8ef', margin: '0 0 24px', lineHeight: 1.6 }}>
              Secure payment for <strong style={{ color: '#a855f7' }}>{plan}</strong> plan. Approx. ${amountUSD}.
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#fca5a5',
                }}
              >
                {error}
              </div>
            )}

            {profileLoading && (
              <p style={{ fontSize: '12px', color: '#22d3ee', margin: '0 0 8px', fontWeight: 700 }}>
                Loading your profile...
              </p>
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              <button
                onClick={() => void initSecureRedirect('paystack')}
                disabled={gatewayOpening !== null || profileLoading}
                style={{
                  ...buttonBase,
                  border: '2px solid rgba(0,192,120,0.28)',
                  background: 'rgba(0,192,120,0.08)',
                  opacity: gatewayOpening === 'paystack' ? 0.85 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={methodIconStyle('#00C078')}>💳</div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={methodTitleStyle}>Pay with Paystack</p>
                    <p style={methodSubtitleStyle}>Card, bank transfer and USSD</p>
                  </div>
                </div>
                <span style={{ fontSize: '18px', color: '#00C078' }}>
                  {gatewayOpening === 'paystack' ? '...' : '→'}
                </span>
              </button>

              <button
                onClick={() => void initSecureRedirect('flutterwave')}
                disabled={gatewayOpening !== null || profileLoading || !flutterwaveReady}
                style={{
                  ...buttonBase,
                  border: '2px solid rgba(245,166,35,0.28)',
                  background: 'rgba(245,166,35,0.08)',
                  opacity: gatewayOpening === 'flutterwave' ? 0.85 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={methodIconStyle('#F5A623')}>⚡</div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={methodTitleStyle}>Pay with Flutterwave</p>
                    <p style={methodSubtitleStyle}>Card, mobile money and bank</p>
                  </div>
                </div>
                <span style={{ fontSize: '18px', color: '#F5A623' }}>
                  {gatewayOpening === 'flutterwave' ? '...' : '→'}
                </span>
              </button>

              {gatewayOpening && (
                <p style={{ fontSize: '12px', color: '#22d3ee', textAlign: 'center', margin: '2px 0 0', fontWeight: 700 }}>
                  Opening secure payment...
                </p>
              )}
            </div>
          </>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={spinnerStyle} />
            <p style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px' }}>Processing your request...</p>
            <p style={{ fontSize: '13px', color: '#c6b8ef', margin: 0 }}>Please do not close this window.</p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={successBadgeStyle}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 12px' }}>Welcome to PurpleSoftHub!</h2>
            <p style={{ fontSize: '15px', color: '#c6b8ef', lineHeight: 1.6, margin: '0 0 8px' }}>
              Your <strong style={{ color: '#a855f7' }}>{plan}</strong> plan is now active.
            </p>
            <p style={{ fontSize: '13px', color: '#c6b8ef', margin: '0 0 28px' }}>
              Check your email for login instructions.
            </p>
            <Link href="/sign-in" style={primaryLinkStyle}>
              Go to Dashboard →
            </Link>
          </div>
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
        `}</style>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#c6b8ef',
  display: 'block',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const backButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#c6b8ef',
  fontSize: '13px',
  cursor: 'pointer',
  marginBottom: '20px',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: 0,
}

const methodTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 800,
  color: '#ffffff',
  margin: '0 0 2px',
}

const methodSubtitleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#c6b8ef',
  margin: 0,
}

const methodIconStyle = (color: string): React.CSSProperties => ({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
})

const spinnerStyle: React.CSSProperties = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  border: '3px solid rgba(124,58,237,0.2)',
  borderTop: '3px solid #7c3aed',
  margin: '0 auto 20px',
  animation: 'spin 1s linear infinite',
}

const successBadgeStyle: React.CSSProperties = {
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
}

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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
