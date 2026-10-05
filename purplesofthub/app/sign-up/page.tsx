'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthView } from '@/components/auth/auth-view'

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
      await fetch('/api/auth/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          email,
          fullName,
        }),
      }).catch((emailError) => {
        console.error('Welcome email notification failed:', emailError)
      })
      setSuccess(true)
      setLoading(false)
    } catch (caught: unknown) {
      const err = caught as { message: string }
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
    } catch (caught: unknown) {
      const err = caught as { message: string }
      setError(err.message || 'Failed to sign up with Google')
      setGoogleLoading(false)
    }
  }

  return <AuthView mode="signup" email={email} setEmail={setEmail} password={password} setPassword={setPassword} fullName={fullName} setFullName={setFullName} loading={loading} googleLoading={googleLoading} error={error} success={success} onAction={handleSignUp} onGoogle={handleGoogleSignUp} />
}
