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
          data: {
            role: 'client',
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

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
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })

      if (error) {
        setError(error.message)
        setGoogleLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google')
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
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

        {/* Success card */}
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
            textAlign: 'center',
          }}
        >
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-br" />
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
            }}
          >
            ✨
          </div>
          <h1
            style={{
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 900,
              color: 'var(--cyber-heading)',
              margin: '0 0 12px',
              letterSpacing: '-0.5px',
              textShadow: '0 0 20px rgba(168,85,247,0.2)',
            }}
          >
            Check your email
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--cyber-body)',
              margin: '0 0 24px',
            }}
          >
            We sent a confirmation link to{' '}
            <span style={{ color: '#a855f7', fontWeight: 600 }}>{email}</span>. Click it to activate your account.
          </p>
          <Link
            href="/sign-in"
            style={{
              display: 'inline-block',
              fontSize: '13px',
              color: '#a855f7',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
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

      {/* Card */}
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

        {/* Logo */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <Image
            src={purpleLogo}
            alt="PurpleSoftHub"
            width={160}
            height={48}
            style={{
              margin: '0 auto 12px',
              display: 'block',
              filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.4))',
            }}
            priority
          />
          <h1
            style={{
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 900,
              color: 'var(--cyber-heading)',
              margin: '0 0 6px',
              letterSpacing: '-0.5px',
              textShadow: '0 0 20px rgba(168,85,247,0.2)',
            }}
          >
            Get started 💜
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--cyber-body)',
              margin: 0,
            }}
          >
            Create your PurpleSoftHub account
          </p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          className="google-btn-signup"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: '#fff',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '12px',
            padding: '13px 20px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s',
            opacity: googleLoading || loading ? 0.7 : 1,
          }}
        >
          {/* Google SVG icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'var(--cyber-border)',
            }}
          />
          <span
            style={{
              fontSize: '13px',
              color: 'var(--cyber-muted)',
            }}
          >
            or continue with email
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'var(--cyber-border)',
            }}
          />
        </div>

        {/* Error */}
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

        {/* Full name field */}
        <div style={{ marginBottom: '14px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--cyber-body)',
              marginBottom: '6px',
            }}
          >
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="cyber-input"
            style={{
              width: '100%',
              padding: '13px 16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Email field */}
        <div style={{ marginBottom: '14px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--cyber-body)',
              marginBottom: '6px',
            }}
          >
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="cyber-input"
            style={{
              width: '100%',
              padding: '13px 16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--cyber-body)',
              marginBottom: '6px',
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
            className="cyber-input"
            style={{
              width: '100%',
              padding: '13px 16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Create account button */}
        <button
          onClick={handleSignUp}
          disabled={
            loading || googleLoading || !fullName || !email || !password
          }
          className="cyber-btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>

        {/* Sign in link */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--cyber-muted)',
            margin: 0,
          }}
        >
          Already have an account?{' '}
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
      </div>
      <style>{`
        .google-btn-signup:hover {
          background: #f5f5f5 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .google-btn-signup:active {
          transform: translateY(0);
        }
        .google-btn-signup {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  )
}