'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    setStep('processing')
    setPayMethod('paystack')

    const handler = (window as any).PaystackPop?.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: form.email,
      amount: amount * 100,
      currency: 'NGN',
      ref: `PSW-META-${plan.toUpperCase()}-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Plan', variable_name: 'plan', value: plan },
          { display_name: 'Client Name', variable_name: 'name', value: `${form.firstName} ${form.lastName}` },
        ],
      },
      callback: async (response: any) => {
        await createAccountAndActivate(response.reference, 'paystack')
      },
      onClose: () => {
        setStep('payment')
      },
    })
    
    if (handler) {
      handler.openIframe()
    } else {
      setError('Paystack not loaded. Please try Flutterwave.')
      setStep('payment')
    }
  }

  const handleFlutterwavePayment = () => {
    if (!isLoggedIn && !validateDetails()) return
    setStep('processing')
    setPayMethod('flutterwave')

    const config = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: `PSW-META-${plan.toUpperCase()}-${Date.now()}`,
      amount,
      currency: 'NGN',
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: form.email,
        phone_number: form.phone,
        name: `${form.firstName} ${form.lastName}`,
      },
      customizations: {
        title: `PurpleSoftHub ${plan} Plan`,
        description: `Meta Ads ${plan} Plan`,
        logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
      },
      callback: async (response: any) => {
        if (response.status === 'successful') {
          await createAccountAndActivate(response.transaction_id, 'flutterwave')
        }
      },
      onclose: () => {
        setStep('payment')
      },
    }

    const FlutterwaveCheckout = (window as any).FlutterwaveCheckout
    if (FlutterwaveCheckout) {
      const flw = new FlutterwaveCheckout(config)
      flw.open()
    } else {
      setError('Flutterwave not loaded. Please try Paystack.')
      setStep('payment')
    }
  }

  const createAccountAndActivate = async (reference: string, method: 'paystack' | 'flutterwave') => {
    setStep('processing')
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
  )
}