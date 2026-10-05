'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthView } from '@/components/auth/auth-view'

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

  return <AuthView mode="forgot" email={email} setEmail={setEmail} loading={loading} error={error} success={sent} onAction={handleReset} />
}
