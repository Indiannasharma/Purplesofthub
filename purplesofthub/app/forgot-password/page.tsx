'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'

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
      <div className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-boxdark-2 p-4">
        <div className="w-full max-w-md rounded-2xl border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/Purplesoft-logo-main.png"
                alt="PurpleSoftHub"
                width={140}
                height={40}
                className="mx-auto"
              />
            </Link>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-1">
              Reset Password
            </h2>
            <p className="text-sm text-bodydark2">
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-4">📧</p>
              <p className="font-semibold text-black dark:text-white mb-2">
                Check your email!
              </p>
              <p className="text-sm text-bodydark2 mb-6">
                We sent a password reset link to {email}
              </p>
              <Link href="/sign-in" className="text-primary hover:underline text-sm font-medium">
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                />
              </div>
              <button
                onClick={handleReset}
                disabled={loading || !email}
                className="w-full rounded-lg bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="mt-5 text-center text-sm text-bodydark2">
                Remember your password?{' '}
                <Link href="/sign-in" className="text-primary font-medium hover:underline">
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
