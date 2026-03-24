'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'

const PRESET_AMOUNTS_NGN = [
  1000, 5000, 10000, 25000, 50000, 100000
]

const PRESET_AMOUNTS_USD = [
  5, 10, 25, 50, 100, 250
]

const CRYPTO_WALLETS = [
  {
    name: 'Bitcoin (BTC)',
    icon: '₿',
    color: '#F7931A',
    bg: 'rgba(247,147,26,0.1)',
    border: 'rgba(247,147,26,0.3)',
    address: 'bc1q85g4qg3d3c3v9k5t2u6r7y4x8z5w6s7d8f9g0h',
    network: 'Bitcoin Network',
  },
  {
    name: 'USDT (TRC20)',
    icon: '💵',
    color: '#26A17B',
    bg: 'rgba(38,161,123,0.1)',
    border: 'rgba(38,161,123,0.3)',
    address: 'TX1234567890abcdef1234567890abcdef1234567890',
    network: 'TRON Network (TRC20)',
  },
  {
    name: 'USDT (ERC20)',
    icon: '💎',
    color: '#627EEA',
    bg: 'rgba(98,126,234,0.1)',
    border: 'rgba(98,126,234,0.3)',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    network: 'Ethereum Network (ERC20)',
  },
  {
    name: 'Pi Network',
    icon: 'π',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)',
    border: 'rgba(124,58,237,0.3)',
    address: 'purplepi123',
    network: 'Pi Network',
  },
]

const CAUSES = [
  {
    icon: '🧒',
    title: 'Training Kids in Africa in Tech & AI',
    description: 'We are on a mission to equip the next generation of African children with future-ready skills in coding, artificial intelligence, web development and digital creativity. Your donation funds free bootcamps, workshops and mentorship programs for underprivileged kids across Nigeria and Africa.',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
    impact: 'Every ₦10,000 trains 1 child for a week',
  },
  {
    icon: '💻',
    title: 'Purchase of Equipment',
    description: 'Many talented young Africans have the passion and intelligence to learn technology but lack the tools to do so. Donations help us purchase laptops, tablets, routers, monitors and other essential equipment for our training centres and students who cannot afford devices.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    impact: 'Every ₦50,000 buys 1 refurbished laptop',
  },
  {
    icon: '⚡',
    title: 'Power & Electricity Challenges',
    description: 'Electricity remains one of the biggest barriers to tech education in Nigeria and across Africa. Donations help us invest in solar panels, inverters, generators and backup power systems so our training centres can run consistently without power outages disrupting learning.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    impact: 'Every ₦100,000 powers a centre for 1 month',
  },
  {
    icon: '🌍',
    title: 'Expanding Across Africa',
    description: 'We dream of taking PurpleSoftHub Academy to every corner of Africa — from Lagos to Nairobi, Accra to Johannesburg. Your support helps us establish new training hubs, hire local instructors and bring world-class digital education to underserved communities.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    impact: 'Every ₦500,000 opens a new training hub',
  },
  {
    icon: '📡',
    title: 'Internet Connectivity',
    description: 'Quality tech education requires reliable internet. Many of our students and training locations struggle with poor connectivity. Donations fund fibre connections, data subscriptions and WiFi infrastructure to ensure uninterrupted learning.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
    impact: 'Every ₦25,000 provides 1 month of internet',
  },
  {
    icon: '🎓',
    title: 'Scholarships & Free Courses',
    description: 'Not every talented young person can afford to pay for tech education. Your donations create scholarship funds that give free access to PurpleSoftHub Academy courses, certifications and mentorship programmes for students from low-income backgrounds.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.2)',
    impact: 'Every ₦30,000 funds 1 full scholarship',
  },
]

