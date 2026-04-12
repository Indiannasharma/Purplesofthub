/**
 * Admin login diagnostic endpoint.
 * Visit /api/auth/debug while signed in to see exactly what the server sees.
 * DELETE THIS FILE after diagnosing.
 */

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const result: Record<string, any> = {}

  // 0. Show ALL cookie names present in the request (to check if auth cookies exist)
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const authCookies = allCookies.filter(c =>
      c.name.includes('auth') || c.name.startsWith('sb-')
    )
    result.cookies = {
      totalCookieCount: allCookies.length,
      allCookieNames: allCookies.map(c => c.name),
      authCookies: authCookies.map(c => ({
        name: c.name,
        valueLength: c.value.length,
        valuePreview: c.value.substring(0, 30) + '...',
      })),
    }
  } catch (err: any) {
    result.cookies = { error: err.message }
  }

  // 1. Check env vars
  result.env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ set' : '❌ missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ set' : '❌ missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ missing',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL
      ? `✅ set → "${process.env.ADMIN_EMAIL}"`
      : '❌ missing',
  }

  // 2. Check session
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      result.session = {
        status: '❌ No session',
        error: error?.message,
        hint: 'If auth cookies are present above but session fails, there may be a token parsing issue',
      }
      // Even without session, check if we can read profiles with service role
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false } }
        )
        const { data: allProfiles } = await adminClient
          .from('profiles')
          .select('id, email, role')
          .limit(10)
        result.allProfilesInDB = allProfiles || []
      }
      return NextResponse.json(result)
    }

    result.session = {
      status: '✅ Logged in',
      userId: user.id,
      email: user.email,
    }

    // 3. Check profile row with USER client (subject to RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, email, full_name')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      result.profileViaUserClient = {
        status: '❌ RLS BLOCKED — this is likely the bug',
        error: profileError.message,
        code: profileError.code,
      }
    } else if (!profile) {
      result.profileViaUserClient = {
        status: '❌ No row found (RLS may be hiding it, or row doesn\'t exist)',
      }
    } else {
      result.profileViaUserClient = {
        status: '✅ readable',
        role: profile.role,
      }
    }

    // 4. Check profile with SERVICE ROLE client (bypasses RLS)
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
          ? { status: '✅', ...adminProfile }
          : { status: '❌ No row exists at all' }
    }

    // 5. Admin email match
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
