'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import purpleLogo from '@/Assets/images/Purplesoft-logo-main.png'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignUp = async () => {
    if (!fullName || !email || !password) return
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'client', full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) { setError(error.message); setGoogleLoading(false) }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google')
      setGoogleLoading(false)
    }
  }

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
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
          {children}
        </div>
      </div>
    </div>
  )

  if (success) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✨</div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--cyber-heading)',
            margin: '0 0 8px',
          }}>
            Check your email
          </h1>
          <p style={{
            fontSize: '12px',
            color: 'var(--cyber-body)',
            margin: '0 0 20px',
            lineHeight: 1.6,
          }}>
            We sent a confirmation link to{' '}
            <span style={{ color: '#a855f7', fontWeight: 600 }}>{email}</span>.
            Click it to activate your account.
          </p>
          <Link href="/sign-in" style={{
            fontSize: '12px',
            color: '#a855f7',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            ← Back to sign in
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* Logo + Header */}
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <Image
          src={purpleLogo}
          alt="PurpleSoftHub"
          width={110}
          height={34}
          style={{
            margin: '0 auto 14px',
            display: 'block',
            filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.5))',
          }}
          priority
        />
        <h1 style={{
          fontSize: '20px',
          fontWeight: 800,
          color: 'var(--cyber-heading)',
          margin: '0 0 4px',
          letterSpacing: '-0.3px',
        }}>
          Get started 💜
        </h1>
        <p style={{
          fontSize: '12px',
          color: 'var(--cyber-muted)',
          margin: 0,
        }}>
          Create your PurpleSoftHub account
        </p>
      </div>

      {/* Google button */}
      <button
        onClick={handleGoogleSignUp}
        disabled={googleLoading || loading}
        className="auth-google-btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: '#fff',
          color: '#1f1f1f',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '10px',
          padding: '9px 16px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
          marginBottom: '16px',
          opacity: googleLoading || loading ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {googleLoading ? 'Connecting...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--cyber-border)' }} />
        <span style={{ fontSize: '11px', color: 'var(--cyber-muted)', whiteSpace: 'nowrap' }}>or email</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--cyber-border)' }} />
      </div>

      {/* Error */}
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

      {/* Full name */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--cyber-muted)',
          marginBottom: '5px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Full name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="cyber-input"
          style={{ width: '100%', padding: '9px 12px', fontSize: '13px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--cyber-muted)',
          marginBottom: '5px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="cyber-input"
          style={{ width: '100%', padding: '9px 12px', fontSize: '13px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Password */}
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
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
          className="cyber-input"
          style={{ width: '100%', padding: '9px 12px', fontSize: '13px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Create account button */}
      <button
        onClick={handleSignUp}
        disabled={loading || googleLoading || !fullName || !email || !password}
        className="cyber-btn-primary"
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '16px',
        }}
      >
        {loading ? 'Creating account...' : 'Create Account →'}
      </button>

      {/* Sign in link */}
      <p style={{
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--cyber-muted)',
        margin: 0,
      }}>
        Already have an account?{' '}
        <Link href="/sign-in" style={{ color: '#a855f7', fontWeight: 700, textDecoration: 'none' }}>
          Sign in →
        </Link>
      </p>

      <style>{`
        .auth-google-btn { transition: all 0.15s ease; }
        .auth-google-btn:hover:not(:disabled) {
          background: #f8f8f8 !important;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(0,0,0,0.12);
        }
        .auth-google-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>
    </PageWrapper>
  )
}
