'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const PLAN_PRICES: Record<string, number> = {
  Starter: 150000,
  Growth: 250000,
  Scale: 400000,
  Enterprise: 600000,
  'Flex Weekly': 42000,
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

  const waitForFlutterwave = async (timeoutMs = 7000) => {
    const started = Date.now()

    while (Date.now() - started < timeoutMs) {
      if (typeof window !== 'undefined' && typeof (window as any).FlutterwaveCheckout === 'function') {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 120))
    }

    return false
  }

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

  const resolveCustomerIdentity = async () => {
    const baseIdentity = {
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      fullName: `${form.firstName} ${form.lastName}`.trim(),
    }

    if (!isLoggedIn) {
      return baseIdentity
    }

    try {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user

      if (!user) {
        return baseIdentity
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', user.id)
        .maybeSingle()

      const fullName =
        profile?.full_name ||
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        user.email?.split('@')[0] ||
        baseIdentity.fullName

      const [firstName = '', ...lastParts] = String(fullName).trim().split(' ').filter(Boolean)
      const lastName = lastParts.join(' ')
      const email = profile?.email || user.email || baseIdentity.email
      const phone = profile?.phone || (user.user_metadata?.phone as string | undefined) || baseIdentity.phone

      const resolved = {
        email,
        firstName: firstName || baseIdentity.firstName,
        lastName: lastName || baseIdentity.lastName,
        phone,
        fullName: `${firstName || baseIdentity.firstName} ${lastName || baseIdentity.lastName}`.trim() || email,
      }

      setForm(prev => ({
        ...prev,
        email: prev.email || resolved.email,
        firstName: prev.firstName || resolved.firstName,
        lastName: prev.lastName || resolved.lastName,
        phone: prev.phone || resolved.phone,
      }))

      return resolved
    } catch {
      return baseIdentity
    }
  }

  const buildCheckoutPayload = (identity: {
    email: string
    firstName: string
    lastName: string
    phone: string
    fullName: string
  }) => {
    return {
      firstName: identity.firstName,
      lastName: identity.lastName,
      email: identity.email,
      phone: identity.phone,
      businessName: form.businessName.trim(),
      password: form.password,
      plan,
      amount,
      serviceId,
      serviceName: serviceName || plan,
      requiresProjectCreation: Boolean(isLoggedIn),
      fullName: identity.fullName,
    }
  }

  const saveDraft = (payload: ReturnType<typeof buildCheckoutPayload>) => {
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
      const identity = await resolveCustomerIdentity()
      if (!identity.email) {
        throw new Error('Unable to determine your email address. Please refresh and try again.')
      }

      const payload = buildCheckoutPayload(identity)
      saveDraft(payload)

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

      if (data.payment_link) {
        window.location.href = data.payment_link
        return
      }

      const flutterwaveConfig = {
        ...(data.config || {}),
        public_key: data.config?.public_key || process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: data.config?.tx_ref || data.tx_ref,
        amount: data.config?.amount || payload.amount,
        currency: data.config?.currency || 'NGN',
        payment_options: data.config?.payment_options || 'card,banktransfer,ussd',
        customer: {
          email: payload.email,
          name: payload.fullName || payload.email,
          ...(payload.phone ? { phone_number: payload.phone } : {}),
        },
        meta: {
          ...(data.config?.meta || {}),
          service: payload.serviceId || 'service-checkout',
          service_id: payload.serviceId,
          service_name: payload.serviceName,
          plan_name: payload.plan,
          requires_project_creation: payload.requiresProjectCreation,
        },
        customizations: {
          ...(data.config?.customizations || {}),
          title: payload.serviceName || 'PurpleSoftHub Checkout',
          description: `${payload.plan} plan`,
          logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
        },
        redirect_url: data.config?.redirect_url || successUrl,
      }

      const flutterwaveGlobal = await (async () => {
        if (typeof window === 'undefined') return null
        if (typeof (window as any).FlutterwaveCheckout === 'function') return (window as any).FlutterwaveCheckout
        const ready = await waitForFlutterwave()
        return ready ? (window as any).FlutterwaveCheckout : null
      })()

      if (typeof flutterwaveGlobal !== 'function') {
        if (data.payment_link) {
          window.location.href = data.payment_link
          return
        }
        throw new Error('Flutterwave is still loading. Please try again.')
      }

      flutterwaveGlobal({
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
    padding: '9px 12px',
    borderRadius: 9,
    border: '1px solid rgba(168,85,247,0.22)',
    background: 'rgba(124,58,237,0.07)',
    color: '#e9e4ff',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(168,85,247,0.55)'
    e.target.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.12)'
  }
  const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(168,85,247,0.22)'
    e.target.style.boxShadow   = 'none'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #0f0b1f 0%, #090712 100%)',
          border: '1px solid rgba(124,58,237,0.28)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 440,
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(124,58,237,0.25)',
          color: '#e9e4ff',
        }}
      >
        {/* Top gradient accent */}
        <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#7c3aed,#a855f7,#7c3aed,transparent)', borderRadius: '20px 20px 0 0' }} />

        <div style={{ padding: '18px 20px 20px' }}>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid rgba(124,58,237,0.22)',
              background: 'rgba(124,58,237,0.08)',
              color: '#e9e4ff', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit', lineHeight: 1,
            }}
            aria-label="Close checkout"
          >
            ×
          </button>

          {/* Plan badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.28)',
            borderRadius: 100, padding: '4px 11px', marginBottom: 16,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#22d3ee', boxShadow: '0 0 6px #22d3ee',
              animation: 'cm-pulse 1.8s infinite', display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {serviceName || 'PurpleSoftHub Checkout'} — ₦{amount.toLocaleString()}
            </span>
          </div>

          {step === 'details' && (
            <>
              <h2 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 4px' }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: 12, color: '#c6b8ef', margin: '0 0 16px', lineHeight: 1.5 }}>
                Complete your details to continue to secure payment.
              </p>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8, padding: '8px 12px', marginBottom: 12,
                  fontSize: 12, color: '#fca5a5',
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={labelStyle}>First Name *</label>
                    <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Emmanuel" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Ekanem" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@business.com" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
                </div>

                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+234 900 000 0000" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
                </div>

                <div>
                  <label style={labelStyle}>Business Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Your Business" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
                </div>

                <div>
                  <label style={labelStyle}>Create Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="Min 8 characters"
                    style={inputStyle}
                    onFocus={onFocusInput}
                    onBlur={onBlurInput}
                  />
                </div>

                <button
                  onClick={() => { if (validateGuestDetails()) setStep('payment') }}
                  className="btn-main"
                  style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 700, marginTop: 2 }}
                >
                  Continue to Payment →
                </button>

                <p style={{ fontSize: 11, color: '#c6b8ef', textAlign: 'center', margin: 0 }}>
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
                <button onClick={() => setStep('details')} style={backButtonStyle}>
                  ← Back
                </button>
              )}

              <h2 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 4px' }}>
                Choose Payment Method
              </h2>
              <p style={{ fontSize: 12, color: '#c6b8ef', margin: '0 0 14px', lineHeight: 1.5 }}>
                Secure payment for <strong style={{ color: '#a855f7' }}>{plan}</strong> plan. Approx. ${amountUSD}.
              </p>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8, padding: '8px 12px', marginBottom: 12,
                  fontSize: 12, color: '#fca5a5',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {profileLoading && (
                <p style={{ fontSize: 11, color: '#22d3ee', margin: '0 0 10px', fontWeight: 700 }}>
                  Loading your profile…
                </p>
              )}

              <div style={{ display: 'grid', gap: 10 }}>
                <button
                  onClick={() => void initSecureRedirect('paystack')}
                  disabled={gatewayOpening !== null || profileLoading}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(0,192,120,0.28)',
                    background: 'rgba(0,192,120,0.06)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s',
                    opacity: gatewayOpening === 'paystack' ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={methodIconStyle('#00C078')}>💳</div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={methodTitleStyle}>Pay with Paystack</p>
                      <p style={methodSubtitleStyle}>Card · Bank Transfer · USSD</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: '#00C078' }}>{gatewayOpening === 'paystack' ? '…' : '→'}</span>
                </button>

                <button
                  onClick={() => void initSecureRedirect('flutterwave')}
                  disabled={gatewayOpening !== null || profileLoading}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(245,166,35,0.28)',
                    background: 'rgba(245,166,35,0.06)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s',
                    opacity: gatewayOpening === 'flutterwave' ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={methodIconStyle('#F5A623')}>⚡</div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={methodTitleStyle}>Pay with Flutterwave</p>
                      <p style={methodSubtitleStyle}>Card · Mobile Money · Bank</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: '#F5A623' }}>{gatewayOpening === 'flutterwave' ? '…' : '→'}</span>
                </button>

                {gatewayOpening && (
                  <p style={{ fontSize: 11, color: '#22d3ee', textAlign: 'center', margin: '2px 0 0', fontWeight: 700 }}>
                    Opening secure payment…
                  </p>
                )}

                <p style={{ fontSize: 11, color: '#c6b8ef', textAlign: 'center', margin: '2px 0 0', opacity: 0.7 }}>
                  🔒 Secure &amp; encrypted payment
                </p>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={spinnerStyle} />
              <p style={{ fontSize: 14, fontWeight: 800, margin: '0 0 6px' }}>Processing your request…</p>
              <p style={{ fontSize: 12, color: '#c6b8ef', margin: 0 }}>Please do not close this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={successBadgeStyle}>🎉</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 8px' }}>Welcome to PurpleSoftHub!</h2>
              <p style={{ fontSize: 13, color: '#c6b8ef', lineHeight: 1.6, margin: '0 0 6px' }}>
                Your <strong style={{ color: '#a855f7' }}>{plan}</strong> plan is now active.
              </p>
              <p style={{ fontSize: 12, color: '#c6b8ef', margin: '0 0 20px' }}>
                Check your email for login instructions.
              </p>
              <Link href="/sign-in" style={primaryLinkStyle}>
                Go to Dashboard →
              </Link>
            </div>
          )}

          <style>{`
            @keyframes cm-spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes cm-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50%       { opacity: 0.3; transform: scale(0.65); }
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  color: 'rgba(198,184,239,0.8)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 4,
}

const backButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#c6b8ef',
  fontSize: 12,
  cursor: 'pointer',
  marginBottom: 14,
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: 0,
}

const methodTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: '#ffffff',
  margin: '0 0 1px',
}

const methodSubtitleStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#c6b8ef',
  margin: 0,
}

const methodIconStyle = (color: string): React.CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: 9,
  background: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  flexShrink: 0,
})

const spinnerStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: '3px solid rgba(124,58,237,0.15)',
  borderTop: '3px solid #7c3aed',
  margin: '0 auto 16px',
  animation: 'cm-spin 1s linear infinite',
}

const successBadgeStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: '50%',
  background: 'rgba(16,185,129,0.12)',
  border: '2px solid rgba(16,185,129,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  margin: '0 auto 16px',
  boxShadow: '0 0 24px rgba(16,185,129,0.18)',
}

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  color: '#fff',
  padding: '9px 22px',
  borderRadius: 10,
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 13,
  boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
}
