'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import purpleLogo from '@/Assets/images/Purplesoft-logo-main.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    if (!email) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--cyber-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Effects */}
        <div className="cyber-glow-top-left" />
        <div className="cyber-glow-bottom-right" />
        <div className="cyber-grid-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--cyber-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--cyber-border)',
            borderRadius: '24px',
            padding: 'clamp(32px, 5vw, 52px) 36px',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 0 40px var(--cyber-glow)',
          }}
        >
          {/* Corner Decorations */}
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-br" />

          {/* Lock Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 20px',
              boxShadow: '0 0 20px rgba(124,58,237,0.2)',
            }}
          >
            🔐
          </div>

          <div className="text-center mb-8" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Link href="/" className="inline-block mb-4" style={{ display: 'inline-block', marginBottom: '16px' }}>
              <Image
                src={purpleLogo}
                alt="PurpleSoftHub"
                width={160}
                height={48}
                style={{
                  margin: '0 auto',
                  display: 'block',
                  filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.4))',
                }}
              />
            </Link>
            <h2
              className="text-2xl font-bold"
              style={{
                fontSize: 'clamp(22px, 3vw, 28px)',
                fontWeight: 900,
                color: 'var(--cyber-heading)',
                marginBottom: '8px',
                textShadow: '0 0 20px rgba(168,85,247,0.2)',
              }}
            >
              Reset Password
            </h2>
            <p
              className="text-sm"
              style={{
                fontSize: '14px',
                color: 'var(--cyber-body)',
              }}
            >
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center py-4" style={{ textAlign: 'center', padding: '20px 0' }}>
              <p className="text-4xl mb-4" style={{ fontSize: '48px', marginBottom: '16px' }}>📧</p>
              <p
                className="font-semibold"
                style={{
                  fontWeight: 700,
                  color: 'var(--cyber-heading)',
                  marginBottom: '8px',
                }}
              >
                Check your email!
              </p>
              <p
                className="text-sm mb-6"
                style={{
                  fontSize: '14px',
                  color: 'var(--cyber-body)',
                  marginBottom: '24px',
                }}
              >
                We sent a password reset link to{' '}
                <span style={{ color: '#a855f7', fontWeight: 600 }}>{email}</span>
              </p>
              <Link
                href="/sign-in"
                style={{
                  fontSize: '13px',
                  color: '#a855f7',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: '#f87171',
                  }}
                >
                  {error}
                </div>
              )}
              <div className="mb-5" style={{ marginBottom: '20px' }}>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--cyber-body)',
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  placeholder="you@example.com"
                  className="cyber-input"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                onClick={handleReset}
                disabled={loading || !email}
                className="cyber-btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p
                className="mt-5 text-center text-sm"
                style={{
                  marginTop: '20px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: 'var(--cyber-muted)',
                }}
              >
                Remember your password?{' '}
                <Link
                  href="/sign-in"
                  style={{
                    color: '#a855f7',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign in →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}