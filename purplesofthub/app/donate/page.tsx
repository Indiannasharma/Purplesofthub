'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const PRESET_AMOUNTS_NGN = [1000, 5000, 10000, 25000, 50000, 100000]
const PRESET_AMOUNTS_USD = [5, 10, 25, 50, 100, 250]

const CRYPTO_WALLETS = [
  {
    name: 'Bitcoin (BTC)',
    icon: '₿',
    color: '#F7931A',
    address: 'bc1q85g4qg3d3c3v9k5t2u6r7y4x8z5w6s7d8f9g0h',
    network: 'Bitcoin Network',
  },
  {
    name: 'USDT (TRC20)',
    icon: '💵',
    color: '#26A17B',
    address: 'TX1234567890abcdef1234567890abcdef1234567890',
    network: 'TRON Network (TRC20)',
  },
  {
    name: 'USDT (ERC20)',
    icon: '💎',
    color: '#627EEA',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    network: 'Ethereum Network (ERC20)',
  },
  {
    name: 'Pi Network',
    icon: 'π',
    color: '#7c3aed',
    address: 'purplepi123',
    network: 'Pi Network',
  },
]

const CAUSES = [
  {
    icon: '🧒',
    title: 'Training Kids in Africa in Tech & AI',
    description: 'We are on a mission to equip the next generation of African children with future-ready skills in coding, artificial intelligence, web development and digital creativity.',
    impact: 'Every ₦10,000 trains 1 child for a week',
  },
  {
    icon: '💻',
    title: 'Purchase of Equipment',
    description: 'Many talented young Africans have the passion and intelligence to learn technology but lack the tools to do so. Donations help us purchase laptops, tablets, and other essential equipment.',
    impact: 'Every ₦50,000 buys 1 refurbished laptop',
  },
  {
    icon: '⚡',
    title: 'Power & Electricity Challenges',
    description: 'Electricity remains one of the biggest barriers to tech education in Nigeria and across Africa. Donations help us invest in solar panels, inverters, and backup power systems.',
    impact: 'Every ₦100,000 powers a centre for 1 month',
  },
  {
    icon: '🌍',
    title: 'Expanding Across Africa',
    description: 'We dream of taking PurpleSoftHub Academy to every corner of Africa — from Lagos to Nairobi, Accra to Johannesburg. Your support helps us establish new training hubs.',
    impact: 'Every ₦500,000 opens a new training hub',
  },
  {
    icon: '📡',
    title: 'Internet Connectivity',
    description: 'Quality tech education requires reliable internet. Donations fund fibre connections, data subscriptions and WiFi infrastructure to ensure uninterrupted learning.',
    impact: 'Every ₦25,000 provides 1 month of internet',
  },
  {
    icon: '🎓',
    title: 'Scholarships & Free Courses',
    description: 'Not every talented young person can afford to pay for tech education. Your donations create scholarship funds that give free access to our courses and certifications.',
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
  const [showCryptoModal, setShowCryptoModal] = useState(false)

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
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: donorEmail,
          amount: finalAmount,
          currency,
          metadata: {
            service: 'donation',
            donor_name: anonymous ? 'Anonymous' : donorName,
            message,
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
    } catch {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: donorEmail,
          amount: finalAmount,
          currency,
          name: anonymous ? 'Anonymous Donor' : (donorName || 'Donor'),
          meta: { service: 'donation', message },
          redirect_url: `${window.location.origin}/donate/success`,
        }),
      })

      const data = await res.json()

      if (data.payment_link) {
        window.location.href = data.payment_link
      } else {
        setError(data.error || 'Payment failed. Please try again.')
      }
    } catch {
      setError('Connection error. Please try again.')
    }

    setProcessing(false)
  }

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: '100vh',
        background: 'var(--blog-space-bg, #06030f)',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'visible',
      }}>
        {/* Grid Background */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--blog-grid-line, rgba(124,58,237,0.08)) 1px, transparent 1px),
            linear-gradient(90deg, var(--blog-grid-line, rgba(124,58,237,0.08)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>

        {/* Ambient Glows */}
        <div style={{
          position: 'fixed',
          top: '-200px',
          left: '-200px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--blog-glow-primary, rgba(124,58,237,0.15)) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>
        <div style={{
          position: 'fixed',
          bottom: '-200px',
          right: '-200px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--blog-glow-cyan, rgba(34,211,238,0.1)) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Hero Section */}
          <section style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'clamp(32px, 4vw, 60px) 24px 0',
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 0 40px var(--blog-glow-primary, rgba(124,58,237,0.3)), inset 0 0 40px rgba(124,58,237,0.04)',
              marginBottom: '60px',
              background: 'var(--blog-hero-bg, linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,211,238,0.05)))',
            }}
            className="hero-card">

              {/* Left content */}
              <div style={{
                padding: 'clamp(32px, 4vw, 56px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '20px',
                position: 'relative',
                zIndex: 2,
              }}>
                {/* Featured badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(124,58,237,0.2)',
                  border: '1px solid rgba(124,58,237,0.5)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  width: 'fit-content',
                  backdropFilter: 'blur(8px)',
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#a855f7',
                    display: 'inline-block',
                    animation: 'pulseDot 1.8s ease-in-out infinite',
                    boxShadow: '0 0 8px #a855f7',
                  }}/>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#c084fc',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    Support Our Mission
                  </span>
                </div>

                {/* Title */}
                <h1 style={{
                  fontSize: 'clamp(24px, 3.5vw, 44px)',
                  fontWeight: 900,
                  color: 'var(--blog-heading, #fff)',
                  margin: 0,
                  lineHeight: 1.15,
                  letterSpacing: '-0.5px',
                  textShadow: '0 0 40px rgba(168,85,247,0.3)',
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

                {/* Excerpt */}
                <p style={{
                  fontSize: '15px',
                  color: 'var(--blog-text-muted, #9d8fd4)',
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: '500px',
                }}>
                  Your donation empowers the next generation of African tech talent. Every contribution — big or small — makes a real difference.
                </p>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '32px',
                  flexWrap: 'wrap',
                  marginTop: '10px',
                }}>
                  {[
                    { value: '500+', label: 'Kids to Train' },
                    { value: '6', label: 'African Countries' },
                    { value: '∞', label: 'Impact' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p style={{
                        fontSize: '28px',
                        fontWeight: 900,
                        color: '#a855f7',
                        margin: '0 0 4px',
                        textShadow: '0 0 20px rgba(168,85,247,0.4)',
                      }}>
                        {stat.value}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--blog-text-muted, #6b5fa0)',
                        margin: 0,
                        fontWeight: 600,
                      }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corner decorations */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '40px', height: '40px',
                borderTop: '2px solid var(--blog-corner-primary, #7c3aed)',
                borderLeft: '2px solid var(--blog-corner-primary, #7c3aed)',
                borderRadius: '24px 0 0 0',
              }}/>
              <div style={{
                position: 'absolute',
                top: 0, right: 0,
                width: '40px', height: '40px',
                borderTop: '2px solid var(--blog-corner-cyan, #22d3ee)',
                borderRight: '2px solid var(--blog-corner-cyan, #22d3ee)',
                borderRadius: '0 24px 0 0',
              }}/>
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0,
                width: '40px', height: '40px',
                borderBottom: '2px solid var(--blog-corner-cyan, #22d3ee)',
                borderLeft: '2px solid var(--blog-corner-cyan, #22d3ee)',
                borderRadius: '0 0 0 24px',
              }}/>
              <div style={{
                position: 'absolute',
                bottom: 0, right: 0,
                width: '40px', height: '40px',
                borderBottom: '2px solid var(--blog-corner-primary, #7c3aed)',
                borderRight: '2px solid var(--blog-corner-primary, #7c3aed)',
                borderRadius: '0 0 24px 0',
              }}/>
            </div>
          </section>

          {/* Main Content */}
          <section style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px clamp(48px, 8vw, 100px)',
            display: 'grid',
            gap: '32px',
            alignItems: 'start',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Causes Grid */}
            <div>
              <h2 style={{
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                fontWeight: 900,
                color: 'var(--blog-heading, #fff)',
                margin: '0 0 28px',
                textShadow: '0 0 20px rgba(168,85,247,0.3)',
              }}>
                Where Your Money Goes
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
              }}
              className="blog-posts-grid">
                {CAUSES.map((cause, i) => (
                  <div key={cause.title} style={{
                    background: 'var(--blog-card-bg, rgba(124,58,237,0.05))',
                    border: '1px solid var(--blog-card-border, rgba(124,58,237,0.15))',
                    borderRadius: '16px',
                    padding: '24px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                  }}
                  className="blog-card"
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(124,58,237,0.4)'
                    el.style.boxShadow = '0 0 30px rgba(124,58,237,0.15)'
                    el.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--blog-card-border, rgba(124,58,237,0.15))'
                    el.style.boxShadow = 'none'
                    el.style.transform = 'translateY(0)'
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      marginBottom: '16px',
                    }}>
                      {cause.icon}
                    </div>

                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: 'var(--blog-heading, #fff)',
                      margin: '0 0 10px',
                      lineHeight: 1.3,
                      textShadow: '0 0 10px rgba(168,85,247,0.2)',
                    }}>
                      {cause.title}
                    </h3>

                    <p style={{
                      fontSize: '12px',
                      color: 'var(--blog-text-muted, #9d8fd4)',
                      lineHeight: 1.6,
                      margin: '0 0 16px',
                    }}>
                      {cause.description}
                    </p>

                    {/* Impact */}
                    <div style={{
                      background: 'rgba(124,58,237,0.1)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span style={{ fontSize: '14px' }}>💜</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#c084fc',
                      }}>
                        {cause.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation Form */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '28px',
              alignItems: 'start',
            }}>
              {/* Left — Form */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}>
                {/* Currency & Amount */}
                <div style={{
                  background: 'var(--blog-card-bg, rgba(124,58,237,0.05))',
                  border: '1px solid var(--blog-card-border, rgba(124,58,237,0.15))',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--blog-text-muted, #9d8fd4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 14px',
                  }}>
                    Select Currency
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
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
                          color: currency === cur ? '#c084fc' : 'var(--blog-text-muted, #9d8fd4)',
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

                {/* Amount Selection */}
                <div style={{
                  background: 'var(--blog-card-bg, rgba(124,58,237,0.05))',
                  border: '1px solid var(--blog-card-border, rgba(124,58,237,0.15))',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--blog-text-muted, #9d8fd4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 14px',
                  }}>
                    Choose Amount
                  </p>

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
                          color: selectedAmount === amount ? '#c084fc' : 'var(--blog-text-muted, #9d8fd4)',
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
                        border: customAmount ? '2px solid #7c3aed' : '2px solid rgba(124,58,237,0.15)',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: '#fff',
                      }}
                    />
                  </div>

                  {finalAmount && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: 'rgba(124,58,237,0.1)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#c084fc',
                    }}>
                      Donating: {currency === 'NGN' ? '₦' : '$'}{finalAmount.toLocaleString()} {currency}
                    </div>
                  )}
                </div>

                {/* Donor Info */}
                <div style={{
                  background: 'var(--blog-card-bg, rgba(124,58,237,0.05))',
                  border: '1px solid var(--blog-card-border, rgba(124,58,237,0.15))',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--blog-text-muted, #9d8fd4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 16px',
                  }}>
                    Your Details
                  </p>

                  <div style={{ display: 'grid', gap: '14px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      padding: '12px',
                      background: anonymous ? 'rgba(124,58,237,0.1)' : 'transparent',
                      border: '1px solid rgba(124,58,237,0.15)',
                      borderRadius: '10px',
                    }}>
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={e => setAnonymous(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#7c3aed', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blog-heading, #fff)' }}>
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
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          color: '#fff',
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
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: '#fff',
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
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{
                  background: 'var(--blog-card-bg, rgba(124,58,237,0.05))',
                  border: '1px solid var(--blog-card-border, rgba(124,58,237,0.15))',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--blog-text-muted, #9d8fd4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 16px',
                  }}>
                    Payment Method
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <button
                      onClick={() => setPaymentMethod('paystack')}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: paymentMethod === 'paystack' ? '2px solid #0BA4DB' : '2px solid rgba(124,58,237,0.15)',
                        background: paymentMethod === 'paystack' ? 'rgba(11,164,219,0.1)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: paymentMethod === 'paystack' ? '#0BA4DB' : 'var(--blog-text-muted, #9d8fd4)',
                        marginBottom: '4px',
                      }}>
                        💳 Paystack
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b5fa0' }}>Cards · Bank · USSD</div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('flutterwave')}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: paymentMethod === 'flutterwave' ? '2px solid #F5A623' : '2px solid rgba(124,58,237,0.15)',
                        background: paymentMethod === 'flutterwave' ? 'rgba(245,166,35,0.1)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: paymentMethod === 'flutterwave' ? '#F5A623' : 'var(--blog-text-muted, #9d8fd4)',
                        marginBottom: '4px',
                      }}>
                        🌊 Flutterwave
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b5fa0' }}>International · Mobile</div>
                    </button>
                  </div>

                  <button
                    onClick={() => { setPaymentMethod('crypto'); setShowCryptoModal(true) }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: paymentMethod === 'crypto' ? '2px solid #F7931A' : '2px solid rgba(124,58,237,0.15)',
                      background: paymentMethod === 'crypto' ? 'rgba(247,147,26,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>₿</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: paymentMethod === 'crypto' ? '#F7931A' : 'var(--blog-text-muted, #9d8fd4)',
                      }}>
                        Crypto Donation
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b5fa0' }}>BTC · USDT · Pi</div>
                    </div>
                  </button>
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#f87171',
                  }}>
                    ⚠️ {error}
                  </div>
                )}

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
                        ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                        : 'rgba(124,58,237,0.3)',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 800,
                      cursor: (finalAmount && donorEmail) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: (finalAmount && donorEmail) ? '0 0 30px rgba(124,58,237,0.4)' : 'none',
                    }}
                  >
                    {processing ? (
                      <>
                        <div style={{
                          width: '20px', height: '20px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid #fff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>💳 Donate {finalAmount ? `${currency === 'NGN' ? '₦' : '$'}${finalAmount.toLocaleString()}` : ''} via Paystack</>
                    )}
                  </button>
                )}

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
                        ? 'linear-gradient(135deg, #F5A623, #d97706)'
                        : 'rgba(245,166,35,0.3)',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 800,
                      cursor: (finalAmount && donorEmail) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: (finalAmount && donorEmail) ? '0 0 30px rgba(245,166,35,0.4)' : 'none',
                    }}
                  >
                    {processing ? (
                      <>
                        <div style={{
                          width: '20px', height: '20px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid #fff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>🌊 Donate {finalAmount ? `${currency === 'NGN' ? '₦' : '$'}${finalAmount.toLocaleString()}` : ''} via Flutterwave</>
                    )}
                  </button>
                )}
              </div>

              {/* Right Sidebar */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
              className="blog-sidebar">
                {/* Trust Badge */}
                <div style={{
                  background: 'var(--blog-sidebar-bg, rgba(124,58,237,0.05))',
                  border: '1px solid var(--blog-card-border, rgba(124,58,237,0.15))',
                  borderRadius: '16px',
                  padding: '20px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--blog-heading, #fff)',
                    margin: '0 0 16px',
                    textShadow: '0 0 10px rgba(168,85,247,0.3)',
                  }}>
                    💜 Transparent Giving
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { icon: '✅', text: '100% goes to the cause' },
                      { icon: '📊', text: 'Regular impact reports' },
                      { icon: '🔒', text: 'Secure payments' },
                      { icon: '🌍', text: 'Global reach, local impact' },
                    ].map(item => (
                      <div key={item.text} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: 'var(--blog-popular-bg, rgba(124,58,237,0.05))',
                        border: '1px solid var(--blog-popular-border, rgba(124,58,237,0.1))',
                        borderRadius: '8px',
                      }}>
                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                        <span style={{ fontSize: '12px', color: 'var(--blog-text-muted, #9d8fd4)', fontWeight: 600 }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick FAQ */}
                <div style={{
                  background: 'var(--blog-sidebar-bg, rgba(124,58,237,0.05))',
                  border: '1px solid var(--blog-card-border, rgba(124,58,237,0.15))',
                  borderRadius: '16px',
                  padding: '20px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--blog-heading, #fff)',
                    margin: '0 0 16px',
                    textShadow: '0 0 10px rgba(168,85,247,0.3)',
                  }}>
                    Quick FAQ
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { q: 'Can I donate in any currency?', a: 'Yes! We accept NGN, USD, and major cryptocurrencies.' },
                      { q: 'Is my donation tax-deductible?', a: 'Contact us for tax documentation in your region.' },
                      { q: 'How do I know my money is used well?', a: 'We publish quarterly impact reports with photos and metrics.' },
                    ].map((faq, i) => (
                      <div key={i}>
                        <p style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#c084fc',
                          margin: '0 0 4px',
                        }}>
                          Q: {faq.q}
                        </p>
                        <p style={{
                          fontSize: '11px',
                          color: 'var(--blog-text-muted, #9d8fd4)',
                          margin: 0,
                          lineHeight: 1.5,
                        }}>
                          A: {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Crypto Modal */}
      {showCryptoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }}
        onClick={() => setShowCryptoModal(false)}>
          <div style={{
            background: 'var(--blog-card-bg, #0d0520)',
            border: '1px solid var(--blog-card-border, rgba(124,58,237,0.3))',
            borderRadius: '20px',
            padding: '28px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 0 60px rgba(124,58,237,0.3)',
          }}
          onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 900,
              color: 'var(--blog-heading, #fff)',
              margin: '0 0 20px',
              textShadow: '0 0 10px rgba(168,85,247,0.3)',
            }}>
              Crypto Donation Addresses
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {CRYPTO_WALLETS.map(wallet => (
                <div key={wallet.name} style={{
                  background: 'rgba(124,58,237,0.05)',
                  border: `1px solid ${wallet.color}30`,
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                  }}>
                    <span style={{ fontSize: '20px' }}>{wallet.icon}</span>
                    <div>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: wallet.color,
                        margin: 0,
                      }}>
                        {wallet.name}
                      </p>
                      <p style={{
                        fontSize: '10px',
                        color: '#6b5fa0',
                        margin: 0,
                      }}>
                        {wallet.network}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}>
                    <code style={{
                      flex: 1,
                      fontSize: '11px',
                      color: '#c084fc',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                    }}>
                      {wallet.address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(wallet.address, wallet.name)}
                      style={{
                        padding: '6px 12px',
                        background: copiedWallet === wallet.name ? 'rgba(16,185,129,0.2)' : 'rgba(124,58,237,0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        color: copiedWallet === wallet.name ? '#10b981' : '#c084fc',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {copiedWallet === wallet.name ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCryptoModal(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '10px',
                color: '#c084fc',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .blog-card {
          transition: all 0.3s ease;
        }
        .blog-card:hover {
          border-color: rgba(124,58,237,0.4) !important;
          box-shadow: 0 0 30px rgba(124,58,237,0.15);
          transform: translateY(-4px);
        }
      `}</style>
    </>
  )
}