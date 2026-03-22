'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleReset = async () => {
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: '#060311' }}
    >
      <div className="w-full max-w-sm sm:max-w-md">

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
            Reset your password
          </h1>
          <p className="text-sm sm:text-base" style={{ color: '#9ca3af' }}>
            {sent
              ? 'Check your email for a reset link.'
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 space-y-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
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

          {sent ? (
            <p className="text-center text-sm" style={{ color: '#a855f7' }}>
              Email sent! Check your inbox.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
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
                onClick={handleReset}
                disabled={loading || !email}
                className="w-full font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#ffffff',
                }}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
          <Link href="/sign-in" className="font-medium hover:underline" style={{ color: '#a855f7' }}>
            &larr; Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
