import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

type AuthSuccess = {
  ok: true
  userId: string
  role: 'admin' | 'client'
  /** Additive display fields (never used for authorization decisions). */
  fullName: string
  email: string
}

type AuthFailure = {
  ok: false
  response: NextResponse
}

/**
 * Get the service-role admin client (bypasses RLS).
 * Returns null if env vars are missing.
 */
function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key, { auth: { autoRefreshToken: false } })
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
    console.error('[getAuthenticatedProfile] ❌ No session:', error?.message)
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Use SERVICE ROLE client for the profile read.
  // This bypasses RLS so we always get the row regardless of
  // what policies are (or aren't) configured on the profiles table.
  // ──────────────────────────────────────────────────────────────
  const admin = getServiceRoleClient()

  let profileRole: string | null = null
  let profileFullName = ''
  let profileEmail = ''

  if (admin) {
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .maybeSingle()

    console.log('[getAuthenticatedProfile] Profile lookup (service role):', {
      userId: user.id,
      foundProfile: !!profile,
      role: profile?.role,
      profileError: profileError?.message,
    })

    profileRole = profile?.role ?? null
    profileFullName = profile?.full_name ?? ''
    profileEmail = profile?.email ?? ''

    // Auto-create profile if it doesn't exist yet
    if (!profile && !profileError) {
      const adminEmails = (process.env.ADMIN_EMAIL || '')
        .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
      const isAdmin = adminEmails.includes((user.email || '').toLowerCase())
      const metadataName: string =
        user.user_metadata?.full_name || user.user_metadata?.name || ''

      const { error: insertError } = await admin.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: metadataName,
        role: isAdmin ? 'admin' : 'client',
      })
      console.log('[getAuthenticatedProfile] Auto-created profile:', {
        userId: user.id,
        role: isAdmin ? 'admin' : 'client',
        insertError: insertError?.message,
      })
      profileRole = isAdmin ? 'admin' : 'client'
      profileFullName = metadataName
      profileEmail = user.email ?? ''
    }
  } else {
    // Fallback: no service role key → try with user client (may fail with RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .maybeSingle()

    console.log('[getAuthenticatedProfile] Profile lookup (user client, no service role):', {
      userId: user.id,
      foundProfile: !!profile,
      role: profile?.role,
      profileError: profileError?.message,
    })

    profileRole = profile?.role ?? null
    profileFullName = profile?.full_name ?? ''
    profileEmail = profile?.email ?? ''
  }

  if (!profileRole) {
    console.error('[getAuthenticatedProfile] ❌ No profile row for user:', user.id)
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  console.log('[getAuthenticatedProfile] ✅ Authenticated:', {
    userId: user.id,
    role: profileRole,
  })

  return {
    ok: true,
    userId: user.id,
    role: profileRole === 'admin' ? 'admin' : 'client',
    fullName:
      profileFullName.trim() ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      '',
    email: profileEmail || user.email || '',
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