export default function DonatePage() {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'crypto' | null>(null)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null)
  const [error, setError] = useState('')

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount

  const presetAmounts = currency === 'NGN' ? PRESET_AMOUNTS_NGN : PRESET_AMOUNTS_USD

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedWallet(name)
      setTimeout(() => setCopiedWallet(null), 3000)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedWallet(name)
      setTimeout(() => setCopiedWallet(null), 3000)
    }
  }

  const handlePaystackDonate = async () => {
    if (!finalAmount || !donorEmail) {
      setError('Please enter an amount and email')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const amountInKobo = currency === 'NGN' ? finalAmount * 100 : finalAmount * 100

      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: donorEmail,
          amount: finalAmount,
          currency,
          metadata: {
            service: 'donation',
            donor_name: anonymous ? 'Anonymous' : donorName,
            message,
            custom_fields: [
              {
                display_name: 'Donor Name',
                variable_name: 'donor_name',
                value: anonymous ? 'Anonymous' : donorName,
              },
              {
                display_name: 'Message',
                variable_name: 'message',
                value: message || 'No message',
              },
            ],
          },
          callback_url: `${window.location.origin}/donate/success`,
        }),
      })

      const data = await res.json()

      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        setError(data.error || 'Payment failed. Please try again.')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }

    setProcessing(false)
  }

  const handleFlutterwaveDonate = async () => {
    if (!finalAmount || !donorEmail) {
      setError('Please enter an amount and email')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const res = await fetch('/api/payments/flutterwave/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: donorEmail,
          amount: finalAmount,
          currency,
          name: anonymous ? 'Anonymous Donor' : (donorName || 'Donor'),
          meta: {
            service: 'donation',
            message,
          },
          redirect_url: `${window.location.origin}/donate/success`,
        }),
      })

      const data = await res.json()

      if (data.payment_link) {
        window.location.href = data.payment_link
      } else {
        setError(data.error || 'Payment failed. Please try again.')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }

    setProcessing(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg, #ffffff)',
    }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #06030f 0%, #0d0520 60%, #1a0535 100%)',
        padding: 'clamp(60px, 10vw, 100px) 24px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '24px',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#a855f7',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{
              fontSize: '13px',
              color: '#a855f7',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}>
              Support Our Mission
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 20px',
            lineHeight: 1.05,
            letterSpacing: '-1px',
          }}>
            Help Us Build{' '}
            <span style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Africa's Digital Future
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: '#9d8fd4',
            margin: '0 0 32px',
            lineHeight: 1.7,
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Your donation empowers the next generation of African tech talent. Every contribution — big or small — makes a real difference.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
          }}>
            {[
              { value: '500+', label: 'Kids to Train' },
              { value: '6', label: 'African Countries' },
              { value: '∞', label: 'Impact' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#fff',
                  margin: '0 0 4px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#6b5fa0',
                  margin: 0,
                  fontWeight: 600,
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 16px',
      }}>

        {/* ── WHY WE NEED DONATIONS ── */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#a855f7',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '12px',
            }}>
              Where Your Money Goes
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 900,
              color: 'var(--heading, #1a1a1a)',
              margin: '0 0 16px',
              letterSpacing: '-0.5px',
            }}>
              Why We Need Your Support
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--subtext, #6b5fa0)',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Every naira and dollar donated goes directly toward building a stronger digital Africa
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {CAUSES.map((cause, i) => (
              <div key={cause.title} style={{
                background: cause.bg,
                border: `1px solid ${cause.border}`,
                borderRadius: '20px',
                padding: '28px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                {/* Icon + Number */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: `rgba(${cause.color === '#7c3aed' ? '124,58,237' : cause.color === '#3b82f6' ? '59,130,246' : cause.color === '#f59e0b' ? '245,158,11' : cause.color === '#10b981' ? '16,185,129' : cause.color === '#8b5cf6' ? '139,92,246' : '236,72,153'},0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    {cause.icon}
                  </div>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: cause.color,
                    background: `rgba(${cause.color === '#7c3aed' ? '124,58,237' : cause.color === '#3b82f6' ? '59,130,246' : cause.color === '#f59e0b' ? '245,158,11' : cause.color === '#10b981' ? '16,185,129' : cause.color === '#8b5cf6' ? '139,92,246' : '236,72,153'},0.1)`,
                    padding: '4px 10px',
                    borderRadius: '100px',
                  }}>
                    #{i + 1} Priority
                  </span>
                </div>

                <h3 style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: 'var(--heading, #1a1a1a)',
                  margin: '0 0 10px',
                  lineHeight: 1.3,
                }}>
                  {cause.title}
                </h3>

                <p style={{
                  fontSize: '14px',
                  color: 'var(--subtext, #6b5fa0)',
                  lineHeight: 1.7,
                  margin: '0 0 16px',
                }}>
                  {cause.description}
                </p>

                {/* Impact */}
                <div style={{
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '16px' }}>
                    💜
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#a855f7',
                  }}>
                    {cause.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DONATION FORM ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 340px',
          gap: '28px',
          alignItems: 'start',
        }}
        className="donate-grid">

          {/* Left — Payment form */}
          <div>

            {/* Currency toggle */}
            <div style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--subtext, #6b5fa0)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '14px',
              }}>
                Select Currency
              </p>
              <div style={{
                display: 'flex',
                gap: '10px',
              }}>
                {(['NGN', 'USD'] as const).map(cur => (
                  <button
                    key={cur}
                    onClick={() => {
                      setCurrency(cur)
                      setSelectedAmount(null)
                      setCustomAmount('')
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: currency === cur
                        ? '2px solid #7c3aed'
                        : '2px solid rgba(124,58,237,0.15)',
                      background: currency === cur
                        ? 'rgba(124,58,237,0.15)'
                        : 'transparent',
                      color: currency === cur
                        ? '#a855f7'
                        : 'var(--subtext, #6b5fa0)',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {cur === 'NGN' ? '🇳🇬 NGN (₦)' : '🇺🇸 USD ($)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount selection */}
            <div style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--subtext, #6b5fa0)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '14px',
              }}>
                Choose Amount
              </p>

              {/* Preset amounts */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '14px',
              }}>
                {presetAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                    }}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: selectedAmount === amount
                        ? '2px solid #7c3aed'
                        : '2px solid rgba(124,58,237,0.15)',
                      background: selectedAmount === amount
                        ? 'rgba(124,58,237,0.15)'
                        : 'transparent',
                      color: selectedAmount === amount
                        ? '#a855f7'
                        : 'var(--subtext, #6b5fa0)',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {currency === 'NGN' ? '₦' : '$'}{amount.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#7c3aed',
                  fontWeight: 700,
                  fontSize: '16px',
                  pointerEvents: 'none',
                }}>
                  {currency === 'NGN' ? '₦' : '$'}
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={e => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  placeholder="Enter custom amount"
                  style={{
                    width: '100%',
                    paddingLeft: '32px',
                    paddingRight: '14px',
                    paddingTop: '13px',
                    paddingBottom: '13px',
                    background: 'rgba(124,58,237,0.05)',
                    border: customAmount
                      ? '2px solid #7c3aed'
                      : '2px solid rgba(124,58,237,0.15)',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box' as const,
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              {/* Selected amount display */}
              {finalAmount && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: 'rgba(124,58,237,0.1)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#a855f7',
                }}>
                  Donating: {currency === 'NGN' ? '₦' : '$'}{finalAmount.toLocaleString()} {currency}
                </div>
              )}
            </div>

            {/* Donor info */}
            <div style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--subtext, #6b5fa0)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
              }}>
                Your Details
              </p>

              <div style={{ display: 'grid', gap: '14px' }}>
                {/* Anonymous toggle */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '12px',
                  background: anonymous ? 'rgba(124,58,237,0.1)' : 'transparent',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                }}>
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#7c3aed',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--heading, #1a1a1a)',
                  }}>
                    Donate anonymously 🥷
                  </span>
                </label>

                {!anonymous && (
                  <input
                    type="text"
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    placeholder="Your full name (optional)"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(124,58,237,0.05)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box' as const,
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s',
                    }}
                  />
                )}

                <input
                  type="email"
                  value={donorEmail}
                  onChange={e => setDonorEmail(e.target.value)}
                  placeholder="Email address (required for receipt) *"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(124,58,237,0.05)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box' as const,
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                />

                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Leave a message of support (optional) 💜"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(124,58,237,0.05)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box' as const,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Payment method */}
            <div style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--subtext, #6b5fa0)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
              }}>
                Payment Method
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {/* Paystack */}
                <button
                  onClick={() => setPaymentMethod('paystack')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: paymentMethod === 'paystack'
                      ? '2px solid #0BA4DB'
                      : '2px solid rgba(124,58,237,0.15)',
                    background: paymentMethod === 'paystack'
                      ? 'rgba(11,164,219,0.1)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: paymentMethod === 'paystack'
                      ? '#0BA4DB'
                      : 'var(--subtext, #6b5fa0)',
                    marginBottom: '4px',
                  }}>
                    💳 Paystack
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9d8fd4',
                  }}>
                    Cards · Bank · USSD
                  </div>
                </button>

                {/* Flutterwave */}
                <button
                  onClick={() => setPaymentMethod('flutterwave')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: paymentMethod === 'flutterwave'
                      ? '2px solid #F5A623'
                      : '2px solid rgba(124,58,237,0.15)',
                    background: paymentMethod === 'flutterwave'
                      ? 'rgba(245,166,35,0.1)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: paymentMethod === 'flutterwave'
                      ? '#F5A623'
                      : 'var(--subtext, #6b5fa0)',
                    marginBottom: '4px',
                  }}>
                    🌊 Flutterwave
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9d8fd4',
                  }}>
                    International · Mobile
                  </div>
                </button>
              </div>

              {/* Crypto */}
              <button
                onClick={() => setPaymentMethod('crypto')}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: paymentMethod === 'crypto'
                    ? '2px solid #F7931A'
                    : '2px solid rgba(124,58,237,0.15)',
                  background: paymentMethod === 'crypto'
                    ? 'rgba(247,147,26,0.08)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '20px' }}>
                  ₿
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: paymentMethod === 'crypto'
                      ? '#F7931A'
                      : 'var(--subtext, #6b5fa0)',
                  }}>
                    Crypto Donation
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9d8fd4',
                  }}>
                    BTC · USDT (TRC20/ERC20) · Pi
                  </div>
                </div>
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#f87171',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Paystack button */}
            {paymentMethod === 'paystack' && (
              <button
                onClick={handlePaystackDonate}
                disabled={processing || !finalAmount || !donorEmail}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: (finalAmount && donorEmail)
                    ? 'linear-gradient(135deg, #0BA4DB, #0891b2)'
                    : 'rgba(11,164,219,0.3)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: (finalAmount && donorEmail) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: (finalAmount && donorEmail)
                    ? '0 8px 30px rgba(11,164,219,0.3)'
                    : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {processing ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Processing...
                  </>
                ) : (
                  <>
                    💳 Donate {finalAmount ? `${currency === 'NGN' ? '₦' : '$'}${finalAmount.toLocaleString()}` : ''} via Paystack
                  </>
                )}
              </button>
            )}

            {/* Flutterwave button */}
            {paymentMethod === 'flutterwave' && (
              <button
                onClick={handleFlutterwaveDonate}
                disabled={processing || !finalAmount || !donorEmail}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: (finalAmount && donorEmail)
                    ? 'linear-gradient(135deg, #F5A623, #e8971a)'
                    : 'rgba(245,166,35,0.3)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: (finalAmount && donorEmail) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: (finalAmount && donorEmail)
                    ? '0 8px 30px rgba(245,166,35,0.3)'
                    : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {processing ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Processing...
                  </>
                ) : (
                  <>
                    🌊 Donate {finalAmount ? `${currency === 'NGN' ? '₦' : '$'}${finalAmount.toLocaleString()}` : ''} via Flutterwave
                  </>
                )}
              </button>
            )}

            {/* Crypto wallets */}
            {paymentMethod === 'crypto' && (
              <div style={{ display: 'grid', gap: '12px' }}>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--subtext, #6b5fa0)',
                  margin: '0 0 4px',
                  fontWeight: 600,
                }}>
                  Send crypto directly to any of these wallets:
                </p>
                {CRYPTO_WALLETS.map(wallet => (
                  <div key={wallet.name} style={{
                    background: wallet.bg,
                    border: `1px solid ${wallet.border}`,
                    borderRadius: '14px',
                    padding: '18px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}>
                        <span style={{
                          fontSize: '24px',
                          color: wallet.color,
                          fontWeight: 900,
                        }}>
                          {wallet.icon}
                        </span>
                        <div>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: wallet.color,
                            margin: 0,
                          }}>
                            {wallet.name}
                          </p>
                          <p style={{
                            fontSize: '11px',
                            color: '#6b5fa0',
                            margin: 0,
                          }}>
                            {wallet.network}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(wallet.address, wallet.name)}
                        style={{
                          background: copiedWallet === wallet.name
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(124,58,237,0.1)',
                          border: `1px solid ${copiedWallet === wallet.name ? 'rgba(16,185,129,0.3)' : 'rgba(124,58,237,0.2)'}`,
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: copiedWallet === wallet.name
                            ? '#10b981' : '#a855f7',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {copiedWallet === wallet.name ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#9d8fd4',
                      wordBreak: 'break-all',
                      lineHeight: 1.5,
                    }}>
                      {wallet.address}
                    </div>
                  </div>
                ))}

                <div style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '13px',
                  color: '#f59e0b',
                  display: 'flex',
                  gap: '8px',
                }}>
                  <span>⚠️</span>
                  <span>
                    Please send only the specified cryptocurrency to each wallet address. After sending please WhatsApp us your transaction hash for confirmation.
                  </span>
                </div>

                <a
                  href="https://wa.me/message/BPNJE7CPON3OJ1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: '#25D366',
                    color: '#fff',
                    padding: '14px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 5.45-4.437 9.884-9.885 9.884a11.821 11.821 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Confirm Crypto Donation on WhatsApp
                </a>
              </div>
            )}

            {/* No method selected */}
            {!paymentMethod && (
              <div style={{
                width: '100%',
                padding: '18px',
                borderRadius: '14px',
                background: 'rgba(124,58,237,0.1)',
                border: '2px dashed rgba(124,58,237,0.3)',
                color: '#6b5fa0',
                fontSize: '15px',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                👆 Select a payment method above
              </div>
            )}
          </div>

          {/* Right — Summary card */}
          <div style={{
            position: 'sticky',
            top: '80px',
          }}>

            {/* Donation summary */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(168,85,247,0.05))',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '16px',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--heading, #1a1a1a)',
                margin: '0 0 20px',
              }}>
                Your Impact 💜
              </h3>

              <div style={{
                fontSize: '40px',
                fontWeight: 900,
                color: '#a855f7',
                marginBottom: '4px',
                lineHeight: 1,
              }}>
                {finalAmount ? `${currency === 'NGN' ? '₦' : '$'}${finalAmount.toLocaleString()}` : '—'}
              </div>
              <p style={{
                fontSize: '13px',
                color: '#6b5fa0',
                margin: '0 0 20px',
              }}>
                {currency} donation
              </p>

              {/* Impact items */}
              {finalAmount && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    { icon: '🧒', text: currency === 'NGN' ? `Trains ${Math.floor(finalAmount/10000)} kid${Math.floor(finalAmount/10000) !== 1 ? 's' : ''} for a week` : `Trains ${Math.floor(finalAmount/7)} kid${Math.floor(finalAmount/7) !== 1 ? 's' : ''} for a week` },
                    { icon: '⚡', text: 'Powers our mission forward' },
                    { icon: '🌍', text: 'Impacts Africa\'s digital future' },
                  ].map(item => (
                    <div key={item.text} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      background: 'rgba(124,58,237,0.06)',
                      borderRadius: '10px',
                    }}>
                      <span style={{ fontSize: '18px' }}>
                        {item.icon}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        color: 'var(--subtext, #6b5fa0)',
                        fontWeight: 500,
                      }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div style={{
              background: 'rgba(124,58,237,0.04)',
              border: '1px solid rgba(124,58,237,0.12)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <p style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#6b5fa0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}>
                Why Trust Us
              </p>
              {[
                '🔒 100% Secure payments',
                '🧾 Donation receipt via email',
                '💜 Founded in Lagos, Nigeria',
                '🌍 Mission-driven organisation',
                '📊 Transparent fund usage',
              ].map(item => (
                <div key={item} style={{
                  fontSize: '13px',
                  color: 'var(--subtext, #6b5fa0)',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(124,58,237,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {item}
                </div>
              ))}
            </div>

            {/* Share */}
            <div style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--heading, #1a1a1a)',
                marginBottom: '12px',
              }}>
                Share this campaign 🚀
              </p>
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
              }}>
                {[
                  { name: 'WhatsApp', color: '#25D366', url: `https://wa.me/?text=Support%20PurpleSoftHub%20in%20training%20African%20kids%20in%20Tech%20%26%20AI%20%F0%9F%92%9C%20https://purplesofthub.com/donate`, icon: '💬' },
                  { name: 'Twitter', color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=Support%20%40purplesofthub%20in%20training%20African%20kids%20in%20Tech%20%26%20AI%20%F0%9F%8C%8D%20Donate%20today!&url=https://purplesofthub.com/donate`, icon: '🐦' },
                  { name: 'LinkedIn', color: '#0A66C2', url: `https://linkedin.com/sharing/share-offsite/?url=https://purplesofthub.com/donate`, icon: '💼' },
                ].map(social => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '10px',
                      background: `rgba(${social.color === '#25D366' ? '37,211,102' : social.color === '#1DA1F2' ? '29,161,242' : '10,102,194'},0.1)`,
                      border: `1px solid rgba(${social.color === '#25D366' ? '37,211,102' : social.color === '#1DA1F2' ? '29,161,242' : '10,102,194'},0.3)`,
                      color: social.color,
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>
                      {social.icon}
                    </span>
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        :root {
          --heading: #1a1a1a;
          --subtext: #6b5fa0;
          --bg: #ffffff;
        }
        .dark {
          --heading: #ffffff;
          --subtext: #9d8fd4;
          --bg: #06030f;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .donate-grid {
            grid-template-columns: 1fr !important;
          }
        }
        /* Fix input text */
        input, textarea, select {
          color: var(--heading, #1a1a1a) !important;
        }
        input::placeholder,
        textarea::placeholder {
          color: #9d8fd4 !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}