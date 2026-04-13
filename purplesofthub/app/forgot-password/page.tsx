'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
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
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    if (error) { setError(error.message) } else { setSent(true) }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cyber-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      marginTop: '-68px',
    }}>
      <div className="cyber-glow-top-left" />
      <div className="cyber-glow-bottom-right" />
      <div className="cyber-grid-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}>
        {/* Gradient top border */}
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #7c3aed, #a855f7, #7c3aed, transparent)',
          borderRadius: '2px 2px 0 0',
          opacity: 0.8,
        }} />

        <div style={{
          background: 'var(--cyber-card)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--cyber-border)',
          borderTop: 'none',
          borderRadius: '0 0 20px 20px',
          padding: '28px 28px 24px',
          boxShadow: '0 8px 40px rgba(124,58,237,0.15), 0 0 0 1px rgba(124,58,237,0.06)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '14px' }}>
              <Image
                src={purpleLogo}
                alt="PurpleSoftHub"
                width={110}
                height={34}
                style={{
                  margin: '0 auto',
                  display: 'block',
                  filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.5))',
                }}
              />
            </Link>

            {/* Icon */}
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              margin: '0 auto 12px',
            }}>
              🔐
            </div>

            <h2 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--cyber-heading)',
              margin: '0 0 4px',
              letterSpacing: '-0.3px',
            }}>
              Reset Password
            </h2>
            <p style={{
              fontSize: '12px',
              color: 'var(--cyber-muted)',
              margin: 0,
            }}>
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📧</div>
              <p style={{
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--cyber-heading)',
                marginBottom: '6px',
              }}>
                Check your email!
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--cyber-body)',
                marginBottom: '20px',
                lineHeight: 1.6,
              }}>
                Password reset link sent to{' '}
                <span style={{ color: '#a855f7', fontWeight: 600 }}>{email}</span>
              </p>
              <Link href="/sign-in" style={{
                fontSize: '12px',
                color: '#a855f7',
                fontWeight: 700,
                textDecoration: 'none',
              }}>
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: '#f87171',
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--cyber-muted)',
                  marginBottom: '5px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  placeholder="you@example.com"
                  className="cyber-input"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                onClick={handleReset}
                disabled={loading || !email}
                className="cyber-btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>

              <p style={{
                textAlign: 'center',
                fontSize: '12px',
                color: 'var(--cyber-muted)',
                margin: 0,
              }}>
                Remember your password?{' '}
                <Link href="/sign-in" style={{ color: '#a855f7', fontWeight: 700, textDecoration: 'none' }}>
                  Sign in →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
