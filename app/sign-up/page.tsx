'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignUp = async () => {
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
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('provider') || error.message.toLowerCase().includes('not enabled')) {
        setError('Google sign-in is not configured yet. Please use email and password below.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ background: '#060311' }}
      >
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">💜</div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>
            Check your email
          </h1>
          <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
            We sent a confirmation link to{' '}
            <span style={{ color: '#a855f7' }}>{email}</span>.
            Click it to activate your account.
          </p>
          <Link
            href="/sign-in"
            className="text-sm font-medium hover:underline"
            style={{ color: '#a855f7' }}
          >
            &larr; Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: '#060311' }}
    >
      <div className="w-full max-w-sm sm:max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/logo/purplesoft-logo-main.png"
            alt="PurpleSoftHub"
            width={180}
            height={54}
            className="mx-auto mb-5"
            priority
          />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Create your account
          </h1>
          <p className="text-sm sm:text-base" style={{ color: '#9ca3af' }}>
            Join PurpleSoftHub and start your project
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 space-y-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          {/* Error message */}
          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 hover:opacity-90"
            style={{ background: '#ffffff', color: '#111827' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(124,58,237,0.2)' }} />
            <span className="text-sm" style={{ color: '#6b7280' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(124,58,237,0.2)' }} />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  color: '#ffffff',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.7)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.25)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  color: '#ffffff',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.7)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.25)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  color: '#ffffff',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.7)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.25)' }}
              />
            </div>
            <button
              onClick={handleSignUp}
              disabled={loading || !email || !password || !fullName}
              className="w-full font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#ffffff',
              }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium hover:underline" style={{ color: '#a855f7' }}>
            Sign in &rarr;
          </Link>
        </p>
      </div>
    </div>
  )
}
