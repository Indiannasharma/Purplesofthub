'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthView } from '@/components/auth/auth-view'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
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
    } catch (caught: unknown) {
      const err = caught as { message: string }
      setError(err.message || 'Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    if (!email || !password) return
    setLoading(true)
      setError('')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      await fetch('/api/auth/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(data.session?.access_token
            ? { Authorization: `Bearer ${data.session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ type: 'login' }),
      }).catch((emailError) => {
        console.error('Login email notification failed:', emailError)
      })
      await new Promise(r => setTimeout(r, 300))
      const roleResponse = await fetch('/api/auth/role')
      const roleData = await roleResponse.json().catch(() => null)
      if (roleResponse.ok && roleData?.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (caught: unknown) {
      const err = caught as { message: string }
      setError(err.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  return <AuthView mode="signin" email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} googleLoading={googleLoading} error={error} onAction={handleEmailSignIn} onGoogle={handleGoogleSignIn} />
}
