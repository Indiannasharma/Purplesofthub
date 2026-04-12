/**
 * Admin login diagnostic endpoint.
 * Visit this URL while logged in to see exactly what the server sees.
 *
 * Usage: GET /api/auth/debug
 *
 * DELETE THIS FILE after diagnosing. It exposes internal info.
 */

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const result: Record<string, any> = {}

  // 1. Check env vars (redacted)
  result.env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ set' : '❌ missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ set' : '❌ missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ missing',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL
      ? `✅ set → "${process.env.ADMIN_EMAIL}"`
      : '❌ missing — admin auto-promotion will NOT work',
  }

  // 2. Check session
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      result.session = { status: '❌ No session — not logged in', error: error?.message }
      return NextResponse.json(result)
    }

    result.session = {
      status: '✅ Logged in',
      userId: user.id,
      email: user.email,
    }

    // 3. Check profile row
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, email, full_name')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      result.profile = { status: '❌ Query error', error: profileError.message, hint: 'RLS may be blocking reads' }
    } else if (!profile) {
      result.profile = { status: '❌ No profile row found', hint: 'Profile was never created — DB trigger may not have fired' }
    } else {
      result.profile = {
        status: profile.role === 'admin' ? '✅ admin' : '⚠️ NOT admin (role is ' + profile.role + ')',
        ...profile,
      }
    }

    // 4. Check with service role (bypasses RLS)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false } }
      )
      const { data: adminProfile, error: adminProfileError } = await adminClient
        .from('profiles')
        .select('id, role, email, full_name')
        .eq('id', user.id)
        .maybeSingle()

      result.profileViaServiceRole = adminProfileError
        ? { status: '❌ Error', error: adminProfileError.message }
        : adminProfile
          ? { status: adminProfile.role === 'admin' ? '✅ admin' : '⚠️ role=' + adminProfile.role, ...adminProfile }
          : { status: '❌ No row found even with service role' }
    }

    // 5. Check ADMIN_EMAIL match
    const adminEmails = (process.env.ADMIN_EMAIL || '')
      .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    result.adminEmailMatch = {
      userEmail: user.email,
      adminEmailsConfigured: adminEmails,
      matches: adminEmails.includes((user.email || '').toLowerCase()),
    }

  } catch (err: any) {
    result.error = err.message
  }

  return NextResponse.json(result, { status: 200 })
}
