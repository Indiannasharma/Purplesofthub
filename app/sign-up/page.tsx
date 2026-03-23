'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  const [supabase] = useState(() => createClient())

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
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError('')

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
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#06030f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background:
              'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Success card */}
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(10,6,24,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '24px',
            padding: '40px 36px',
            position: 'relative',
            zIndex: 1,
            boxShadow:
              '0 0 60px rgba(124,58,237,0.1), 0 24px 48px rgba(0,0,0,0.4)',
            textAlign: 'center',
          }}
        >
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
              fontSize: '24px',
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 12px',
              letterSpacing: '-0.5px',
            }}
          >
            Check your email
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#9d8fd4',
              margin: '0 0 24px',
            }}
          >
            We sent a confirmation link to{' '}
            <span style={{ color: '#a855f7' }}>{email}</span>. Click it to activate your account.
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
        background: '#06030f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background:
            'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(10,6,24,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '24px',
          padding: '40px 36px',
          position: 'relative',
          zIndex: 1,
          boxShadow:
            '0 0 60px rgba(124,58,237,0.1), 0 24px 48px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <Image
            src="/images/logo/purplesoft-logo-main.png"
            alt="PurpleSoftHub"
            width={160}
            height={48}
            style={{
              margin: '0 auto 12px',
              display: 'block',
            }}
            priority
          />
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 6px',
              letterSpacing: '-0.5px',
            }}
          >
            Get started 💜
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#9d8fd4',
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
              background: 'rgba(124,58,237,0.2)',
            }}
          />
          <span
            style={{
              fontSize: '13px',
              color: '#6b5fa0',
            }}
          >
            or continue with email
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'rgba(124,58,237,0.2)',
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
              fontWeight: 500,
              color: '#9d8fd4',
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
            style={{
              width: '100%',
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '14px',
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#7c3aed'
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor =
                'rgba(124,58,237,0.2)'
            }}
          />
        </div>

        {/* Email field */}
        <div style={{ marginBottom: '14px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: '#9d8fd4',
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
            style={{
              width: '100%',
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '14px',
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#7c3aed'
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor =
                'rgba(124,58,237,0.2)'
            }}
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: '#9d8fd4',
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
            style={{
              width: '100%',
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '14px',
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#7c3aed'
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor =
                'rgba(124,58,237,0.2)'
            }}
          />
        </div>

        {/* Create account button */}
        <button
          onClick={handleSignUp}
          disabled={
            loading || googleLoading || !fullName || !email || !password
          }
          style={{
            width: '100%',
            background:
              loading || googleLoading
                ? 'rgba(124,58,237,0.5)'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '13px 20px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s',
            opacity: !fullName || !email || !password ? 0.5 : 1,
            boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          }}
        >
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>

        {/* Sign in link */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#6b5fa0',
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
