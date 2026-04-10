'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'

const PLAN_PRICES: Record<string, number> = {
  Starter: 150000,
  Growth: 250000,
  Scale: 400000,
  Enterprise: 600000,
  'Flex Weekly': 85000,
}

interface CheckoutModalProps {
  plan: string
  serviceId?: string
  serviceName?: string
  amount?: number
  isLoggedIn?: boolean
  onSuccess?: (reference: string, method: 'paystack' | 'flutterwave') => void
  onClose: () => void
}

export default function CheckoutModal({ plan, serviceId, serviceName, amount: propAmount, isLoggedIn = false, onSuccess, onClose }: CheckoutModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>(isLoggedIn ? 'payment' : 'details')
  const [payMethod, setPayMethod] = useState<'paystack' | 'flutterwave' | null>(null)
  const [error, setError] = useState('')
  const [gatewayOpening, setGatewayOpening] = useState<'paystack' | 'flutterwave' | null>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState({ paystack: false, flutterwave: false })
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

  // Load payment scripts reliably when modal opens
  useEffect(() => {
    console.log('[CheckoutModal] Modal opened, initializing payment scripts')
    
    // Check if Paystack is already loaded
    if ((window as any).PaystackPop) {
      console.log('[CheckoutModal] Paystack already loaded')
      setScriptsLoaded(prev => ({ ...prev, paystack: true }))
    }

    // Check if Flutterwave is already loaded
    if ((window as any).FlutterwaveCheckout) {
      console.log('[CheckoutModal] Flutterwave already loaded')
      setScriptsLoaded(prev => ({ ...prev, flutterwave: true }))
    }

    // Poll for script loading
    const interval = setInterval(() => {
      if ((window as any).PaystackPop) {
        setScriptsLoaded(prev => ({ ...prev, paystack: true }))
      }
      if ((window as any).FlutterwaveCheckout) {
        setScriptsLoaded(prev => ({ ...prev, flutterwave: true }))
      }
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Prefill customer details for logged-in users
  useEffect(() => {
    if (!isLoggedIn) return

    let isMounted = true
    const supabase = createClient()

    const loadLoggedInUser = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user
        if (!user || !isMounted) return

        let profile: { full_name?: string | null; phone?: string | null } | null = null
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .single()
          profile = profileData
        } catch {
          // Profile table/row might not exist for some users; metadata fallback below.
        }

        const fullName =
          profile?.full_name ||
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          ''
        const [firstName = '', ...lastParts] = fullName.trim().split(' ').filter(Boolean)
        const lastName = lastParts.join(' ')
        const phone =
          profile?.phone ||
          (user.user_metadata?.phone as string | undefined) ||
          ''

        setForm(prev => ({
          ...prev,
          email: prev.email || user.email || '',
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
          phone: prev.phone || phone,
        }))
      } catch {
        // Keep checkout usable and let user continue manually.
      }
    }

    loadLoggedInUser()

    return () => {
      isMounted = false
    }
  }, [isLoggedIn])

  const update = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }))
  }

  const validateDetails = () => {
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
    if (form.password.length < 8) {
      setError('Password must be 8+ characters')
      return false
    }
    setError('')
    return true
  }

  const handlePaystackPayment = () => {
    if (!isLoggedIn && !validateDetails()) return
    if (!form.email.trim() || !process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      setError('Unable to start Paystack. Please confirm your email and try again.')
      return
    }

    try {
      setError('')
      setGatewayOpening('paystack')
      setPayMethod('paystack')

      const handler = (window as any).PaystackPop?.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: form.email.trim(),
        amount: amount * 100,
        currency: 'NGN',
        ref: `PSW-META-${plan.toUpperCase()}-${Date.now()}`,
        metadata: {
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: plan },
            { display_name: 'Client Name', variable_name: 'name', value: `${form.firstName} ${form.lastName}`.trim() || form.email.trim() },
          ],
        },
        callback: async (response: any) => {
          setGatewayOpening(null)
          await createAccountAndActivate(response.reference, 'paystack')
        },
        onClose: () => {
          setGatewayOpening(null)
          setStep('payment')
        },
      })

      if (!handler) {
        throw new Error('Paystack not loaded')
      }

      handler.openIframe()
    } catch {
      setGatewayOpening(null)
      setError('Paystack failed to open. Please try again or use Flutterwave.')
      setStep('payment')
    }
  }

  const handleFlutterwavePayment = () => {
    if (!isLoggedIn && !validateDetails()) return
    if (!form.email.trim() || !process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY) {
      setError('Unable to start Flutterwave. Please confirm your email and try again.')
      return
    }

    try {
      setError('')
      setGatewayOpening('flutterwave')
      setPayMethod('flutterwave')

      const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: `PSW-META-${plan.toUpperCase()}-${Date.now()}`,
        amount,
        currency: 'NGN',
        payment_options: 'card,banktransfer,ussd',
        customer: {
          email: form.email.trim(),
          phone_number: form.phone.trim() || undefined,
          name: `${form.firstName} ${form.lastName}`.trim() || form.email.trim(),
        },
        customizations: {
          title: `PurpleSoftHub ${plan} Plan`,
          description: `Meta Ads ${plan} Plan`,
          logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
        },
        callback: async (response: any) => {
          if (response?.status === 'successful') {
            setGatewayOpening(null)
            await createAccountAndActivate(String(response.transaction_id || response.tx_ref), 'flutterwave')
          } else {
            setGatewayOpening(null)
            setError('Payment was not completed. Please try again.')
            setStep('payment')
          }
        },
        onclose: () => {
          setGatewayOpening(null)
          setStep('payment')
        },
      }

      const FlutterwaveCheckout = (window as any).FlutterwaveCheckout
      if (!FlutterwaveCheckout) {
        throw new Error('Flutterwave not loaded')
      }
      FlutterwaveCheckout(config)
    } catch {
      setGatewayOpening(null)
      setError('Flutterwave failed to open. Please try again or use Paystack.')
      setStep('payment')
    }
  }

  const createAccountAndActivate = async (reference: string, method: 'paystack' | 'flutterwave') => {
    setStep('processing')
    setGatewayOpening(null)
    try {
      const res = await fetch('/api/checkout/meta-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          businessName: form.businessName,
          password: form.password,
          plan,
          amount,
          paymentReference: reference,
          paymentMethod: method,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setStep('success')
        if (onSuccess) {
          onSuccess(reference, method)
        }
      } else {
        setError(data.error || 'Something went wrong')
        setStep('payment')
      }
    } catch (err) {
      setError('Network error. Contact support.')
      setStep('payment')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid rgba(124,58,237,0.25)',
    background: 'rgba(124,58,237,0.06)',
    color: 'var(--cyber-heading)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  return (
    <>
      {/* Load payment scripts ONCE when modal opens */}
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[CheckoutModal] Flutterwave script loaded successfully')
          setScriptsLoaded(prev => ({ ...prev, flutterwave: true }))
        }}
        onError={(e) => {
          console.error('[CheckoutModal] Failed to load Flutterwave script', e)
        }}
      />

      <div style={{
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
      }}>
      <div style={{
        background: 'var(--cyber-bg)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 'clamp(24px, 4vw, 40px)',
        position: 'relative',
        boxShadow: '0 0 60px rgba(124,58,237,0.2)',
      }}>
        {/* Corner decorations */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '32px', height: '32px',
          borderTop: '2px solid #7c3aed',
          borderLeft: '2px solid #7c3aed',
          borderRadius: '24px 0 0 0',
        }}/>
        <div style={{
          position: 'absolute',
          bottom: 0, right: 0,
          width: '32px', height: '32px',
          borderBottom: '2px solid #22d3ee',
          borderRight: '2px solid #22d3ee',
          borderRadius: '0 0 24px 0',
        }}/>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px', right: '16px',
            width: '32px', height: '32px',
            borderRadius: '50%',
            border: '1px solid rgba(124,58,237,0.2)',
            background: 'rgba(124,58,237,0.08)',
            color: 'var(--cyber-body)',
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

        {/* Plan badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(124,58,237,0.1)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '100px',
          padding: '5px 14px',
          marginBottom: '20px',
        }}>
          <span style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#a855f7',
            boxShadow: '0 0 8px #a855f7',
            animation: 'cyberPulse 1.8s infinite',
            display: 'inline-block',
          }}/>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#a855f7',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}>
            {plan} — ₦{amount.toLocaleString()}/month
          </span>
        </div>

        {/* SUCCESS STATE */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              border: '2px solid rgba(16,185,129,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '0 auto 24px',
              boxShadow: '0 0 30px rgba(16,185,129,0.2)',
            }}>
              🎉
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: 'var(--cyber-heading)',
              margin: '0 0 12px',
            }}>
              Welcome to PurpleSoftHub!
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'var(--cyber-body)',
              lineHeight: 1.6,
              margin: '0 0 8px',
            }}>
              Your <strong style={{ color: '#a855f7' }}>{plan}</strong> plan is now active.
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--cyber-body)',
              margin: '0 0 28px',
            }}>
              Check your email for login instructions.
            </p>
            <Link
              href="/sign-in"
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
              Go to Dashboard →
            </Link>
          </div>
        )}

        {/* PROCESSING STATE */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '60px', height: '60px',
              borderRadius: '50%',
              border: '3px solid rgba(124,58,237,0.2)',
              borderTop: '3px solid #7c3aed',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite',
            }}/>
            <p style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--cyber-heading)',
              margin: '0 0 8px',
            }}>
              Setting up your account...
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--cyber-body)',
              margin: 0,
            }}>
              Please don't close this window
            </p>
          </div>
        )}

        {/* DETAILS STEP */}
        {step === 'details' && (
          <>
            <h2 style={{
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: 900,
              color: 'var(--cyber-heading)',
              margin: '0 0 6px',
            }}>
              Create Your Account
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--cyber-body)',
              margin: '0 0 24px',
            }}>
              Fill in your details to get started
            </p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#ef4444',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--cyber-body)',
                    display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => update('firstName', e.target.value)}
                    placeholder="Emmanuel"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--cyber-body)',
                    display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => update('lastName', e.target.value)}
                    placeholder="Ekanem"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--cyber-body)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@business.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--cyber-body)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+234 900 000 0000"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--cyber-body)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={e => update('businessName', e.target.value)}
                  placeholder="Your Business"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--cyber-body)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Create Password *
                </label>
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
                  if (validateDetails()) setStep('payment')
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
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                  marginTop: '4px',
                }}
              >
                Continue to Payment →
              </button>

              <p style={{
                fontSize: '12px',
                color: 'var(--cyber-body)',
                textAlign: 'center',
                margin: 0,
              }}>
                Already have an account?{' '}
                <Link href="/sign-in" style={{
                  color: '#a855f7',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  Sign in
                </Link>
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
                  color: 'var(--cyber-body)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                ← Back
              </button>
            )}

            <h2 style={{
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: 900,
              color: 'var(--cyber-heading)',
              margin: '0 0 6px',
            }}>
              Choose Payment Method
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--cyber-body)',
              margin: '0 0 24px',
            }}>
              Secure payment for <strong style={{ color: '#a855f7' }}>{plan} Plan</strong> — ₦{amount.toLocaleString()}/month
            </p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#ef4444',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <button
                onClick={handlePaystackPayment}
                disabled={gatewayOpening !== null}
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
                  opacity: gatewayOpening ? 0.7 : 1,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#00C078',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    💳
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: 'var(--cyber-heading)',
                      margin: '0 0 2px',
                    }}>
                      Pay with Paystack
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--cyber-body)',
                      margin: 0,
                    }}>
                      Card, Bank Transfer, USSD
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '18px', color: '#00C078' }}>→</span>
              </button>

              <button
                onClick={handleFlutterwavePayment}
                disabled={gatewayOpening !== null}
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
                  opacity: gatewayOpening ? 0.7 : 1,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    ⚡
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: 'var(--cyber-heading)',
                      margin: '0 0 2px',
                    }}>
                      Pay with Flutterwave
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--cyber-body)',
                      margin: 0,
                    }}>
                      Card, Mobile Money, Bank
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '18px', color: '#F5A623' }}>→</span>
              </button>

              {gatewayOpening && (
                <p style={{
                  fontSize: '12px',
                  color: '#a855f7',
                  textAlign: 'center',
                  margin: '2px 0 0',
                  fontWeight: 600,
                }}>
                  Opening payment gateway...
                </p>
              )}

              <p style={{
                fontSize: '11px',
                color: 'var(--cyber-body)',
                textAlign: 'center',
                margin: '4px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
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
          @keyframes cyberPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.65); }
          }
          input:focus {
            border-color: #7c3aed !important;
            box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
          }
          input::placeholder {
            color: rgba(100,80,150,0.5);
          }
        `}</style>
      </div>
    </div>
    </>
  )
}
