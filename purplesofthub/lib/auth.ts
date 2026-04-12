import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type AuthSuccess = {
  ok: true
  userId: string
  role: 'admin' | 'client'
}

type AuthFailure = {
  ok: false
  response: NextResponse
}

export async function getAuthenticatedProfile(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('[getAuthenticatedProfile] Session check:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    sessionError: error?.message,
  })

  if (!user || error) {
    console.error('[getAuthenticatedProfile] ❌ No session found:', error?.message)
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Security note: role checks must come from the server-owned profiles table.
  // Never trust auth metadata because users can edit their own metadata.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  console.log('[getAuthenticatedProfile] Profile lookup:', {
    userId: user.id,
    foundProfile: !!profile,
    role: profile?.role,
    profileError: profileError?.message,
  })

  if (profileError || !profile) {
    console.error('[getAuthenticatedProfile] ❌ Profile lookup failed:', {
      userId: user.id,
      profileError: profileError?.message,
      hasProfile: !!profile,
    })

    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return {
    ok: true,
    userId: user.id,
    role: profile.role === 'admin' ? 'admin' : 'client',
  }
}

export async function requireAdmin() {
  const auth = await getAuthenticatedProfile()

  if (!auth.ok) {
    return auth
  }

  if (auth.role !== 'admin') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { ok: true as const, userId: auth.userId }
}
